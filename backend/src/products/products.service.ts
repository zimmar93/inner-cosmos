import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateProductDto) {
        const exists = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
        if (exists) throw new ConflictException(`SKU "${dto.sku}" already exists`);

        const product = await this.prisma.product.create({
            data: {
                name: dto.name,
                description: dto.description,
                sku: dto.sku,
                price: dto.price,
                purchasePrice: dto.purchasePrice,
                wholesalePrice: dto.wholesalePrice,
                imageUrl: dto.imageUrl,
                categoryId: dto.categoryId || undefined,
                inventory: {
                    create: {
                        quantityAvailable: dto.initialStock ?? 0,
                        reservedQuantity: 0,
                    },
                },
            },
            include: { inventory: true, category: true },
        });

        this.logger.log(`Product created: ${product.name} (${product.sku})`);
        return product;
    }

    async findAll(page = 1, limit = 20, activeOnly = false, categoryId?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (activeOnly) {
            where.isActive = true;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: { inventory: true, category: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { inventory: true, category: true },
        });
        if (!product) throw new NotFoundException(`Product ${id} not found`);
        return product;
    }

    async update(id: string, dto: UpdateProductDto) {
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data: dto,
            include: { inventory: true, category: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
        return { message: 'Product deactivated successfully' };
    }
}
