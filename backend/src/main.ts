import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // Raw body for Stripe webhook verification (must be before global middleware)
    app.use('/payments/webhook', bodyParser.raw({ type: 'application/json' }));

    // Increase JSON payload limit to 20mb (for base64 image uploads up to 10MB + base64 overhead)
    app.use(bodyParser.json({ limit: '20mb' }));
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

    // CORS
    app.enableCors({
        origin: (origin, callback) => {
            // Allow if no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            const allowedPatterns = [
                /^http:\/\/localhost:\d+$/,
                /\.vercel\.app$/,
                /zimmar-frontend\.vercel\.app$/
            ];

            const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
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
            .setDescription('Production-ready ERP + E-Commerce API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
        logger.log('Swagger docs available at /api/docs');
    }

    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`Application running on port ${port}`);
}

bootstrap();
