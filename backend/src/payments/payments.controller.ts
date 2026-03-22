import {
    Controller,
    Post,
    Body,
    Param,
    Headers,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('intent/:orderId')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create Stripe payment intent for an order' })
    createIntent(@Param('orderId') orderId: string, @CurrentUser() user: any) {
        return this.paymentsService.createPaymentIntent(orderId, user.id);
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Stripe webhook endpoint (raw body required)' })
    handleWebhook(
        @Req() req: Request,
        @Headers('stripe-signature') sig: string,
    ) {
        return this.paymentsService.handleWebhook(req.body as Buffer, sig);
    }
}
