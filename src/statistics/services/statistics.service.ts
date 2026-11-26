import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Part } from '../../parts/schemas/part.schema.js';
import { Unit } from '../../units/schemas/unit.schema.js';
import { Lesson } from '../../lessons/schemas/lesson.schema.js';
import { Day } from '../../days/schemas/day.schema.js';
import { Phase } from '../../phases/schemas/phase.schema.js';
import { Step } from '../../steps/schemas/step.schema.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectModel(Part.name) private partModel: Model<Part>,
        @InjectModel(Unit.name) private unitModel: Model<Unit>,
        @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
        @InjectModel(Day.name) private dayModel: Model<Day>,
        @InjectModel(Phase.name) private phaseModel: Model<Phase>,
        @InjectModel(Step.name) private stepModel: Model<Step>,
    ) { }

    /**
     * Retrieves curriculum statistics grouped by part:
     * - unitsCount
     * - lessonsCount
     * - stepsCount
     * - layoutTypesCount (number of unique layout types)
     */
    async getPartsStatistics(lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);

        // Fetch all educational entities in parallel
        const [parts, units, lessons, days, phases, steps] = await Promise.all([
            this.partModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.unitModel.find().lean().exec(),
            this.lessonModel.find().lean().exec(),
            this.dayModel.find().lean().exec(),
            this.phaseModel.find().lean().exec(),
            this.stepModel.find().lean().exec(),
        ]);

        // Build mapping: phase -> day -> lesson
        const dayToLessonMap = new Map<string, string>();
        for (const day of days) {
            dayToLessonMap.set(day._id.toString(), day.lessonId.toString());
        }

        const phaseToLessonMap = new Map<string, string>();
        for (const phase of phases) {
            const lessonId = dayToLessonMap.get(phase.dayId.toString());
            if (lessonId) {
                phaseToLessonMap.set(phase._id.toString(), lessonId);
            }
        }

        // Map steps to lessons
        const stepsByLessonId = new Map<string, typeof steps>();
        for (const step of steps) {
            const lessonId = phaseToLessonMap.get(step.phaseId.toString());
            if (lessonId) {
                if (!stepsByLessonId.has(lessonId)) {
                    stepsByLessonId.set(lessonId, []);
                }
                stepsByLessonId.get(lessonId)!.push(step);
            }
        }

        // Group lessons by unitId
        const lessonsByUnitId = new Map<string, typeof lessons>();
        for (const lesson of lessons) {
            const uId = lesson.unitId.toString();
            if (!lessonsByUnitId.has(uId)) {
                lessonsByUnitId.set(uId, []);
            }
            lessonsByUnitId.get(uId)!.push(lesson);
        }

        // Group units by partId
        const unitsByPartId = new Map<string, typeof units>();
        for (const unit of units) {
            const pId = unit.partId.toString();
            if (!unitsByPartId.has(pId)) {
                unitsByPartId.set(pId, []);
            }
            unitsByPartId.get(pId)!.push(unit);
        }

        // Aggregate statistics for each part
        const formattedParts = parts.map((part) => {
            const partIdStr = part._id.toString();
            const partUnits = unitsByPartId.get(partIdStr) || [];

            let partLessonsCount = 0;
            const partSteps: typeof steps = [];
            const partLayoutTypesSet = new Set<string>();

            for (const unit of partUnits) {
                const unitLessons = lessonsByUnitId.get(unit._id.toString()) || [];
                partLessonsCount += unitLessons.length;

                for (const lesson of unitLessons) {
                    const lessonSteps = stepsByLessonId.get(lesson._id.toString()) || [];
                    for (const step of lessonSteps) {
                        partSteps.push(step);
                        if (step.layoutType) {
                            partLayoutTypesSet.add(step.layoutType);
                        }
                    }
                }
            }

            return {
                partId: partIdStr,
                partNameAr: part.partNameAr,
                partNameEn: part.partNameEn,
                partName: lang === 'ar' ? part.partNameAr : part.partNameEn,
                unitsCount: partUnits.length,
                lessonsCount: partLessonsCount,
                stepsCount: partSteps.length,
                layoutTypesCount: partLayoutTypesSet.size,
            };
        });

        const totalSystemLayoutTypes = new Set<string>();
        for (const step of steps) {
            if (step.layoutType) {
                totalSystemLayoutTypes.add(step.layoutType);
            }
        }

        return {
            message: msg.statisticsRetrievedSuccess,
            summary: {
                totalParts: parts.length,
                totalUnits: units.length,
                totalLessons: lessons.length,
                totalSteps: steps.length,
                layoutTypesCount: totalSystemLayoutTypes.size,
            },
            parts: formattedParts,
        };
    }
}
