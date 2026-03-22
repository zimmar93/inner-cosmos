import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus, Role } from '@prisma/client';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateOrderDto, userId: string) {
        // Get customer record
        const customer = await this.prisma.customer.findUnique({
            where: { userId },
        });
        if (!customer) {
            throw new ForbiddenException('Only customers can place orders');
        }

        return this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsData = [];

            for (const item of dto.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    include: { inventory: true },
                });
                if (!product || !product.isActive) {
                    throw new NotFoundException(`Product ${item.productId} not found or inactive`);
                }

                // Check available stock (excluding reserved)
                const available =
                    product.inventory.quantityAvailable - product.inventory.reservedQuantity;
                if (available < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for "${product.name}". Available: ${available}, Requested: ${item.quantity}`,
                    );
                }

                // Reserve stock
                await tx.inventory.update({
                    where: { productId: item.productId },
                    data: { reservedQuantity: { increment: item.quantity } },
                });

                const itemPrice = Number(product.price);
                totalAmount += itemPrice * item.quantity;
                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: itemPrice,
                });
            }

            // Create the order
            const order = await tx.order.create({
                data: {
                    customerId: customer.id,
                    totalAmount,
                    paymentMethod: dto.paymentMethod || 'STRIPE',
                    status: dto.paymentMethod === 'COD' ? OrderStatus.PENDING : OrderStatus.PENDING,
                    orderItems: { create: orderItemsData },
                    payment: {
                        create: {
                            status: 'PENDING',
                            amount: totalAmount,
                        },
                    },
                },
                include: {
                    orderItems: { include: { product: true } },
                    payment: true,
                },
            });

            this.logger.log(`Order created: ${order.id} for customer ${customer.id}`);
            return order;
        });
    }

    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                skip,
                take: limit,
                include: {
                    orderItems: { include: { product: { select: { name: true, sku: true } } } },
                    customer: { include: { user: { select: { email: true } } } },
                    payment: true,
                    invoice: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count(),
        ]);
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }

    async findMyOrders(userId: string, page = 1, limit = 20) {
        const customer = await this.prisma.customer.findUnique({ where: { userId } });
        if (!customer) return { data: [], total: 0 };

        const skip = (page - 1) * limit;
        const where = { customerId: customer.id };
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    orderItems: { include: { product: { select: { name: true, imageUrl: true } } } },
                    payment: true,
                    invoice: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }

    async findOne(id: string, userId?: string, userRole?: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: { include: { product: true } },
                customer: { include: { user: { select: { email: true } } } },
                payment: true,
                invoice: true,
            },
        });
        if (!order) throw new NotFoundException(`Order ${id} not found`);

        // Customers can only see their own orders
        if (userRole === Role.CUSTOMER) {
            const customer = await this.prisma.customer.findUnique({ where: { userId } });
            if (!customer || order.customerId !== customer.id) {
                throw new ForbiddenException('You do not have access to this order');
            }
        }
        return order;
    }

    async updateStatus(id: string, dto: UpdateOrderStatusDto) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundException(`Order ${id} not found`);

        return this.prisma.order.update({
            where: { id },
            data: { status: dto.status as OrderStatus },
        });
    }

    async cancelOrder(id: string, userId: string, userRole: string) {
        const order = await this.findOne(id, userId, userRole);

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Only PENDING orders can be cancelled');
        }

        return this.prisma.$transaction(async (tx) => {
            // Release reserved stock
            for (const item of order.orderItems) {
                await tx.inventory.update({
                    where: { productId: item.productId },
                    data: { reservedQuantity: { decrement: item.quantity } },
                });
            }

            return tx.order.update({
                where: { id },
                data: { status: OrderStatus.CANCELLED },
            });
        });
    }

    async getDashboardMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalOrders, ordersToday, totalRevenue, pendingOrders] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { createdAt: { gte: today } } }),
            this.prisma.order.aggregate({
                where: { status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED] } },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        ]);

        const lowStock = await this.prisma.inventory.count({
            where: { quantityAvailable: { lte: 10 } },
        });

        return {
            totalOrders,
            ordersToday,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            pendingOrders,
            lowStockCount: lowStock,
        };
    }
}
