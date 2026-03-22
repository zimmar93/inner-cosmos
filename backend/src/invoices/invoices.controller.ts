import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
@ApiBearerAuth()
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new invoice' })
    create(@Body() dto: CreateInvoiceDto) {
        return this.invoicesService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all invoices' })
    @ApiQuery({ name: 'status', required: false })
    findAll(@Query('status') status?: string) {
        return this.invoicesService.findAll(status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get invoice by ID' })
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an invoice' })
    update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
        return this.invoicesService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete an invoice (Admin only)' })
    remove(@Param('id') id: string) {
        return this.invoicesService.remove(id);
    }

    @Post(':id/duplicate')
    @ApiOperation({ summary: 'Duplicate an invoice' })
    duplicate(@Param('id') id: string) {
        return this.invoicesService.duplicate(id);
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Update invoice status' })
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.invoicesService.updateStatus(id, status);
    }
}
