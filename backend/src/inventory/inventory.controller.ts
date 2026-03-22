import {
    Controller,
    Get,
    Post,
    Patch,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { AdjustStockDto, SetStockDto } from './dto/inventory.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
@ApiBearerAuth()
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    @ApiOperation({ summary: 'Get all inventory' })
    findAll() {
        return this.inventoryService.findAll();
    }

    @Get('low-stock')
    @ApiOperation({ summary: 'Get products with low stock' })
    @ApiQuery({ name: 'threshold', required: false, type: Number })
    getLowStock(@Query('threshold') threshold = 10) {
        return this.inventoryService.getLowStock(+threshold);
    }

    @Get(':productId')
    @ApiOperation({ summary: 'Get inventory for a specific product' })
    findByProduct(@Param('productId') productId: string) {
        return this.inventoryService.findByProduct(productId);
    }

    @Patch(':productId/adjust')
    @ApiOperation({ summary: 'Adjust stock by quantity (positive or negative)' })
    adjustStock(
        @Param('productId') productId: string,
        @Body() dto: AdjustStockDto,
    ) {
        return this.inventoryService.adjustStock(productId, dto);
    }

    @Put(':productId/set')
    @ApiOperation({ summary: 'Set exact stock quantity' })
    setStock(
        @Param('productId') productId: string,
        @Body() dto: SetStockDto,
    ) {
        return this.inventoryService.setStock(productId, dto);
    }
}
