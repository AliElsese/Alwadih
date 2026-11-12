import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Unit } from '../schemas/unit.schema.js';
import { Part } from '../../parts/schemas/part.schema.js';
import { CreateUnitDto } from '../dtos/create-unit.dto.js';
import { UpdateUnitDto } from '../dtos/update-unit.dto.js';
import { GetUnitsQueryDto } from '../dtos/get-units-query.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

@Injectable()
export class UnitService {
    constructor(
        @InjectModel(Unit.name) private UnitModel: Model<Unit>,
        @InjectModel(Part.name) private PartModel: Model<Part>,
    ) { }

    /**
     * Creates a new unit linked to an existing part.
     */
    async createUnit(
        createUnitDto: CreateUnitDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const hintAr = createUnitDto.hintAr.trim();
        const hintEn = createUnitDto.hintEn.trim();
        const labelAr = createUnitDto.labelAr.trim();
        const labelEn = createUnitDto.labelEn.trim();
        const { partId } = createUnitDto;

        await this.ensurePartExists(partId, msg);
        await this.ensureUniqueLabelsInPart(msg, partId, labelAr, labelEn);

        const createdUnit = await this.UnitModel.create({
            hintAr,
            hintEn,
            labelAr,
            labelEn,
            partId,
        });

        await createdUnit.populate('partId', 'partNameAr partNameEn');

        return {
            message: msg.unitCreatedSuccess,
            unit: this.formatUnit(createdUnit),
        };
    }

    /**
     * Retrieves all units, optionally filtered by partId.
     */
    async getAllUnits(
        query: GetUnitsQueryDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const filter: Record<string, string> = {};

        if (query.partId) {
            await this.ensurePartExists(query.partId, msg);
            filter.partId = query.partId;
        }

        const units = await this.UnitModel.find(filter)
            .sort({ createdAt: 1 })
            .populate('partId', 'partNameAr partNameEn')
            .exec();

        return {
            message: msg.unitsRetrievedSuccess,
            count: units.length,
            units: units.map((unit) => this.formatUnit(unit)),
        };
    }

    /**
     * Retrieves a single unit by its identifier.
     */
    async getUnitById(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUnitId(id, msg);

        const unit = await this.UnitModel.findById(id)
            .populate('partId', 'partNameAr partNameEn')
            .exec();

        if (!unit) {
            throw new NotFoundException(msg.unitNotFound);
        }

        return {
            message: msg.unitRetrievedSuccess,
            unit: this.formatUnit(unit),
        };
    }

    /**
     * Partially updates a unit's fields or moves it to another existing part.
     */
    async updateUnit(
        id: string,
        updateUnitDto: UpdateUnitDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUnitId(id, msg);

        const existingUnit = await this.UnitModel.findById(id).exec();
        if (!existingUnit) {
            throw new NotFoundException(msg.unitNotFound);
        }

        const targetPartId = updateUnitDto.partId ?? existingUnit.partId.toString();
        if (updateUnitDto.partId !== undefined) {
            await this.ensurePartExists(targetPartId, msg);
        }

        const updateData: Partial<{
            hintAr: string;
            hintEn: string;
            labelAr: string;
            labelEn: string;
            partId: string;
        }> = {};

        if (updateUnitDto.hintAr !== undefined) {
            updateData.hintAr = updateUnitDto.hintAr.trim();
        }
        if (updateUnitDto.hintEn !== undefined) {
            updateData.hintEn = updateUnitDto.hintEn.trim();
        }
        if (updateUnitDto.labelAr !== undefined) {
            updateData.labelAr = updateUnitDto.labelAr.trim();
        }
        if (updateUnitDto.labelEn !== undefined) {
            updateData.labelEn = updateUnitDto.labelEn.trim();
        }
        if (updateUnitDto.partId !== undefined) {
            updateData.partId = updateUnitDto.partId;
        }

        if (
            updateData.labelAr !== undefined ||
            updateData.labelEn !== undefined ||
            updateData.partId !== undefined
        ) {
            await this.ensureUniqueLabelsInPart(
                msg,
                targetPartId,
                updateData.labelAr ?? existingUnit.labelAr,
                updateData.labelEn ?? existingUnit.labelEn,
                id,
            );
        }

        const updatedUnit = Object.keys(updateData).length > 0
            ? await this.UnitModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true },
            )
                .populate('partId', 'partNameAr partNameEn')
                .exec()
            : await existingUnit.populate('partId', 'partNameAr partNameEn');

        return {
            message: msg.unitUpdatedSuccess,
            unit: this.formatUnit(updatedUnit!),
        };
    }

    /**
     * Deletes a unit by its identifier.
     */
    async deleteUnit(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validateUnitId(id, msg);

        const deletedUnit = await this.UnitModel.findByIdAndDelete(id)
            .populate('partId', 'partNameAr partNameEn')
            .exec();

        if (!deletedUnit) {
            throw new NotFoundException(msg.unitNotFound);
        }

        return {
            message: msg.unitDeletedSuccess,
            unit: this.formatUnit(deletedUnit),
        };
    }

    /**
     * Validates that the provided unit ObjectId is well-formed.
     */
    private validateUnitId(id: string, msg: ReturnType<typeof getMessages>) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(msg.invalidUnitId);
        }
    }

    /**
     * Ensures the referenced Part exists before creating or linking a unit to it.
     */
    private async ensurePartExists(
        partId: string,
        msg: ReturnType<typeof getMessages>,
    ) {
        if (!isValidObjectId(partId)) {
            throw new BadRequestException(msg.invalidPartId);
        }

        const exists = await this.PartModel.exists({ _id: partId });
        if (!exists) {
            throw new NotFoundException(msg.partNotFound);
        }
    }

    /**
     * Ensures no duplicate Arabic or English unit label exists within the same part.
     */
    private async ensureUniqueLabelsInPart(
        msg: ReturnType<typeof getMessages>,
        partId: string,
        labelAr?: string,
        labelEn?: string,
        excludeId?: string,
    ) {
        const orConditions: Array<Record<string, string>> = [];

        if (labelAr) {
            orConditions.push({ labelAr });
        }
        if (labelEn) {
            orConditions.push({ labelEn });
        }

        if (orConditions.length === 0) {
            return;
        }

        const query: Record<string, unknown> = {
            partId,
            $or: orConditions,
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await this.UnitModel.findOne(query).exec();
        if (existing) {
            throw new ConflictException(msg.unitAlreadyExists);
        }
    }

    /**
     * Formats sanitized unit response object with linked part details when populated.
     */
    private formatUnit(unit: Unit) {
        const partDoc = unit.partId as unknown as {
            _id?: { toString(): string };
            partNameAr?: string;
            partNameEn?: string;
        };
        const isPopulated = Boolean(partDoc && typeof partDoc === 'object' && partDoc.partNameAr);

        return {
            id: unit._id.toString(),
            hintAr: unit.hintAr,
            hintEn: unit.hintEn,
            labelAr: unit.labelAr,
            labelEn: unit.labelEn,
            partId: isPopulated ? partDoc._id!.toString() : unit.partId.toString(),
            ...(isPopulated && {
                part: {
                    id: partDoc._id!.toString(),
                    partNameAr: partDoc.partNameAr,
                    partNameEn: partDoc.partNameEn,
                },
            })
        };
    }
}