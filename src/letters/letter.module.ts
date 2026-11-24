import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Letter, LetterSchema } from './schemas/letter.schema.js';
import { LetterService } from './services/letter.service.js';
import { LetterController } from './controllers/letter.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Letter.name, schema: LetterSchema },
        ]),
    ],
    controllers: [LetterController],
    providers: [LetterService],
    exports: [LetterService, MongooseModule],
})
export class LetterModule { }
