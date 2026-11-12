import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartController } from './controllers/part.controller.js';
import { PartService } from './services/part.service.js';
import { Part, PartSchema } from './schemas/part.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Part.name,
                schema: PartSchema,
            },
        ]),
    ],
    controllers: [PartController],
    providers: [PartService],
})
export class PartModule { }