import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/template.dto';

@Controller('templates')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) {}

    /** Public: list all templates */
    @Get()
    findAll() {
        return this.templatesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.templatesService.findOne(id);
    }

    /** Protected: save a new template */
    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() body: CreateTemplateDto) {
        return this.templatesService.create(body);
    }

    /** Protected: delete a template */
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.templatesService.delete(id);
    }
}
