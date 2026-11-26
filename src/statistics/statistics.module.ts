import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Part, PartSchema } from '../parts/schemas/part.schema.js';
import { Unit, UnitSchema } from '../units/schemas/unit.schema.js';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema.js';
import { Day, DaySchema } from '../days/schemas/day.schema.js';
import { Phase, PhaseSchema } from '../phases/schemas/phase.schema.js';
import { Step, StepSchema } from '../steps/schemas/step.schema.js';
import { StatisticsService } from './services/statistics.service.js';
import { StatisticsController } from './controllers/statistics.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Part.name, schema: PartSchema },
            { name: Unit.name, schema: UnitSchema },
            { name: Lesson.name, schema: LessonSchema },
            { name: Day.name, schema: DaySchema },
            { name: Phase.name, schema: PhaseSchema },
            { name: Step.name, schema: StepSchema },
        ]),
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
    exports: [StatisticsService],
})
export class StatisticsModule { }
