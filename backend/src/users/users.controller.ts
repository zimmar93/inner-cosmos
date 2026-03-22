import {
    Controller,
    Get,
    Put,
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
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateCustomerDto } from './dto/user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'List all users (Admin/Staff)' })
    findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
        return this.usersService.findAll(+page, +limit);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get my user profile' })
    getMe(@CurrentUser() user: any) {
        return this.usersService.findOne(user.id);
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    @ApiOperation({ summary: 'Get user by ID (Admin/Staff)' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update user (Admin)' })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Patch('me/customer')
    @ApiOperation({ summary: 'Update my customer profile' })
    updateMyCustomer(@CurrentUser() user: any, @Body() dto: UpdateCustomerDto) {
        return this.usersService.updateCustomer(user.id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete user (Admin)' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
