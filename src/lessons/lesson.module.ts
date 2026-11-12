import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonController } from './controllers/lesson.controller.js';
import { LessonService } from './services/lesson.service.js';
import { Lesson, LessonSchema } from './schemas/lesson.schema.js';
import { Unit, UnitSchema } from '../units/schemas/unit.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Lesson.name,
                schema: LessonSchema,
            },
            {
                name: Unit.name,
                schema: UnitSchema,
            },
        ]),
    ],
    controllers: [LessonController],
    providers: [LessonService],
})

export class LessonModule { }