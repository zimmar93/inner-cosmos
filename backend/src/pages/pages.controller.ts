import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    @Get()
    findAll(@Query('status') status?: string) {
        return this.pagesService.findAll(status);
    }

    @Get('homepage')
    findHomepage() {
        return this.pagesService.findHomepage();
    }

    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.pagesService.findBySlug(slug);
    }

    @Get('id/:id')
    findById(@Param('id') id: string) {
        return this.pagesService.findById(id);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'STAFF')
    create(@Body() body: CreatePageDto) {
        return this.pagesService.create(body);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'STAFF')
    update(@Param('id') id: string, @Body() body: UpdatePageDto) {
        return this.pagesService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.pagesService.remove(id);
    }
}
