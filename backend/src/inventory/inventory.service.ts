import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto, SetStockDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.inventory.findMany({
            include: {
                product: { select: { id: true, name: true, sku: true, isActive: true } },
            },
        });
    }

    async findByProduct(productId: string) {
        const inv = await this.prisma.inventory.findUnique({
            where: { productId },
            include: { product: true },
        });
        if (!inv) throw new NotFoundException(`Inventory for product ${productId} not found`);
        return inv;
    }

    async getLowStock(threshold = 10) {
        return this.prisma.inventory.findMany({
            where: { quantityAvailable: { lte: threshold } },
            include: { product: { select: { id: true, name: true, sku: true } } },
        });
    }

    async adjustStock(productId: string, dto: AdjustStockDto) {
        const inv = await this.prisma.inventory.findUnique({ where: { productId } });
        if (!inv) throw new NotFoundException(`Inventory for product ${productId} not found`);

        const newQty = inv.quantityAvailable + dto.quantity;
        if (newQty < 0) {
            throw new BadRequestException(
                `Cannot reduce stock below 0. Current: ${inv.quantityAvailable}, Adjustment: ${dto.quantity}`,
            );
        }

        return this.prisma.inventory.update({
            where: { productId },
            data: { quantityAvailable: newQty },
            include: { product: { select: { name: true, sku: true } } },
        });
    }

    async setStock(productId: string, dto: SetStockDto) {
        const inv = await this.prisma.inventory.findUnique({ where: { productId } });
        if (!inv) throw new NotFoundException(`Inventory for product ${productId} not found`);

        return this.prisma.inventory.update({
            where: { productId },
            data: { quantityAvailable: dto.quantityAvailable },
            include: { product: { select: { name: true, sku: true } } },
        });
    }

    // Internal: Reserve stock during order creation
    async reserveStock(
        productId: string,
        quantity: number,
        tx: any,
    ): Promise<void> {
        const inv = await tx.inventory.findUnique({ where: { productId } });
        if (!inv) throw new NotFoundException(`Inventory for product ${productId} not found`);

        const available = inv.quantityAvailable - inv.reservedQuantity;
        if (available < quantity) {
            throw new BadRequestException(
                `Insufficient stock for product ${productId}. Available: ${available}, Requested: ${quantity}`,
            );
        }

        await tx.inventory.update({
            where: { productId },
            data: { reservedQuantity: { increment: quantity } },
        });
    }

    // Internal: Release reserved stock (on payment failure or cancellation)
    async releaseReservedStock(
        productId: string,
        quantity: number,
        tx: any,
    ): Promise<void> {
        await tx.inventory.update({
            where: { productId },
            data: { reservedQuantity: { decrement: quantity } },
        });
        this.logger.log(`Released ${quantity} units reserved for product ${productId}`);
    }

    // Internal: Deduct stock after confirmed payment
    async deductStock(
        productId: string,
        quantity: number,
        tx: any,
    ): Promise<void> {
        await tx.inventory.update({
            where: { productId },
            data: {
                quantityAvailable: { decrement: quantity },
                reservedQuantity: { decrement: quantity },
            },
        });
        this.logger.log(`Deducted ${quantity} units from product ${productId} after payment`);
    }
}
