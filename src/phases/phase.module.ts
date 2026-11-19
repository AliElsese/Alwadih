import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Phase, PhaseSchema } from './schemas/phase.schema.js';
import { Day, DaySchema } from '../days/schemas/day.schema.js';
import { PhaseService } from './services/phase.service.js';
import { PhaseController } from './controllers/phase.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Phase.name, schema: PhaseSchema },
            { name: Day.name, schema: DaySchema },
        ]),
    ],
    controllers: [PhaseController],
    providers: [PhaseService],
    exports: [PhaseService],
})
export class PhaseModule { }
