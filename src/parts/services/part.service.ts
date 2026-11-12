import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Part } from '../schemas/part.schema.js';
import { Model, isValidObjectId } from 'mongoose';
import { AddPartDto } from '../dtos/add-part.dto.js';
import { UpdatePartDto } from '../dtos/update-part.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

@Injectable()
export class PartService {
    constructor(
        @InjectModel(Part.name) private PartModel: Model<Part>,
    ) { }

    /**
        * Creates a new part entry after verifying uniqueness of Arabic and English names.
    */
    async addPart(
        addPartDto: AddPartDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const partNameAr = addPartDto.partNameAr.trim();
        const partNameEn = addPartDto.partNameEn.trim();

        await this.ensureUniquePartNames(msg, partNameAr, partNameEn);

        const createdPart = await this.PartModel.create({
            partNameAr,
            partNameEn,
        });

        return {
            message: msg.partCreatedSuccess,
            part: this.formatPart(createdPart),
        };
    }

    /**
        * Retrieves all parts ordered chronologically by creation date.
    */
    async getAllParts(lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const msg = getMessages(lang);

        const parts = await this.PartModel.find().sort({ createdAt: 1 }).exec();

        return {
            message: msg.partsRetrievedSuccess,
            count: parts.length,
            parts: parts.map((part) => this.formatPart(part)),
        };
    }

    /**
        * Retrieves a single part by its identifier.
    */
    async getPartById(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validatePartId(id, msg);

        const part = await this.PartModel.findById(id).exec();
        if (!part) {
            throw new NotFoundException(msg.partNotFound);
        }

        return {
            message: msg.partRetrievedSuccess,
            part: this.formatPart(part),
        };
    }

    /**
        * Partially updates an existing part's Arabic and/or English name.
    */
    async updatePart(
        id: string,
        updatePartDto: UpdatePartDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validatePartId(id, msg);

        const updateData: Partial<{ partNameAr: string; partNameEn: string }> = {};

        if (updatePartDto.partNameAr !== undefined) {
            updateData.partNameAr = updatePartDto.partNameAr.trim();
        }
        if (updatePartDto.partNameEn !== undefined) {
            updateData.partNameEn = updatePartDto.partNameEn.trim();
        }

        await this.ensureUniquePartNames(
            msg,
            updateData.partNameAr,
            updateData.partNameEn,
            id,
        );

        const updatedPart = Object.keys(updateData).length > 0
            ? await this.PartModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true },
            ).exec()
            : await this.PartModel.findById(id).exec();

        if (!updatedPart) {
            throw new NotFoundException(msg.partNotFound);
        }

        return {
            message: msg.partUpdatedSuccess,
            part: this.formatPart(updatedPart),
        };
    }

    /**
        * Deletes a part by its identifier.
    */
    async deletePart(
        id: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        this.validatePartId(id, msg);

        const deletedPart = await this.PartModel.findByIdAndDelete(id).exec();
        if (!deletedPart) {
            throw new NotFoundException(msg.partNotFound);
        }

        return {
            message: msg.partDeletedSuccess,
            part: this.formatPart(deletedPart),
        };
    }

    /**
        * Validates that the provided MongoDB ObjectId is well-formed.
    */
    private validatePartId(id: string, msg: ReturnType<typeof getMessages>) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(msg.invalidPartId);
        }
    }

    /**
        * Ensures no other part already uses the provided Arabic or English name.
    */
    private async ensureUniquePartNames(
        msg: ReturnType<typeof getMessages>,
        partNameAr?: string,
        partNameEn?: string,
        excludeId?: string,
    ) {
        const orConditions: Array<Record<string, string>> = [];

        if (partNameAr) {
            orConditions.push({ partNameAr });
        }
        if (partNameEn) {
            orConditions.push({ partNameEn });
        }

        if (orConditions.length === 0) {
            return;
        }

        const query: Record<string, unknown> = { $or: orConditions };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await this.PartModel.findOne(query).exec();
        if (existing) {
            throw new ConflictException(msg.partAlreadyExists);
        }
    }

    /**
        * Formats sanitized part response object.
    */
    private formatPart(part: Part) {
        return {
            id: part._id.toString(),
            partNameAr: part.partNameAr,
            partNameEn: part.partNameEn
        };
    }
}