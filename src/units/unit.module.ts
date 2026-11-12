import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitController } from './controllers/unit.controller.js';
import { UnitService } from './services/unit.service.js';
import { Unit, UnitSchema } from './schemas/unit.schema.js';
import { Part, PartSchema } from '../parts/schemas/part.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Unit.name,
                schema: UnitSchema,
            },
            {
                name: Part.name,
                schema: PartSchema,
            },
        ]),
    ],
    controllers: [UnitController],
    providers: [UnitService],
})

export class UnitModule { }