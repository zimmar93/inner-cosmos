import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/lead.dto';

@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) {}

    /** Public: Store-frontend submits contact form / newsletter */
    @Post()
    create(@Body() body: CreateLeadDto) {
        return this.leadsService.create(body);
    }

    /** Protected: ERP dashboard views all leads */
    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Query('status') status?: string) {
        return this.leadsService.findAll(status);
    }

    /** Protected: Mark a lead as read */
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/read')
    markRead(@Param('id') id: string) {
        return this.leadsService.markRead(id);
    }

    /** Protected: Delete a lead */
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.leadsService.delete(id);
    }
}
