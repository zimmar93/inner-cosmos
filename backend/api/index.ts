import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

async function createNestServer(expressInstance: express.Express) {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );

    // Raw body for Stripe webhook verification
    app.use('/api/v1/payments/webhook', bodyParser.raw({ type: 'application/json' }));

    // Increase JSON payload limit to 20mb (for base64 image uploads up to 10MB + base64 overhead)
    app.use(express.json({ limit: '20mb' }));
    app.use(express.urlencoded({ limit: '20mb', extended: true }));

    // CORS - allow all for now to ensure Vercel works, restrict in production
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // API prefix
    app.setGlobalPrefix('api/v1');

    // Swagger docs
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Inner Cosmos ERP API')
            .setDescription('Production-ready ERP + E-Commerce API (Serverless)')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    await app.init();
    return app;
}

let cachedServer: any;

export default async (req: any, res: any) => {
    if (!cachedServer) {
        const app = await createNestServer(server);
        cachedServer = app.getHttpAdapter().getInstance();
    }
    return cachedServer(req, res);
};
