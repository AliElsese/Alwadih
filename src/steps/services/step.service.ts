import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Step } from '../schemas/step.schema.js';
import { Phase } from '../../phases/schemas/phase.schema.js';
import { StepLayoutType } from '../enums/step.enum.js';
import { CreateStepDto } from '../dtos/create-step.dto.js';
import { UpdateStepDto } from '../dtos/update-step.dto.js';
import { GetStepsQueryDto } from '../dtos/get-steps-query.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

const PHASE_POPULATE_FIELDS = 'type descriptionAr descriptionEn dayId';

@Injectable()
export class StepService {
    constructor(
        @InjectModel(Step.name) private StepModel: Model<Step>,
        @InjectModel(Phase.name) private PhaseModel: Model<Phase>,
    ) { }

    /**
     * Creates a new step linked to an existing phase.
     */
    async createStep(
        createStepDto: CreateStepDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const descriptionAr = createStepDto.descriptionAr.trim();
        const descriptionEn = createStepDto.descriptionEn.trim();
        const type = createStepDto.type.trim();
        const { layoutType, data, phaseId } = createStepDto;

        await this.ensurePhaseExists(phaseId, msg);

        const createdStep = await this.StepModel.create({
            descriptionAr,
            descriptionEn,
            type,
            layoutType,
            data,
            phaseId,
        });

        await createdStep.populate('phaseId', PHASE_POPULATE_FIELDS);

        return {
            message: msg.stepCreatedSuccess,
            step: this.formatStep(createdStep),
        };
    }

    /**
     * Retrieves all steps, optionally filtered by phaseId.
     */
    async getAllSteps(
        query: GetStepsQueryDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const filter: Record<string, string> = {};

        if (query.phaseId) {
            await this.ensurePhaseExists(query.phaseId, msg);
            filter.phaseId = query.phaseId;
        }

        const steps = await this.StepModel.find(filter)
            .sort({ createdAt: 1 })
            .populate('phaseId', PHASE_POPULATE_FIELDS)
            .exec();

        return {
            message: msg.stepsRetrievedSuccess,
            count: steps.length,
            steps: steps.map((step) => this.formatStep(step)),
        };
    }

    /**
     * Retrieves a single step by its identifier.
     */
    async getStepById(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateStepId(id, msg);

        const step = await this.StepModel.findById(id)
            .populate('phaseId', PHASE_POPULATE_FIELDS)
            .exec();

        if (!step) {
            throw new NotFoundException(msg.stepNotFound);
        }

        return {
            message: msg.stepRetrievedSuccess,
            step: this.formatStep(step),
        };
    }

    /**
     * Updates an existing step.
     */
    async updateStep(
        id: string,
        updateStepDto: UpdateStepDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateStepId(id, msg);

        const existingStep = await this.StepModel.findById(id).exec();
        if (!existingStep) {
            throw new NotFoundException(msg.stepNotFound);
        }

        const updateData: Partial<{
            descriptionAr: string;
            descriptionEn: string;
            type: string;
            layoutType: StepLayoutType;
            data: Record<string, unknown>;
            phaseId: string;
        }> = {};

        if (updateStepDto.descriptionAr !== undefined) {
            updateData.descriptionAr = updateStepDto.descriptionAr.trim();
        }
        if (updateStepDto.descriptionEn !== undefined) {
            updateData.descriptionEn = updateStepDto.descriptionEn.trim();
        }
        if (updateStepDto.type !== undefined) {
            updateData.type = updateStepDto.type.trim();
        }
        if (updateStepDto.layoutType !== undefined) {
            updateData.layoutType = updateStepDto.layoutType;
        }
        if (updateStepDto.data !== undefined) {
            updateData.data = updateStepDto.data;
        }
        if (updateStepDto.phaseId !== undefined) {
            await this.ensurePhaseExists(updateStepDto.phaseId, msg);
            updateData.phaseId = updateStepDto.phaseId;
        }

        const updatedStep = Object.keys(updateData).length > 0
            ? await this.StepModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true },
            )
                .populate('phaseId', PHASE_POPULATE_FIELDS)
                .exec()
            : await existingStep.populate('phaseId', PHASE_POPULATE_FIELDS);

        return {
            message: msg.stepUpdatedSuccess,
            step: this.formatStep(updatedStep!),
        };
    }

    /**
     * Deletes a step by its identifier.
     */
    async deleteStep(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateStepId(id, msg);

        const deletedStep = await this.StepModel.findByIdAndDelete(id)
            .populate('phaseId', PHASE_POPULATE_FIELDS)
            .exec();

        if (!deletedStep) {
            throw new NotFoundException(msg.stepNotFound);
        }

        return {
            message: msg.stepDeletedSuccess,
            step: this.formatStep(deletedStep),
        };
    }

    /**
     * Validates that the provided step ObjectId is well-formed.
     */
    private validateStepId(id: string, msg: ReturnType<typeof getMessages>) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(msg.invalidStepId);
        }
    }

    /**
     * Ensures the referenced Phase exists before creating or linking a step to it.
     */
    private async ensurePhaseExists(
        phaseId: string,
        msg: ReturnType<typeof getMessages>,
    ) {
        if (!isValidObjectId(phaseId)) {
            throw new BadRequestException(msg.invalidPhaseId);
        }

        const exists = await this.PhaseModel.exists({ _id: phaseId });
        if (!exists) {
            throw new NotFoundException(msg.phaseNotFound);
        }
    }

    /**
     * Formats sanitized step response object with linked phase details when populated.
     */
    private formatStep(step: Step) {
        const phaseDoc = step.phaseId as unknown as {
            _id?: { toString(): string };
            type?: string;
            descriptionAr?: string;
            descriptionEn?: string;
            dayId?: { toString(): string };
        };
        const isPopulated = Boolean(phaseDoc && typeof phaseDoc === 'object' && phaseDoc.type);

        return {
            id: step._id.toString(),
            descriptionAr: step.descriptionAr,
            descriptionEn: step.descriptionEn,
            type: step.type,
            layoutType: step.layoutType,
            data: step.data,
            phaseId: isPopulated ? phaseDoc._id!.toString() : step.phaseId.toString(),
            ...(isPopulated && {
                phase: {
                    id: phaseDoc._id!.toString(),
                    type: phaseDoc.type,
                    descriptionAr: phaseDoc.descriptionAr,
                    descriptionEn: phaseDoc.descriptionEn,
                    dayId: phaseDoc.dayId?.toString(),
                },
            }),
        };
    }
}
