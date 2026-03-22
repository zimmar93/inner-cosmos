import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new product (Admin/Staff only)' })
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products (paginated)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
    @ApiQuery({ name: 'categoryId', required: false, type: String })
    findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('activeOnly') activeOnly: string | boolean = false,
        @Query('categoryId') categoryId?: string,
    ) {
        return this.productsService.findAll(+page, +limit, activeOnly === 'true' || activeOnly === true, categoryId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update product (Admin/Staff only)' })
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Deactivate product (Admin only)' })
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}
