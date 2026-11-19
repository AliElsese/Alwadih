import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Phase } from '../schemas/phase.schema.js';
import { Day } from '../../days/schemas/day.schema.js';
import { PhaseType } from '../enums/phase.enum.js';
import { CreatePhaseDto } from '../dtos/create-phase.dto.js';
import { UpdatePhaseDto } from '../dtos/update-phase.dto.js';
import { GetPhasesQueryDto } from '../dtos/get-phases-query.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

const DAY_POPULATE_FIELDS = 'nameAr nameEn headerTextAr headerTextEn purpose expectedTime lessonId';

@Injectable()
export class PhaseService {
    constructor(
        @InjectModel(Phase.name) private PhaseModel: Model<Phase>,
        @InjectModel(Day.name) private DayModel: Model<Day>,
    ) { }

    /**
     * Creates a new phase linked to an existing day.
     */
    async createPhase(
        createPhaseDto: CreatePhaseDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const { type, dayId } = createPhaseDto;
        const descriptionAr = createPhaseDto.descriptionAr.trim();
        const descriptionEn = createPhaseDto.descriptionEn.trim();

        await this.ensureDayExists(dayId, msg);
        await this.ensureUniqueTypeInDay(msg, dayId, type);

        const createdPhase = await this.PhaseModel.create({
            type,
            descriptionAr,
            descriptionEn,
            dayId,
        });

        await createdPhase.populate('dayId', DAY_POPULATE_FIELDS);

        return {
            message: msg.phaseCreatedSuccess,
            phase: this.formatPhase(createdPhase),
        };
    }

    /**
     * Retrieves all phases, optionally filtered by dayId.
     */
    async getAllPhases(
        query: GetPhasesQueryDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const filter: Record<string, string> = {};

        if (query.dayId) {
            await this.ensureDayExists(query.dayId, msg);
            filter.dayId = query.dayId;
        }

        const phases = await this.PhaseModel.find(filter)
            .sort({ createdAt: 1 })
            .populate('dayId', DAY_POPULATE_FIELDS)
            .exec();

        return {
            message: msg.phasesRetrievedSuccess,
            count: phases.length,
            phases: phases.map((phase) => this.formatPhase(phase)),
        };
    }

    /**
     * Retrieves a single phase by its identifier.
     */
    async getPhaseById(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validatePhaseId(id, msg);

        const phase = await this.PhaseModel.findById(id)
            .populate('dayId', DAY_POPULATE_FIELDS)
            .exec();

        if (!phase) {
            throw new NotFoundException(msg.phaseNotFound);
        }

        return {
            message: msg.phaseRetrievedSuccess,
            phase: this.formatPhase(phase),
        };
    }

    /**
     * Updates an existing phase.
     */
    async updatePhase(
        id: string,
        updatePhaseDto: UpdatePhaseDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validatePhaseId(id, msg);

        const existingPhase = await this.PhaseModel.findById(id).exec();
        if (!existingPhase) {
            throw new NotFoundException(msg.phaseNotFound);
        }

        const updateData: Partial<{
            type: PhaseType;
            descriptionAr: string;
            descriptionEn: string;
            dayId: string;
        }> = {};

        if (updatePhaseDto.type !== undefined) {
            updateData.type = updatePhaseDto.type;
        }
        if (updatePhaseDto.descriptionAr !== undefined) {
            updateData.descriptionAr = updatePhaseDto.descriptionAr.trim();
        }
        if (updatePhaseDto.descriptionEn !== undefined) {
            updateData.descriptionEn = updatePhaseDto.descriptionEn.trim();
        }

        const targetDayId = updatePhaseDto.dayId ?? existingPhase.dayId.toString();
        const targetType = updatePhaseDto.type ?? existingPhase.type;

        if (updatePhaseDto.dayId !== undefined) {
            await this.ensureDayExists(updatePhaseDto.dayId, msg);
            updateData.dayId = updatePhaseDto.dayId;
        }

        if (updatePhaseDto.type !== undefined || updatePhaseDto.dayId !== undefined) {
            await this.ensureUniqueTypeInDay(msg, targetDayId, targetType, id);
        }

        const updatedPhase = Object.keys(updateData).length > 0
            ? await this.PhaseModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true },
            )
                .populate('dayId', DAY_POPULATE_FIELDS)
                .exec()
            : await existingPhase.populate('dayId', DAY_POPULATE_FIELDS);

        return {
            message: msg.phaseUpdatedSuccess,
            phase: this.formatPhase(updatedPhase!),
        };
    }

    /**
     * Deletes a phase by its identifier.
     */
    async deletePhase(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validatePhaseId(id, msg);

        const deletedPhase = await this.PhaseModel.findByIdAndDelete(id)
            .populate('dayId', DAY_POPULATE_FIELDS)
            .exec();

        if (!deletedPhase) {
            throw new NotFoundException(msg.phaseNotFound);
        }

        return {
            message: msg.phaseDeletedSuccess,
            phase: this.formatPhase(deletedPhase),
        };
    }

    /**
     * Validates that the provided phase ObjectId is well-formed.
     */
    private validatePhaseId(id: string, msg: ReturnType<typeof getMessages>) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(msg.invalidPhaseId);
        }
    }

    /**
     * Ensures the referenced Day exists before creating or linking a phase to it.
     */
    private async ensureDayExists(
        dayId: string,
        msg: ReturnType<typeof getMessages>,
    ) {
        if (!isValidObjectId(dayId)) {
            throw new BadRequestException(msg.invalidDayId);
        }

        const exists = await this.DayModel.exists({ _id: dayId });
        if (!exists) {
            throw new NotFoundException(msg.dayNotFound);
        }
    }

    /**
     * Ensures no duplicate phase type exists within the same day.
     */
    private async ensureUniqueTypeInDay(
        msg: ReturnType<typeof getMessages>,
        dayId: string,
        type: PhaseType,
        excludeId?: string,
    ) {
        const query: Record<string, unknown> = {
            dayId,
            type,
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await this.PhaseModel.findOne(query).exec();
        if (existing) {
            throw new ConflictException(msg.phaseAlreadyExists);
        }
    }

    /**
     * Formats sanitized phase response object with linked day details when populated.
     */
    private formatPhase(phase: Phase) {
        const dayDoc = phase.dayId as unknown as {
            _id?: { toString(): string };
            nameAr?: string;
            nameEn?: string;
            headerTextAr?: string;
            headerTextEn?: string;
            purpose?: string;
            expectedTime?: number;
            lessonId?: { toString(): string };
        };
        const isPopulated = Boolean(dayDoc && typeof dayDoc === 'object' && dayDoc.nameAr);

        return {
            id: phase._id.toString(),
            type: phase.type,
            descriptionAr: phase.descriptionAr,
            descriptionEn: phase.descriptionEn,
            dayId: isPopulated ? dayDoc._id!.toString() : phase.dayId.toString(),
            ...(isPopulated && {
                day: {
                    id: dayDoc._id!.toString(),
                    nameAr: dayDoc.nameAr,
                    nameEn: dayDoc.nameEn,
                    headerTextAr: dayDoc.headerTextAr,
                    headerTextEn: dayDoc.headerTextEn,
                    purpose: dayDoc.purpose,
                    expectedTime: dayDoc.expectedTime,
                    lessonId: dayDoc.lessonId?.toString(),
                },
            }),
        };
    }
}
