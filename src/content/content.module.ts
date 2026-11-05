import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './controllers/content.controller.js';
import { ContentService } from './services/content.service.js';
import { Faq, FaqSchema } from './schemas/faq.schema.js';
import { PrivacyPolicy, PrivacyPolicySchema } from './schemas/privacy-policy.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Faq.name,
                schema: FaqSchema,
            },
            {
                name: PrivacyPolicy.name,
                schema: PrivacyPolicySchema,
            },
        ]),
    ],
    controllers: [ContentController],
    providers: [ContentService],
    exports: [ContentService],
})
export class ContentModule { }

