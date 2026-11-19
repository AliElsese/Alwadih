import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Day, DaySchema } from './schemas/day.schema.js';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema.js';
import { DayService } from './services/day.service.js';
import { DayController } from './controllers/day.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Day.name, schema: DaySchema },
            { name: Lesson.name, schema: LessonSchema },
        ]),
    ],
    controllers: [DayController],
    providers: [DayService],
    exports: [DayService],
})
export class DayModule { }
