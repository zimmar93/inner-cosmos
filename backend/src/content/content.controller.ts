import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpsertContentDto } from './dto/content.dto';

@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    @Get()
    findAll() {
        return this.contentService.findAll();
    }

    @Get(':section')
    findOne(@Param('section') section: string) {
        return this.contentService.findOne(section);
    }

    @Put(':section')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN', 'STAFF')
    upsert(@Param('section') section: string, @Body() body: UpsertContentDto) {
        return this.contentService.upsert(section, body.content);
    }

    @Delete(':section')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    remove(@Param('section') section: string) {
        return this.contentService.remove(section);
    }
}
