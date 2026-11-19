import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Day } from '../schemas/day.schema.js';
import { Lesson } from '../../lessons/schemas/lesson.schema.js';
import { CreateDayDto } from '../dtos/create-day.dto.js';
import { UpdateDayDto } from '../dtos/update-day.dto.js';
import { GetDaysQueryDto } from '../dtos/get-days-query.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

const LESSON_POPULATE_FIELDS = 'nameAr nameEn days unitId';

@Injectable()
export class DayService {
    constructor(
        @InjectModel(Day.name) private DayModel: Model<Day>,
        @InjectModel(Lesson.name) private LessonModel: Model<Lesson>,
    ) { }

    /**
     * Creates a new day linked to an existing lesson.
     */
    async createDay(
        createDayDto: CreateDayDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const nameAr = createDayDto.nameAr.trim();
        const nameEn = createDayDto.nameEn.trim();
        const headerTextAr = createDayDto.headerTextAr.trim();
        const headerTextEn = createDayDto.headerTextEn.trim();
        const purpose = createDayDto.purpose.trim();
        const { expectedTime, lessonId } = createDayDto;

        await this.ensureLessonExists(lessonId, msg);
        await this.ensureUniqueNamesInLesson(msg, lessonId, nameAr, nameEn);

        const createdDay = await this.DayModel.create({
            nameAr,
            nameEn,
            headerTextAr,
            headerTextEn,
            purpose,
            expectedTime,
            lessonId,
        });

        await createdDay.populate('lessonId', LESSON_POPULATE_FIELDS);

        return {
            message: msg.dayCreatedSuccess,
            day: this.formatDay(createdDay),
        };
    }

    /**
     * Retrieves all days, optionally filtered by lessonId.
     */
    async getAllDays(
        query: GetDaysQueryDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const filter: Record<string, string> = {};

        if (query.lessonId) {
            await this.ensureLessonExists(query.lessonId, msg);
            filter.lessonId = query.lessonId;
        }

        const days = await this.DayModel.find(filter)
            .sort({ createdAt: 1 })
            .populate('lessonId', LESSON_POPULATE_FIELDS)
            .exec();

        return {
            message: msg.daysRetrievedSuccess,
            count: days.length,
            days: days.map((day) => this.formatDay(day)),
        };
    }

    /**
     * Retrieves a single day by its identifier.
     */
    async getDayById(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateDayId(id, msg);

        const day = await this.DayModel.findById(id)
            .populate('lessonId', LESSON_POPULATE_FIELDS)
            .exec();

        if (!day) {
            throw new NotFoundException(msg.dayNotFound);
        }

        return {
            message: msg.dayRetrievedSuccess,
            day: this.formatDay(day),
        };
    }

    /**
     * Updates an existing day.
     */
    async updateDay(
        id: string,
        updateDayDto: UpdateDayDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateDayId(id, msg);

        const existingDay = await this.DayModel.findById(id).exec();
        if (!existingDay) {
            throw new NotFoundException(msg.dayNotFound);
        }

        const updateData: Partial<{
            nameAr: string;
            nameEn: string;
            headerTextAr: string;
            headerTextEn: string;
            purpose: string;
            expectedTime: number;
            lessonId: string;
        }> = {};

        if (updateDayDto.nameAr !== undefined) {
            updateData.nameAr = updateDayDto.nameAr.trim();
        }
        if (updateDayDto.nameEn !== undefined) {
            updateData.nameEn = updateDayDto.nameEn.trim();
        }
        if (updateDayDto.headerTextAr !== undefined) {
            updateData.headerTextAr = updateDayDto.headerTextAr.trim();
        }
        if (updateDayDto.headerTextEn !== undefined) {
            updateData.headerTextEn = updateDayDto.headerTextEn.trim();
        }
        if (updateDayDto.purpose !== undefined) {
            updateData.purpose = updateDayDto.purpose.trim();
        }
        if (updateDayDto.expectedTime !== undefined) {
            updateData.expectedTime = updateDayDto.expectedTime;
        }

        const targetLessonId = updateDayDto.lessonId ?? existingDay.lessonId.toString();

        if (updateDayDto.lessonId !== undefined) {
            await this.ensureLessonExists(updateDayDto.lessonId, msg);
            updateData.lessonId = updateDayDto.lessonId;
        }

        if (
            updateData.nameAr !== undefined ||
            updateData.nameEn !== undefined ||
            updateData.lessonId !== undefined
        ) {
            await this.ensureUniqueNamesInLesson(
                msg,
                targetLessonId,
                updateData.nameAr ?? existingDay.nameAr,
                updateData.nameEn ?? existingDay.nameEn,
                id,
            );
        }

        const updatedDay = Object.keys(updateData).length > 0
            ? await this.DayModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true },
            )
                .populate('lessonId', LESSON_POPULATE_FIELDS)
                .exec()
            : await existingDay.populate('lessonId', LESSON_POPULATE_FIELDS);

        return {
            message: msg.dayUpdatedSuccess,
            day: this.formatDay(updatedDay!),
        };
    }

    /**
     * Deletes a day by its identifier.
     */
    async deleteDay(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateDayId(id, msg);

        const deletedDay = await this.DayModel.findByIdAndDelete(id)
            .populate('lessonId', LESSON_POPULATE_FIELDS)
            .exec();

        if (!deletedDay) {
            throw new NotFoundException(msg.dayNotFound);
        }

        return {
            message: msg.dayDeletedSuccess,
            day: this.formatDay(deletedDay),
        };
    }

    /**
     * Validates that the provided day ObjectId is well-formed.
     */
    private validateDayId(id: string, msg: ReturnType<typeof getMessages>) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(msg.invalidDayId);
        }
    }

    /**
     * Ensures the referenced Lesson exists before creating or linking a day to it.
     */
    private async ensureLessonExists(
        lessonId: string,
        msg: ReturnType<typeof getMessages>,
    ) {
        if (!isValidObjectId(lessonId)) {
            throw new BadRequestException(msg.invalidLessonId);
        }

        const exists = await this.LessonModel.exists({ _id: lessonId });
        if (!exists) {
            throw new NotFoundException(msg.lessonNotFound);
        }
    }

    /**
     * Ensures no duplicate Arabic or English day name exists within the same lesson.
     */
    private async ensureUniqueNamesInLesson(
        msg: ReturnType<typeof getMessages>,
        lessonId: string,
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
            lessonId,
            $or: orConditions,
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await this.DayModel.findOne(query).exec();
        if (existing) {
            throw new ConflictException(msg.dayAlreadyExists);
        }
    }

    /**
     * Formats sanitized day response object with linked lesson details when populated.
     */
    private formatDay(day: Day) {
        const lessonDoc = day.lessonId as unknown as {
            _id?: { toString(): string };
            nameAr?: string;
            nameEn?: string;
            days?: number;
            unitId?: { toString(): string };
        };
        const isPopulated = Boolean(lessonDoc && typeof lessonDoc === 'object' && lessonDoc.nameAr);

        return {
            id: day._id.toString(),
            nameAr: day.nameAr,
            nameEn: day.nameEn,
            headerTextAr: day.headerTextAr,
            headerTextEn: day.headerTextEn,
            purpose: day.purpose,
            expectedTime: day.expectedTime,
            lessonId: isPopulated ? lessonDoc._id!.toString() : day.lessonId.toString(),
            ...(isPopulated && {
                lesson: {
                    id: lessonDoc._id!.toString(),
                    nameAr: lessonDoc.nameAr,
                    nameEn: lessonDoc.nameEn,
                    days: lessonDoc.days,
                    unitId: lessonDoc.unitId?.toString(),
                },
            }),
        };
    }
}
