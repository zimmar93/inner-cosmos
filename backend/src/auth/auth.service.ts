import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
                role: dto.role || 'CUSTOMER',
                customer:
                    dto.role === 'CUSTOMER' || !dto.role
                        ? {
                            create: {
                                company: dto.company,
                                phone: dto.phone,
                                address: dto.address,
                            },
                        }
                        : undefined,
            },
            include: { customer: true },
        });

        this.logger.log(`User registered: ${user.email} (${user.role})`);
        const token = this.generateToken(user);
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken: token };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { customer: true },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`User logged in: ${user.email}`);
        const token = this.generateToken(user);
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken: token };
    }

    private generateToken(user: { id: string; email: string; role: string }) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.sign(payload, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: this.config.get<string>('JWT_EXPIRES_IN') || '7d',
        });
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                customer: true,
            },
        });
        return user;
    }
}
