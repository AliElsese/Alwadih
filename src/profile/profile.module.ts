import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller.js';
import { ProfileService } from './services/profile.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: User.name,
            schema: UserSchema,
        }]),
    ],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule { }