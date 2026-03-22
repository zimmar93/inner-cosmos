import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
        private readonly invoicesService: InvoicesService,
    ) {
        this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }

    async createPaymentIntent(orderId: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: { include: { user: true } },
                payment: true,
            },
        });

        if (!order) throw new NotFoundException(`Order ${orderId} not found`);

        // Verify order belongs to this user
        if (order.customer.userId !== userId) {
            throw new BadRequestException('You do not own this order');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Order is not in PENDING status');
        }

        const amountInCents = Math.round(Number(order.totalAmount) * 100);

        const intent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: { orderId: order.id, customerId: order.customerId },
        });

        // Update order with Stripe Payment Intent ID
        await this.prisma.order.update({
            where: { id: orderId },
            data: { stripePaymentIntentId: intent.id },
        });

        if (order.payment) {
            await this.prisma.payment.update({
                where: { orderId },
                data: { stripeId: intent.id },
            });
        }

        this.logger.log(`Payment intent created: ${intent.id} for order ${orderId}`);
        return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
    }

    async handleWebhook(rawBody: Buffer, signature: string) {
        const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook error: ${err.message}`);
        }

        this.logger.log(`Stripe webhook received: ${event.type}`);

        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                break;

            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    }

    private async handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
        const orderId = intent.metadata.orderId;
        this.logger.log(`Payment succeeded for order: ${orderId}`);

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: true,
                customer: { include: { user: true } },
            },
        });
        if (!order) {
            this.logger.error(`Order ${orderId} not found for webhook`);
            return;
        }

        await this.prisma.$transaction(async (tx) => {
            // 1) Mark order as PAID
            await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.PAID },
            });

            // 2) Update payment record
            await tx.payment.update({
                where: { orderId },
                data: {
                    status: PaymentStatus.SUCCEEDED,
                    stripeId: intent.id,
                },
            });

            // 3) Deduct actual inventory (release reservation + reduce available)
            for (const item of order.orderItems) {
                await tx.inventory.update({
                    where: { productId: item.productId },
                    data: {
                        quantityAvailable: { decrement: item.quantity },
                        reservedQuantity: { decrement: item.quantity },
                    },
                });
            }
        });

        // Invoice is now created manually via the Invoices module (standalone)

        this.logger.log(`Order ${orderId} processed: PAID, stock deducted`);
    }

    private async handlePaymentFailed(intent: Stripe.PaymentIntent) {
        const orderId = intent.metadata.orderId;
        this.logger.warn(`Payment failed for order: ${orderId}`);

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true },
        });
        if (!order) return;

        await this.prisma.$transaction(async (tx) => {
            // Update payment status
            await tx.payment.update({
                where: { orderId },
                data: { status: PaymentStatus.FAILED },
            });

            // Release reserved stock
            for (const item of order.orderItems) {
                await tx.inventory.update({
                    where: { productId: item.productId },
                    data: { reservedQuantity: { decrement: item.quantity } },
                });
            }

            // Cancel the order
            await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.CANCELLED },
            });
        });

        this.logger.log(`Order ${orderId}: payment failed, stock released, order cancelled`);
    }
}
