import { Module } from '@nestjs/common';
import { SupportController } from './controllers/support.controller.js';
import { SupportService } from './services/support.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportRequest, SupportRequestSchema } from './schemas/support-request.schema.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: SupportRequest.name,
            schema: SupportRequestSchema
        }]),
        MailModule,
    ],
    controllers: [SupportController],
    providers: [SupportService],
})

export class SupportModule { }