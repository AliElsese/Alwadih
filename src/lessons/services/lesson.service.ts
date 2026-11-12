import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Lesson } from '../schemas/lesson.schema.js';
import { Unit } from '../../units/schemas/unit.schema.js';
import { CreateLessonDto } from '../dtos/create-lesson.dto.js';
import { UpdateLessonDto } from '../dtos/update-lesson.dto.js';
import { GetLessonsQueryDto } from '../dtos/get-lessons-query.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

const UNIT_POPULATE_FIELDS = 'hintAr hintEn labelAr labelEn partId';

@Injectable()
export class LessonService {
    constructor(
        @InjectModel(Lesson.name) private LessonModel: Model<Lesson>,
        @InjectModel(Unit.name) private UnitModel: Model<Unit>,
    ) { }

    /**
     * Creates a new lesson linked to an existing unit.
     */
    async createLesson(
        createLessonDto: CreateLessonDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const nameAr = createLessonDto.nameAr.trim();
        const nameEn = createLessonDto.nameEn.trim();
        const { days, unitId } = createLessonDto;

        await this.ensureUnitExists(unitId, msg);
        await this.ensureUniqueNamesInUnit(msg, unitId, nameAr, nameEn);

        const createdLesson = await this.LessonModel.create({
            nameAr,
            nameEn,
            days,
            unitId,
        });

        await createdLesson.populate('unitId', UNIT_POPULATE_FIELDS);

        return {
            message: msg.lessonCreatedSuccess,
            lesson: this.formatLesson(createdLesson),
        };
    }

    /**
     * Retrieves all lessons, optionally filtered by unitId.
     */
    async getAllLessons(
        query: GetLessonsQueryDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const filter: Record<string, string> = {};

        if (query.unitId) {
            await this.ensureUnitExists(query.unitId, msg);
            filter.unitId = query.unitId;
        }

        const lessons = await this.LessonModel.find(filter)
            .sort({ createdAt: 1 })
            .populate('unitId', UNIT_POPULATE_FIELDS)
            .exec();

        return {
            message: msg.lessonsRetrievedSuccess,
            count: lessons.length,
            lessons: lessons.map((lesson) => this.formatLesson(lesson)),
        };
    }

    /**
     * Retrieves a single lesson by its identifier.
     */
    async getLessonById(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateLessonId(id, msg);

        const lesson = await this.LessonModel.findById(id)
            .populate('unitId', UNIT_POPULATE_FIELDS)
            .exec();

        if (!lesson) {
            throw new NotFoundException(msg.lessonNotFound);
        }

        return {
            message: msg.lessonRetrievedSuccess,
            lesson: this.formatLesson(lesson),
        };
    }

    /**
     * Partially updates a lesson's fields or moves it to another existing unit.
     */
    async updateLesson(
        id: string,
        updateLessonDto: UpdateLessonDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateLessonId(id, msg);

        const existingLesson = await this.LessonModel.findById(id).exec();
        if (!existingLesson) {
            throw new NotFoundException(msg.lessonNotFound);
        }

        const targetUnitId = updateLessonDto.unitId ?? existingLesson.unitId.toString();
        if (updateLessonDto.unitId !== undefined) {
            await this.ensureUnitExists(targetUnitId, msg);
        }

        const updateData: Partial<{
            nameAr: string;
            nameEn: string;
            days: number;
            unitId: string;
        }> = {};

        if (updateLessonDto.nameAr !== undefined) {
            updateData.nameAr = updateLessonDto.nameAr.trim();
        }
        if (updateLessonDto.nameEn !== undefined) {
            updateData.nameEn = updateLessonDto.nameEn.trim();
        }
        if (updateLessonDto.days !== undefined) {
            updateData.days = updateLessonDto.days;
        }
        if (updateLessonDto.unitId !== undefined) {
            updateData.unitId = updateLessonDto.unitId;
        }

        if (
            updateData.nameAr !== undefined ||
            updateData.nameEn !== undefined ||
            updateData.unitId !== undefined
        ) {
            await this.ensureUniqueNamesInUnit(
                msg,
                targetUnitId,
                updateData.nameAr ?? existingLesson.nameAr,
                updateData.nameEn ?? existingLesson.nameEn,
                id,
            );
        }

        const updatedLesson = Object.keys(updateData).length > 0
            ? await this.LessonModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true },
            )
                .populate('unitId', UNIT_POPULATE_FIELDS)
                .exec()
            : await existingLesson.populate('unitId', UNIT_POPULATE_FIELDS);

        return {
            message: msg.lessonUpdatedSuccess,
            lesson: this.formatLesson(updatedLesson!),
        };
    }

    /**
     * Deletes a lesson by its identifier.
     */
    async deleteLesson(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateLessonId(id, msg);

        const deletedLesson = await this.LessonModel.findByIdAndDelete(id)
            .populate('unitId', UNIT_POPULATE_FIELDS)
            .exec();

        if (!deletedLesson) {
            throw new NotFoundException(msg.lessonNotFound);
        }

        return {
            message: msg.lessonDeletedSuccess,
            lesson: this.formatLesson(deletedLesson),
        };
    }

    /**
     * Validates that the provided lesson ObjectId is well-formed.
     */
    private validateLessonId(id: string, msg: ReturnType<typeof getMessages>) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(msg.invalidLessonId);
        }
    }

    /**
     * Ensures the referenced Unit exists before creating or linking a lesson to it.
     */
    private async ensureUnitExists(
        unitId: string,
        msg: ReturnType<typeof getMessages>,
    ) {
        if (!isValidObjectId(unitId)) {
            throw new BadRequestException(msg.invalidUnitId);
        }

        const exists = await this.UnitModel.exists({ _id: unitId });
        if (!exists) {
            throw new NotFoundException(msg.unitNotFound);
        }
    }

    /**
     * Ensures no duplicate Arabic or English lesson name exists within the same unit.
     */
    private async ensureUniqueNamesInUnit(
        msg: ReturnType<typeof getMessages>,
        unitId: string,
        nameAr?: string,
        nameEn?: string,
        excludeId?: string,
    ) {
        const orConditions: Array<Record<string, string>> = [];

        if (nameAr) {
            orConditions.push({ nameAr });
        }
        if (nameEn) {
            orConditions.push({ nameEn });
        }

        if (orConditions.length === 0) {
            return;
        }

        const query: Record<string, unknown> = {
            unitId,
            $or: orConditions,
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await this.LessonModel.findOne(query).exec();
        if (existing) {
            throw new ConflictException(msg.lessonAlreadyExists);
        }
    }

    /**
     * Formats sanitized lesson response object with linked unit details when populated.
     */
    private formatLesson(lesson: Lesson) {
        const unitDoc = lesson.unitId as unknown as {
            _id?: { toString(): string };
            hintAr?: string;
            hintEn?: string;
            labelAr?: string;
            labelEn?: string;
            partId?: { toString(): string };
        };
        const isPopulated = Boolean(unitDoc && typeof unitDoc === 'object' && unitDoc.labelAr);

        return {
            id: lesson._id.toString(),
            nameAr: lesson.nameAr,
            nameEn: lesson.nameEn,
            days: lesson.days,
            unitId: isPopulated ? unitDoc._id!.toString() : lesson.unitId.toString(),
            ...(isPopulated && {
                unit: {
                    id: unitDoc._id!.toString(),
                    hintAr: unitDoc.hintAr,
                    hintEn: unitDoc.hintEn,
                    labelAr: unitDoc.labelAr,
                    labelEn: unitDoc.labelEn,
                    partId: unitDoc.partId?.toString(),
                },
            })
        };
    }
}