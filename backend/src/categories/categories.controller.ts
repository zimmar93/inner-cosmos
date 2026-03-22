import { Controller, Get, Post, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/category.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new product category' })
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all product categories' })
    async findAll() {
        return this.categoriesService.findAll();
    }
}
