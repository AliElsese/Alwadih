import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgress, UserProgressSchema } from './schemas/user-progress.schema.js';
import { Part, PartSchema } from '../parts/schemas/part.schema.js';
import { Unit, UnitSchema } from '../units/schemas/unit.schema.js';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema.js';
import { Day, DaySchema } from '../days/schemas/day.schema.js';
import { Phase, PhaseSchema } from '../phases/schemas/phase.schema.js';
import { Step, StepSchema } from '../steps/schemas/step.schema.js';
import { JourneyService } from './services/journey.service.js';
import { JourneyController } from './controllers/journey.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserProgress.name, schema: UserProgressSchema },
            { name: Part.name, schema: PartSchema },
            { name: Unit.name, schema: UnitSchema },
            { name: Lesson.name, schema: LessonSchema },
            { name: Day.name, schema: DaySchema },
            { name: Phase.name, schema: PhaseSchema },
            { name: Step.name, schema: StepSchema },
        ]),
    ],
    controllers: [JourneyController],
    providers: [JourneyService],
    exports: [JourneyService],
})
export class JourneyModule { }
