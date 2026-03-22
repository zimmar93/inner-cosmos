import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
    private readonly logger = new Logger(InvoicesService.name);

    constructor(private readonly prisma: PrismaService) { }

    private calculateTotals(items: { description: string; quantity: number; unitPrice: number; taxRate?: number }[], discountType: string, discountValue: number, taxRate: number, shippingCost: number) {
        let subtotal = 0;
        let totalTax = 0;
        const processedItems = items.map(item => {
            const net = item.quantity * item.unitPrice;
            const itemTax = net * ((item.taxRate ?? 0) / 100);
            subtotal += net;
            totalTax += itemTax;
            return { ...item, lineTotal: net + itemTax, taxRate: item.taxRate ?? 0 };
        });

        let discountAmount = 0;
        if (discountType === 'PERCENT') {
            discountAmount = subtotal * (discountValue / 100);
        } else {
            discountAmount = discountValue;
        }

        const afterDiscount = subtotal - discountAmount;
        const grandTotal = afterDiscount + totalTax + shippingCost;

        return { subtotal, grandTotal: Math.max(0, grandTotal), processedItems };
    }

    private async generateInvoiceNumber(): Promise<string> {
        const lastInvoice = await this.prisma.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { invoiceNumber: true },
        });

        let nextNum = 1;
        if (lastInvoice?.invoiceNumber) {
            const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
            if (match) nextNum = parseInt(match[1], 10) + 1;
        }

        return `INV-${String(nextNum).padStart(4, '0')}`;
    }

    async create(dto: CreateInvoiceDto) {
        const invoiceNumber = await this.generateInvoiceNumber();

        const { subtotal, grandTotal, processedItems } = this.calculateTotals(
            dto.items,
            dto.discountType || 'FIXED',
            dto.discountValue || 0,
            dto.taxRate || 0,
            dto.shippingCost || 0,
        );

        const invoice = await this.prisma.invoice.create({
            data: {
                invoiceNumber,
                issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
                dueDate: new Date(dto.dueDate),
                senderName: dto.senderName,
                senderAddress: dto.senderAddress,
                senderPhone: dto.senderPhone,
                senderEmail: dto.senderEmail,
                clientName: dto.clientName,
                clientCompany: dto.clientCompany,
                clientAddress: dto.clientAddress,
                clientEmail: dto.clientEmail,
                clientPhone: dto.clientPhone,
                discountType: (dto.discountType as any) || 'FIXED',
                discountValue: dto.discountValue || 0,
                taxRate: dto.taxRate || 0,
                shippingCost: dto.shippingCost || 0,
                subtotal,
                grandTotal,
                paymentTerms: dto.paymentTerms,
                paymentMethods: dto.paymentMethods,
                bankDetails: dto.bankDetails,
                lateFeePolicy: dto.lateFeePolicy,
                notes: dto.notes,
                items: {
                    create: processedItems.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        taxRate: item.taxRate,
                        lineTotal: item.lineTotal,
                    })),
                },
            },
            include: { items: true },
        });

        this.logger.log(`Invoice created: ${invoiceNumber}`);
        return invoice;
    }

    async findAll(status?: string) {
        const where: any = {};
        if (status) where.status = status;

        return this.prisma.invoice.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
        return invoice;
    }

    async update(id: string, dto: UpdateInvoiceDto) {
        const existing = await this.findOne(id);

        // Recalculate totals if items are being updated
        let financials: any = {};
        if (dto.items) {
            const { subtotal, grandTotal, processedItems } = this.calculateTotals(
                dto.items,
                dto.discountType || existing.discountType,
                dto.discountValue ?? Number(existing.discountValue),
                dto.taxRate ?? Number(existing.taxRate),
                dto.shippingCost ?? Number(existing.shippingCost),
            );
            financials = { subtotal, grandTotal };

            // Delete old items and create new
            await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
            await this.prisma.invoiceItem.createMany({
                data: processedItems.map(item => ({
                    invoiceId: id,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate,
                    lineTotal: item.lineTotal,
                })),
            });
        } else if (dto.discountType !== undefined || dto.discountValue !== undefined || dto.taxRate !== undefined || dto.shippingCost !== undefined) {
            // Recalculate with existing items but new financial params
            const items = existing.items.map(i => ({ quantity: i.quantity, unitPrice: Number(i.unitPrice), taxRate: Number(i.taxRate), description: i.description }));
            const { subtotal, grandTotal } = this.calculateTotals(
                items,
                dto.discountType || existing.discountType,
                dto.discountValue ?? Number(existing.discountValue),
                dto.taxRate ?? Number(existing.taxRate),
                dto.shippingCost ?? Number(existing.shippingCost),
            );
            financials = { subtotal, grandTotal };
        }

        const { items: _, ...updateData } = dto;

        return this.prisma.invoice.update({
            where: { id },
            data: {
                ...updateData,
                ...(updateData.dueDate ? { dueDate: new Date(updateData.dueDate) } : {}),
                ...(updateData.issueDate ? { issueDate: new Date(updateData.issueDate) } : {}),
                ...financials,
                discountType: (updateData.discountType as any) || undefined,
                status: (updateData.status as any) || undefined,
            },
            include: { items: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.invoice.delete({ where: { id } });
        return { message: 'Invoice deleted successfully' };
    }

    async duplicate(id: string) {
        const source = await this.findOne(id);
        const invoiceNumber = await this.generateInvoiceNumber();

        const invoice = await this.prisma.invoice.create({
            data: {
                invoiceNumber,
                dueDate: source.dueDate,
                senderName: source.senderName,
                senderAddress: source.senderAddress,
                senderPhone: source.senderPhone,
                senderEmail: source.senderEmail,
                clientName: source.clientName,
                clientCompany: source.clientCompany,
                clientAddress: source.clientAddress,
                clientEmail: source.clientEmail,
                clientPhone: source.clientPhone,
                discountType: source.discountType,
                discountValue: source.discountValue,
                taxRate: source.taxRate,
                shippingCost: source.shippingCost,
                subtotal: source.subtotal,
                grandTotal: source.grandTotal,
                paymentTerms: source.paymentTerms,
                paymentMethods: source.paymentMethods,
                bankDetails: source.bankDetails,
                lateFeePolicy: source.lateFeePolicy,
                notes: source.notes,
                items: {
                    create: source.items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        taxRate: item.taxRate,
                        lineTotal: item.lineTotal,
                    })),
                },
            },
            include: { items: true },
        });

        this.logger.log(`Invoice duplicated: ${source.invoiceNumber} → ${invoiceNumber}`);
        return invoice;
    }

    async updateStatus(id: string, status: string) {
        await this.findOne(id);
        return this.prisma.invoice.update({
            where: { id },
            data: { status: status as any },
            include: { items: true },
        });
    }
}
