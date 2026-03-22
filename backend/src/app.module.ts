import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ContentModule } from './content/content.module';
import { CategoriesModule } from './categories/categories.module';
import { PagesModule } from './pages/pages.module';
import { LeadsModule } from './leads/leads.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        UsersModule,
        ProductsModule,
        InventoryModule,
        OrdersModule,
        PaymentsModule,
        InvoicesModule,
        ContentModule,
        CategoriesModule,
        PagesModule,
        LeadsModule,
        TemplatesModule,
    ],
})
export class AppModule { }

