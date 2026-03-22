import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.pageTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async findOne(id: string) {
        return this.prisma.pageTemplate.findUnique({ where: { id } });
    }

    async create(data: { name: string; category?: string; blocks: any; thumbnail?: string }) {
        return this.prisma.pageTemplate.create({ data });
    }

    async delete(id: string) {
        return this.prisma.pageTemplate.delete({ where: { id } });
    }
}
