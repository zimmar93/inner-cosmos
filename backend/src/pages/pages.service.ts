import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
    constructor(private prisma: PrismaService) { }

    async findAll(status?: string) {
        const where = status ? { status } : {};
        return this.prisma.page.findMany({
            where,
            orderBy: [{ isHomepage: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.page.findUnique({ where: { slug } });
    }

    async findById(id: string) {
        return this.prisma.page.findUnique({ where: { id } });
    }

    async findHomepage() {
        return this.prisma.page.findFirst({ where: { isHomepage: true } });
    }

    async create(data: { title: string; slug: string; blocks?: any; seo?: any; status?: string; isHomepage?: boolean }) {
        const slug = this.sanitizeSlug(data.slug);

        const existing = await this.prisma.page.findUnique({ where: { slug } });
        if (existing) throw new BadRequestException('A page with this slug already exists');

        if (data.isHomepage) {
            await this.prisma.page.updateMany({ where: { isHomepage: true }, data: { isHomepage: false } });
        }

        return this.prisma.page.create({
            data: {
                title: data.title,
                slug,
                blocks: data.blocks || [],
                seo: data.seo || {},
                status: data.status || 'draft',
                isHomepage: data.isHomepage || false,
            },
        });
    }

    async update(id: string, data: { title?: string; slug?: string; blocks?: any; seo?: any; status?: string; isHomepage?: boolean; sortOrder?: number }) {
        if (data.slug) {
            data.slug = this.sanitizeSlug(data.slug);
            const existing = await this.prisma.page.findFirst({ where: { slug: data.slug, NOT: { id } } });
            if (existing) throw new BadRequestException('A page with this slug already exists');
        }

        if (data.isHomepage) {
            await this.prisma.page.updateMany({ where: { isHomepage: true, NOT: { id } }, data: { isHomepage: false } });
        }

        return this.prisma.page.update({ where: { id }, data });
    }

    async remove(id: string) {
        const page = await this.prisma.page.findUnique({ where: { id } });
        if (!page) throw new BadRequestException('Page not found');
        if (page.isHomepage) throw new BadRequestException('Cannot delete the homepage');
        return this.prisma.page.delete({ where: { id } });
    }

    private sanitizeSlug(slug: string): string {
        return slug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
}
