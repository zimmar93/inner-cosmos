import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const rows = await this.prisma.siteContent.findMany();
        const result: Record<string, any> = {};
        for (const row of rows) {
            result[row.section] = row.content;
        }
        return result;
    }

    async findOne(section: string) {
        const row = await this.prisma.siteContent.findUnique({ where: { section } });
        return row?.content ?? null;
    }

    async upsert(section: string, content: any) {
        return this.prisma.siteContent.upsert({
            where: { section },
            update: { content },
            create: { section, content },
        });
    }

    async remove(section: string) {
        return this.prisma.siteContent.delete({ where: { section } }).catch(() => null);
    }
}
