import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { UserProgress } from '../schemas/user-progress.schema.js';
import { Part } from '../../parts/schemas/part.schema.js';
import { Unit } from '../../units/schemas/unit.schema.js';
import { Lesson } from '../../lessons/schemas/lesson.schema.js';
import { Day } from '../../days/schemas/day.schema.js';
import { Phase } from '../../phases/schemas/phase.schema.js';
import { Step } from '../../steps/schemas/step.schema.js';
import { DayProgressStatus, LessonProgressStatus } from '../enums/journey.enum.js';
import { GetJourneyQueryDto } from '../dtos/get-journey-query.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

@Injectable()
export class JourneyService {
    constructor(
        @InjectModel(UserProgress.name) private userProgressModel: Model<UserProgress>,
        @InjectModel(Part.name) private partModel: Model<Part>,
        @InjectModel(Unit.name) private unitModel: Model<Unit>,
        @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
        @InjectModel(Day.name) private dayModel: Model<Day>,
        @InjectModel(Phase.name) private phaseModel: Model<Phase>,
        @InjectModel(Step.name) private stepModel: Model<Step>,
    ) { }

    /**
     * Retrieves the educational journey for the given user.
     * Returns parts, their availability, visited units, and lessons with status and day count.
     */
    async getLearningJourney(
        userId: string,
        query: GetJourneyQueryDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUserId(userId, msg);

        // Fetch all educational structures in chronological order
        const [parts, units, lessons] = await Promise.all([
            this.partModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.unitModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.lessonModel.find().sort({ createdAt: 1 }).lean().exec(),
        ]);

        if (parts.length === 0) {
            return {
                message: msg.journeyRetrievedSuccess,
                parts: [],
            };
        }

        // Fetch or initialize user progress
        const progress = await this.getOrCreateUserProgress(userId, parts, units, lessons);

        // Build lookup sets for quick completion and current position checks
        const completedPartSet = new Set(progress.completedPartIds.map((id) => id.toString()));
        const completedUnitSet = new Set(progress.completedUnitIds.map((id) => id.toString()));
        const completedLessonSet = new Set(progress.completedLessonIds.map((id) => id.toString()));

        const currentPartIdStr = progress.currentPartId?.toString();
        const currentUnitIdStr = progress.currentUnitId?.toString();
        const currentLessonIdStr = progress.currentLessonId?.toString();

        // Group units by partId
        const unitsByPartId = new Map<string, typeof units>();
        for (const unit of units) {
            const pId = unit.partId.toString();
            if (!unitsByPartId.has(pId)) {
                unitsByPartId.set(pId, []);
            }
            unitsByPartId.get(pId)!.push(unit);
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

        const formattedParts: any[] = [];

        for (const part of parts) {
            const partIdStr = part._id.toString();
            const partUnits = unitsByPartId.get(partIdStr) || [];

            // Check if all units in this part are completed
            const allUnitsCompleted =
                partUnits.length > 0 &&
                partUnits.every((u) => completedUnitSet.has(u._id.toString()));

            const isPartCompleted = completedPartSet.has(partIdStr) || allUnitsCompleted;
            const isPartCurrent = currentPartIdStr === partIdStr;
            // A part is available if the user is currently on it or has completed it
            const isPartAvailable = isPartCompleted || isPartCurrent;

            // Optional filter: if query requested only available parts
            if (query.onlyAvailable === 'true' && !isPartAvailable) {
                continue;
            }

            // Units inside this part that the user has reached / gone through
            const formattedUnits: any[] = [];

            if (isPartAvailable) {
                for (const unit of partUnits) {
                    const unitIdStr = unit._id.toString();
                    const unitLessons = lessonsByUnitId.get(unitIdStr) || [];

                    // Check if all lessons in this unit are completed
                    const allLessonsCompleted =
                        unitLessons.length > 0 &&
                        unitLessons.every((l) => completedLessonSet.has(l._id.toString()));

                    const isUnitCompleted = completedUnitSet.has(unitIdStr) || allLessonsCompleted;
                    const isUnitCurrent = currentUnitIdStr === unitIdStr;
                    const isUnitReached = isUnitCompleted || isUnitCurrent;

                    // Only include units the user has reached/passed through inside this part
                    if (isUnitReached) {
                        const formattedLessons = unitLessons.map((lesson) => {
                            const lessonIdStr = lesson._id.toString();
                            let status: LessonProgressStatus;

                            if (completedLessonSet.has(lessonIdStr)) {
                                status = LessonProgressStatus.COMPLETED;
                            } else if (currentLessonIdStr === lessonIdStr) {
                                status = LessonProgressStatus.CURRENT;
                            } else {
                                status = LessonProgressStatus.LOCKED;
                            }

                            return {
                                id: lessonIdStr,
                                nameAr: lesson.nameAr,
                                nameEn: lesson.nameEn,
                                days: lesson.days,
                                status,
                            };
                        });

                        formattedUnits.push({
                            id: unitIdStr,
                            hintAr: unit.hintAr,
                            hintEn: unit.hintEn,
                            labelAr: unit.labelAr,
                            labelEn: unit.labelEn,
                            isCompleted: isUnitCompleted,
                            lessons: formattedLessons,
                        });
                    }
                }
            }

            formattedParts.push({
                id: partIdStr,
                partNameAr: part.partNameAr,
                partNameEn: part.partNameEn,
                isAvailable: isPartAvailable,
                isCompleted: isPartCompleted,
                units: formattedUnits,
            });
        }

        return {
            message: msg.journeyRetrievedSuccess,
            parts: formattedParts,
        };
    }

    /**
     * Retrieves the days of a specific lesson with their learning progress status:
     * CURRENT, COMPLETED, or LOCKED.
     */
    async getLessonDays(
        userId: string,
        lessonId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUserId(userId, msg);
        this.validateLessonId(lessonId, msg);

        const lesson = await this.lessonModel.findById(lessonId).lean().exec();
        if (!lesson) {
            throw new NotFoundException(msg.lessonNotFound);
        }

        // Fetch all days linked to this lesson ordered chronologically
        const [days, parts, units, lessons] = await Promise.all([
            this.dayModel.find({ lessonId: lesson._id }).sort({ createdAt: 1 }).lean().exec(),
            this.partModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.unitModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.lessonModel.find().sort({ createdAt: 1 }).lean().exec(),
        ]);

        const progress = await this.getOrCreateUserProgress(userId, parts, units, lessons);

        const completedLessonSet = new Set(progress.completedLessonIds.map((id) => id.toString()));
        const completedDaySet = new Set(progress.completedDayIds.map((id) => id.toString()));

        const isLessonCompleted = completedLessonSet.has(lessonId);
        const isLessonCurrent = progress.currentLessonId?.toString() === lessonId;

        let lessonStatus: LessonProgressStatus;
        if (isLessonCompleted) {
            lessonStatus = LessonProgressStatus.COMPLETED;
        } else if (isLessonCurrent) {
            lessonStatus = LessonProgressStatus.CURRENT;
        } else {
            lessonStatus = LessonProgressStatus.LOCKED;
        }

        // Determine active current day in this lesson if current
        let activeDayIdStr: string | undefined;
        if (lessonStatus === LessonProgressStatus.CURRENT) {
            const currentDayInLesson = days.find((d) => d._id.toString() === progress.currentDayId?.toString());
            if (currentDayInLesson && !completedDaySet.has(currentDayInLesson._id.toString())) {
                activeDayIdStr = currentDayInLesson._id.toString();
            } else {
                // First incomplete day in this lesson
                const firstIncompleteDay = days.find((d) => !completedDaySet.has(d._id.toString()));
                activeDayIdStr = firstIncompleteDay?._id.toString();
            }
        }

        const formattedDays = days.map((day) => {
            const dayIdStr = day._id.toString();
            let status: DayProgressStatus;

            if (lessonStatus === LessonProgressStatus.COMPLETED) {
                status = DayProgressStatus.COMPLETED;
            } else if (lessonStatus === LessonProgressStatus.LOCKED) {
                status = DayProgressStatus.LOCKED;
            } else {
                // Lesson is CURRENT
                if (completedDaySet.has(dayIdStr)) {
                    status = DayProgressStatus.COMPLETED;
                } else if (activeDayIdStr && dayIdStr === activeDayIdStr) {
                    status = DayProgressStatus.CURRENT;
                } else {
                    status = DayProgressStatus.LOCKED;
                }
            }

            return {
                id: dayIdStr,
                nameAr: day.nameAr,
                nameEn: day.nameEn,
                headerTextAr: day.headerTextAr,
                headerTextEn: day.headerTextEn,
                purpose: day.purpose,
                expectedTime: day.expectedTime,
                status,
            };
        });

        return {
            message: msg.lessonDaysRetrievedSuccess,
            lesson: {
                id: lesson._id.toString(),
                nameAr: lesson.nameAr,
                nameEn: lesson.nameEn,
                days: lesson.days,
                status: lessonStatus,
            },
            days: formattedDays,
        };
    }

    /**
     * Retrieves the details of a specific day, including its unit hints (unitHintAr, unitHintEn),
     * user progress status (CURRENT, COMPLETED, LOCKED), and its phases (type, descriptions, phaseId).
     */
    async getDayDetails(
        userId: string,
        dayId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUserId(userId, msg);

        if (!isValidObjectId(dayId)) {
            throw new BadRequestException(msg.invalidDayId);
        }

        const day = await this.dayModel.findById(dayId).lean().exec();
        if (!day) {
            throw new NotFoundException(msg.dayNotFound);
        }

        // Fetch parent Lesson and Unit to retrieve unitHintAr and unitHintEn
        const lesson = await this.lessonModel.findById(day.lessonId).lean().exec();
        const unit = lesson ? await this.unitModel.findById(lesson.unitId).lean().exec() : null;

        // Fetch all phases for this day ordered chronologically
        const phases = await this.phaseModel
            .find({ dayId: day._id })
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        // Fetch user progress
        const [parts, units, lessons] = await Promise.all([
            this.partModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.unitModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.lessonModel.find().sort({ createdAt: 1 }).lean().exec(),
        ]);

        const progress = await this.getOrCreateUserProgress(userId, parts, units, lessons);

        const completedLessonSet = new Set(progress.completedLessonIds.map((id) => id.toString()));
        const completedDaySet = new Set(progress.completedDayIds.map((id) => id.toString()));

        const dayIdStr = day._id.toString();
        const lessonIdStr = day.lessonId.toString();

        let dayStatus: DayProgressStatus;

        if (completedDaySet.has(dayIdStr)) {
            dayStatus = DayProgressStatus.COMPLETED;
        } else if (completedLessonSet.has(lessonIdStr)) {
            dayStatus = DayProgressStatus.COMPLETED;
        } else if (progress.currentLessonId?.toString() === lessonIdStr) {
            // Lesson is CURRENT
            if (progress.currentDayId?.toString() === dayIdStr) {
                dayStatus = DayProgressStatus.CURRENT;
            } else {
                // Find first incomplete day in this lesson
                const daysInLesson = await this.dayModel
                    .find({ lessonId: day.lessonId })
                    .sort({ createdAt: 1 })
                    .lean()
                    .exec();
                const firstIncompleteDay = daysInLesson.find((d) => !completedDaySet.has(d._id.toString()));
                if (firstIncompleteDay && firstIncompleteDay._id.toString() === dayIdStr) {
                    dayStatus = DayProgressStatus.CURRENT;
                } else {
                    dayStatus = DayProgressStatus.LOCKED;
                }
            }
        } else {
            dayStatus = DayProgressStatus.LOCKED;
        }

        const formattedPhases = phases.map((phase) => ({
            phaseId: phase._id.toString(),
            type: phase.type,
            descriptionAr: phase.descriptionAr,
            descriptionEn: phase.descriptionEn,
            description: lang === 'ar' ? phase.descriptionAr : phase.descriptionEn,
        }));

        return {
            message: msg.dayRetrievedSuccess,
            day: {
                id: dayIdStr,
                nameAr: day.nameAr,
                nameEn: day.nameEn,
                headerTextAr: day.headerTextAr,
                headerTextEn: day.headerTextEn,
                purpose: day.purpose,
                expectedTime: day.expectedTime,
                lessonId: lessonIdStr,
                unitHintAr: unit?.hintAr ?? '',
                unitHintEn: unit?.hintEn ?? '',
                status: dayStatus,
                phases: formattedPhases,
            },
        };
    }

    /**
     * Marks a day as completed and advances progress to the next day or lesson.
     */
    async completeDay(
        userId: string,
        dayId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUserId(userId, msg);

        if (!isValidObjectId(dayId)) {
            throw new BadRequestException(msg.invalidDayId);
        }

        const day = await this.dayModel.findById(dayId).exec();
        if (!day) {
            throw new NotFoundException(msg.dayNotFound);
        }

        const [parts, units, lessons, daysInLesson] = await Promise.all([
            this.partModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.unitModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.lessonModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.dayModel.find({ lessonId: day.lessonId }).sort({ createdAt: 1 }).lean().exec(),
        ]);

        const progress = await this.getOrCreateUserProgress(userId, parts, units, lessons);

        // Add to completedDayIds
        const dayObjId = new Types.ObjectId(dayId);
        if (!progress.completedDayIds.some((id) => id.toString() === dayId)) {
            progress.completedDayIds.push(dayObjId);
        }

        const completedDaySet = new Set(progress.completedDayIds.map((id) => id.toString()));

        // Check if all days in this lesson are now completed
        const allDaysCompleted =
            daysInLesson.length > 0 &&
            daysInLesson.every((d) => completedDaySet.has(d._id.toString()));

        if (allDaysCompleted) {
            await progress.save();
            // Automatically complete the lesson and advance curriculum
            await this.completeLesson(userId, day.lessonId.toString(), lang);
        } else {
            // Find next incomplete day in this lesson
            const nextDay = daysInLesson.find((d) => !completedDaySet.has(d._id.toString()));
            if (nextDay) {
                progress.currentDayId = nextDay._id;
            }
            await progress.save();
        }

        const lessonDays = await this.getLessonDays(userId, day.lessonId.toString(), lang);
        return {
            ...lessonDays,
            message: msg.dayProgressUpdatedSuccess,
        };
    }

    /**
     * Marks a lesson as completed for the user and advances the journey pointer to the next lesson/unit/part.
     */
    async completeLesson(
        userId: string,
        lessonId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUserId(userId, msg);
        this.validateLessonId(lessonId, msg);

        const lesson = await this.lessonModel.findById(lessonId).exec();
        if (!lesson) {
            throw new NotFoundException(msg.lessonNotFound);
        }

        // Fetch all educational structures in chronological order
        const [parts, units, lessons] = await Promise.all([
            this.partModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.unitModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.lessonModel.find().sort({ createdAt: 1 }).lean().exec(),
        ]);

        const progress = await this.getOrCreateUserProgress(userId, parts, units, lessons);

        // Add to completedLessonIds if not already added
        const lessonObjId = new Types.ObjectId(lessonId);
        if (!progress.completedLessonIds.some((id) => id.toString() === lessonId)) {
            progress.completedLessonIds.push(lessonObjId);
        }

        const completedLessonSet = new Set(progress.completedLessonIds.map((id) => id.toString()));

        // Check if all lessons in the current unit are completed
        const unitIdStr = lesson.unitId.toString();
        const lessonsInUnit = lessons.filter((l) => l.unitId.toString() === unitIdStr);
        const allLessonsInUnitCompleted = lessonsInUnit.every((l) => completedLessonSet.has(l._id.toString()));

        if (allLessonsInUnitCompleted) {
            const unitObjId = new Types.ObjectId(unitIdStr);
            if (!progress.completedUnitIds.some((id) => id.toString() === unitIdStr)) {
                progress.completedUnitIds.push(unitObjId);
            }
        }

        const completedUnitSet = new Set(progress.completedUnitIds.map((id) => id.toString()));

        // Find the unit to check its part
        const currentUnit = units.find((u) => u._id.toString() === unitIdStr);
        if (currentUnit) {
            const partIdStr = currentUnit.partId.toString();
            const unitsInPart = units.filter((u) => u.partId.toString() === partIdStr);
            const allUnitsInPartCompleted = unitsInPart.every((u) => completedUnitSet.has(u._id.toString()));

            if (allUnitsInPartCompleted) {
                const partObjId = new Types.ObjectId(partIdStr);
                if (!progress.completedPartIds.some((id) => id.toString() === partIdStr)) {
                    progress.completedPartIds.push(partObjId);
                }
            }
        }

        // Advance current pointer to the next incomplete lesson
        let nextLesson: (typeof lessons)[0] | undefined;
        let nextUnit: (typeof units)[0] | undefined;
        let nextPart: (typeof parts)[0] | undefined;

        for (const p of parts) {
            const pUnits = units.filter((u) => u.partId.toString() === p._id.toString());
            for (const u of pUnits) {
                const uLessons = lessons.filter((l) => l.unitId.toString() === u._id.toString());
                for (const l of uLessons) {
                    if (!completedLessonSet.has(l._id.toString())) {
                        nextLesson = l;
                        nextUnit = u;
                        nextPart = p;
                        break;
                    }
                }
                if (nextLesson) break;
            }
            if (nextLesson) break;
        }

        if (nextLesson && nextUnit && nextPart) {
            progress.currentLessonId = nextLesson._id;
            progress.currentUnitId = nextUnit._id;
            progress.currentPartId = nextPart._id;

            // Set currentDayId to the first day of the next lesson
            const nextLessonDays = await this.dayModel
                .find({ lessonId: nextLesson._id })
                .sort({ createdAt: 1 })
                .lean()
                .exec();
            progress.currentDayId = nextLessonDays[0]?._id ?? undefined;
        } else {
            // All lessons completed in the whole curriculum!
            progress.currentLessonId = undefined;
            progress.currentUnitId = undefined;
            progress.currentPartId = undefined;
            progress.currentDayId = undefined;
        }

        await progress.save();

        return {
            message: msg.journeyProgressUpdatedSuccess,
            journey: await this.getLearningJourney(userId, {}, lang),
        };
    }

    /**
     * Resets the user's journey progress to the very beginning.
     */
    async resetProgress(
        userId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUserId(userId, msg);

        const [parts, units, lessons] = await Promise.all([
            this.partModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.unitModel.find().sort({ createdAt: 1 }).lean().exec(),
            this.lessonModel.find().sort({ createdAt: 1 }).lean().exec(),
        ]);

        await this.userProgressModel.deleteOne({ userId: new Types.ObjectId(userId) }).exec();
        await this.getOrCreateUserProgress(userId, parts, units, lessons);

        return {
            message: msg.journeyProgressResetSuccess,
            journey: await this.getLearningJourney(userId, {}, lang),
        };
    }

    /**
     * Finds existing progress or initializes a new one pointing to the first part/unit/lesson/day.
     */
    private async getOrCreateUserProgress(
        userId: string,
        parts: any[],
        units: any[],
        lessons: any[],
    ): Promise<UserProgress> {
        let progress = await this.userProgressModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .exec();

        if (!progress) {
            const firstPart = parts[0];
            const firstUnit = firstPart
                ? units.find((u) => u.partId.toString() === firstPart._id.toString())
                : undefined;
            const firstLesson = firstUnit
                ? lessons.find((l) => l.unitId.toString() === firstUnit._id.toString())
                : undefined;

            let firstDayId: Types.ObjectId | undefined;
            if (firstLesson) {
                const firstDay = await this.dayModel
                    .findOne({ lessonId: firstLesson._id })
                    .sort({ createdAt: 1 })
                    .lean()
                    .exec();
                firstDayId = firstDay?._id;
            }

            progress = await this.userProgressModel.create({
                userId: new Types.ObjectId(userId),
                currentPartId: firstPart?._id,
                currentUnitId: firstUnit?._id,
                currentLessonId: firstLesson?._id,
                currentDayId: firstDayId,
                completedPartIds: [],
                completedUnitIds: [],
                completedLessonIds: [],
                completedDayIds: [],
                completedPhaseIds: [],
                completedStepIds: [],
            });
        }

        return progress;
    }

    /**
     * Retrieves all steps for a specific day across all its phases,
     * including day info and layout-typed step data.
     * Accessible only if the day is CURRENT or COMPLETED (not LOCKED).
     */
    async getDaySteps(
        userId: string,
        dayId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUserId(userId, msg);

        if (!isValidObjectId(dayId)) {
            throw new BadRequestException(msg.invalidDayId);
        }

        // Get day details & verify user progress/access
        const dayDetailsResult = await this.getDayDetails(userId, dayId, lang);
        if (dayDetailsResult.day.status === DayProgressStatus.LOCKED) {
            throw new ForbiddenException(msg.dayLocked);
        }

        const day = dayDetailsResult.day;

        // Fetch phases for this day ordered chronologically
        const phases = await this.phaseModel
            .find({ dayId: new Types.ObjectId(dayId) })
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        const phaseIds = phases.map((p) => p._id);

        // Fetch all steps belonging to these phases ordered chronologically
        const steps = await this.stepModel
            .find({ phaseId: { $in: phaseIds } })
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        // Group steps by phaseId
        const stepsByPhaseId = new Map<string, typeof steps>();
        for (const step of steps) {
            const pId = step.phaseId.toString();
            if (!stepsByPhaseId.has(pId)) {
                stepsByPhaseId.set(pId, []);
            }
            stepsByPhaseId.get(pId)!.push(step);
        }

        // Format phases with their steps
        const formattedPhases = phases.map((phase) => {
            const phaseIdStr = phase._id.toString();
            const phaseSteps = stepsByPhaseId.get(phaseIdStr) || [];

            return {
                phaseId: phaseIdStr,
                type: phase.type,
                descriptionAr: phase.descriptionAr,
                descriptionEn: phase.descriptionEn,
                description: lang === 'ar' ? phase.descriptionAr : phase.descriptionEn,
                steps: phaseSteps.map((step) => ({
                    id: step._id.toString(),
                    descriptionAr: step.descriptionAr,
                    descriptionEn: step.descriptionEn,
                    type: step.type,
                    layoutType: step.layoutType,
                    data: step.data,
                })),
            };
        });

        // Also provide flat list of all steps with phase info
        const phaseMap = new Map(phases.map((p) => [p._id.toString(), p]));
        const formattedSteps = steps.map((step) => {
            const parentPhase = phaseMap.get(step.phaseId.toString());
            return {
                id: step._id.toString(),
                phaseId: step.phaseId.toString(),
                phaseType: parentPhase?.type,
                descriptionAr: step.descriptionAr,
                descriptionEn: step.descriptionEn,
                type: step.type,
                layoutType: step.layoutType,
                data: step.data,
            };
        });

        return {
            message: msg.dayStepsRetrievedSuccess,
            day: {
                id: day.id,
                nameAr: day.nameAr,
                nameEn: day.nameEn,
                headerTextAr: day.headerTextAr,
                headerTextEn: day.headerTextEn,
                purpose: day.purpose,
                expectedTime: day.expectedTime,
                unitHintAr: day.unitHintAr,
                unitHintEn: day.unitHintEn,
                status: day.status,
            },
            phases: formattedPhases,
            steps: formattedSteps,
        };
    }

    /**
     * Retrieves all steps for a specific phase, including phase info and step data.
     * The phase's parent day must be CURRENT or COMPLETED for the user (not LOCKED).
     */
    async getPhaseSteps(
        userId: string,
        phaseId: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUserId(userId, msg);

        if (!isValidObjectId(phaseId)) {
            throw new BadRequestException(msg.invalidPhaseId);
        }

        const phase = await this.phaseModel.findById(phaseId).lean().exec();
        if (!phase) {
            throw new NotFoundException(msg.phaseNotFound);
        }

        // Ensure the parent day is accessible (not LOCKED) for this user
        const dayId = phase.dayId.toString();
        const dayDetailsResult = await this.getDayDetails(userId, dayId, lang);
        if (dayDetailsResult.day.status === 'LOCKED') {
            throw new BadRequestException(msg.dayNotFound);
        }

        // Fetch steps for this phase ordered chronologically
        const steps = await this.stepModel
            .find({ phaseId: phase._id })
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        return {
            message: msg.phaseStepsRetrievedSuccess,
            phase: {
                phaseId: phase._id.toString(),
                type: phase.type,
                descriptionAr: phase.descriptionAr,
                descriptionEn: phase.descriptionEn,
            },
            steps: steps.map((step) => ({
                id: step._id.toString(),
                descriptionAr: step.descriptionAr,
                descriptionEn: step.descriptionEn,
                type: step.type,
                layoutType: step.layoutType,
                data: step.data,
            })),
        };
    }

    private validateUserId(userId: string, msg: ReturnType<typeof getMessages>) {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException(msg.supportInvalidUserId);
        }
    }

    private validateLessonId(lessonId: string, msg: ReturnType<typeof getMessages>) {
        if (!isValidObjectId(lessonId)) {
            throw new BadRequestException(msg.invalidLessonId);
        }
    }
}
