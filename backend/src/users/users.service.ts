import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UpdateCustomerDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    customer: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                customer: true,
            },
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        await this.findOne(id);
        const data: any = { ...dto };
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 12);
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, email: true, role: true, createdAt: true },
        });
    }

    async updateCustomer(userId: string, dto: UpdateCustomerDto) {
        const customer = await this.prisma.customer.findUnique({ where: { userId } });
        if (!customer) throw new NotFoundException('Customer profile not found');
        return this.prisma.customer.update({
            where: { userId },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
}
