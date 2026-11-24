import {
    BadRequestException,
    Injectable,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Letter, LetterDocument } from '../schemas/letter.schema.js';
import { LetterType, LETTER_TYPE_LABELS } from '../enums/letter.enum.js';
import { GetLettersQueryDto } from '../dtos/get-letters-query.dto.js';
import { UpdateLetterAudioDto } from '../dtos/update-letter-audio.dto.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';

export const INITIAL_ARABIC_LETTERS: Array<{
    letter: string;
    nameAr: string;
    nameEn: string;
    order: number;
    type: LetterType | null;
}> = [
    { letter: 'أ', nameAr: 'ألف', nameEn: 'Alif', order: 1, type: LetterType.TARQEEQ_WA_TAFKHEEM },
    { letter: 'ب', nameAr: 'باء', nameEn: 'Baa', order: 2, type: null },
    { letter: 'ت', nameAr: 'تاء', nameEn: 'Taa', order: 3, type: null },
    { letter: 'ث', nameAr: 'ثاء', nameEn: 'Thaa', order: 4, type: LetterType.LATHWI },
    { letter: 'ج', nameAr: 'جيم', nameEn: 'Jeem', order: 5, type: null },
    { letter: 'ح', nameAr: 'حاء', nameEn: 'Haa', order: 6, type: null },
    { letter: 'خ', nameAr: 'خاء', nameEn: 'Khaa', order: 7, type: LetterType.TAFKHEEM },
    { letter: 'د', nameAr: 'دال', nameEn: 'Daal', order: 8, type: null },
    { letter: 'ذ', nameAr: 'ذال', nameEn: 'Dhaal', order: 9, type: LetterType.LATHWI },
    { letter: 'ر', nameAr: 'راء', nameEn: 'Raa', order: 10, type: LetterType.TARQEEQ_WA_TAFKHEEM },
    { letter: 'ز', nameAr: 'زاي', nameEn: 'Zay', order: 11, type: null },
    { letter: 'س', nameAr: 'سين', nameEn: 'Seen', order: 12, type: null },
    { letter: 'ش', nameAr: 'شين', nameEn: 'Sheen', order: 13, type: null },
    { letter: 'ص', nameAr: 'صاد', nameEn: 'Saad', order: 14, type: LetterType.TAFKHEEM },
    { letter: 'ض', nameAr: 'ضاد', nameEn: 'Daad', order: 15, type: LetterType.TAFKHEEM },
    { letter: 'ط', nameAr: 'طاء', nameEn: 'Taa (Emphatic)', order: 16, type: LetterType.TAFKHEEM },
    { letter: 'ظ', nameAr: 'ظاء', nameEn: 'Zhaa', order: 17, type: LetterType.LATHWI_MUFAKKHAM },
    { letter: 'ع', nameAr: 'عين', nameEn: 'Ayn', order: 18, type: null },
    { letter: 'غ', nameAr: 'غين', nameEn: 'Ghayn', order: 19, type: LetterType.TAFKHEEM },
    { letter: 'ف', nameAr: 'فاء', nameEn: 'Faa', order: 20, type: null },
    { letter: 'ق', nameAr: 'قاف', nameEn: 'Qaaf', order: 21, type: LetterType.TAFKHEEM },
    { letter: 'ك', nameAr: 'كاف', nameEn: 'Kaaf', order: 22, type: null },
    { letter: 'ل', nameAr: 'لام', nameEn: 'Laam', order: 23, type: LetterType.TARQEEQ_WA_TAFKHEEM },
    { letter: 'م', nameAr: 'ميم', nameEn: 'Meem', order: 24, type: null },
    { letter: 'ن', nameAr: 'نون', nameEn: 'Noon', order: 25, type: null },
    { letter: 'هـ', nameAr: 'هاء', nameEn: 'Haa', order: 26, type: null },
    { letter: 'و', nameAr: 'واو', nameEn: 'Waaw', order: 27, type: null },
    { letter: 'ي', nameAr: 'ياء', nameEn: 'Yaa', order: 28, type: null },
];

@Injectable()
export class LetterService implements OnModuleInit {
    constructor(
        @InjectModel(Letter.name) private letterModel: Model<LetterDocument>,
    ) { }

    /**
     * Seeds the standard 28 Arabic letters automatically if collection is empty.
     */
    async onModuleInit() {
        await this.seedDefaultLettersIfEmpty();
    }

    async seedDefaultLettersIfEmpty() {
        const count = await this.letterModel.countDocuments().exec();
        if (count === 0) {
            await this.letterModel.insertMany(INITIAL_ARABIC_LETTERS);
        }
    }

    /**
     * Public API: Retrieves all Arabic letters, optionally filtered by tajweed type.
     */
    async getAllLetters(
        query: GetLettersQueryDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        const filter: Record<string, unknown> = {};

        if (query.type) {
            filter.type = query.type;
        }

        const letters = await this.letterModel
            .find(filter)
            .sort({ order: 1 })
            .exec();

        return {
            message: msg.lettersRetrievedSuccess,
            count: letters.length,
            letters: letters.map((l) => this.formatLetter(l, lang)),
        };
    }

    /**
     * Public API: Retrieves a single Arabic letter by its ObjectId or letter character.
     */
    async getLetterById(
        idOrChar: string,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        let letter: LetterDocument | null = null;

        if (isValidObjectId(idOrChar)) {
            letter = await this.letterModel.findById(idOrChar).exec();
        } else {
            letter = await this.letterModel.findOne({ letter: idOrChar.trim() }).exec();
        }

        if (!letter) {
            throw new NotFoundException(msg.letterNotFound);
        }

        return {
            message: msg.letterRetrievedSuccess,
            letter: this.formatLetter(letter, lang),
        };
    }

    /**
     * Admin-only API: Updates or sets the audio clip URL for an Arabic letter.
     */
    async updateLetterAudio(
        id: string,
        dto: UpdateLetterAudioDto,
        lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN,
    ) {
        const msg = getMessages(lang);
        if (!isValidObjectId(id)) {
            throw new BadRequestException(msg.invalidLetterId);
        }

        const updatedLetter = await this.letterModel.findByIdAndUpdate(
            id,
            { $set: { audioUrl: dto.audioUrl.trim() } },
            { new: true },
        ).exec();

        if (!updatedLetter) {
            throw new NotFoundException(msg.letterNotFound);
        }

        return {
            message: msg.letterAudioUpdatedSuccess,
            letter: this.formatLetter(updatedLetter, lang),
        };
    }

    /**
     * Formats letter document with localized type labels and clean properties.
     */
    formatLetter(letter: LetterDocument, lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
        const type = letter.type as LetterType | null;
        const typeMeta = type ? LETTER_TYPE_LABELS[type] : null;

        return {
            id: letter._id.toString(),
            letter: letter.letter,
            nameAr: letter.nameAr,
            nameEn: letter.nameEn,
            name: lang === 'ar' ? letter.nameAr : letter.nameEn,
            type: type ?? null,
            typeLabelAr: typeMeta?.ar ?? null,
            typeLabelEn: typeMeta?.en ?? null,
            typeLabel: typeMeta ? (lang === 'ar' ? typeMeta.ar : typeMeta.en) : null,
            audioUrl: letter.audioUrl ?? null,
            order: letter.order,
        };
    }
}
