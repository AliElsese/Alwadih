import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { AdminAuthService } from './services/admin-auth.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { MailModule } from '../mail/mail.module.js';
import { AdminAuthController } from './controllers/admin-auth.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: User.name,
            schema: UserSchema
        }]),
        MailModule,
    ],
    controllers: [AuthController, AdminAuthController],
    providers: [AuthService, AdminAuthService],
})
export class AuthModule { }
