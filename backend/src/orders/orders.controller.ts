import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Place a new order (Customer only)' })
    create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
        return this.ordersService.create(dto, user.id);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Get all orders (Admin/Staff only)' })
    findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
        return this.ordersService.findAll(+page, +limit);
    }

    @Get('dashboard')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Get dashboard metrics (Admin/Staff only)' })
    getDashboard() {
        return this.ordersService.getDashboardMetrics();
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my orders (Customer)' })
    findMyOrders(
        @CurrentUser() user: any,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.ordersService.findMyOrders(user.id, +page, +limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.ordersService.findOne(id, user.id, user.role);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Update order status (Admin/Staff only)' })
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }

    @Delete(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel order (releases reserved stock)' })
    cancelOrder(@Param('id') id: string, @CurrentUser() user: any) {
        return this.ordersService.cancelOrder(id, user.id, user.role);
    }
}
