import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCategoryDto) {
        const exists = await this.prisma.category.findUnique({ where: { name: dto.name } });
        if (exists) {
            throw new ConflictException('Category with this name already exists');
        }

        return this.prisma.category.create({
            data: dto,
        });
    }

    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
}
