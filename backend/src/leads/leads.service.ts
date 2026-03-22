import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
    constructor(private prisma: PrismaService) {}

    async create(data: { name?: string; email: string; phone?: string; message?: string; source?: string; page?: string }) {
        return this.prisma.lead.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message,
                source: data.source || 'contact-form',
                page: data.page,
            },
        });
    }

    async findAll(status?: string) {
        return this.prisma.lead.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }

    async markRead(id: string) {
        return this.prisma.lead.update({ where: { id }, data: { status: 'read' } });
    }

    async delete(id: string) {
        return this.prisma.lead.delete({ where: { id } });
    }
}
