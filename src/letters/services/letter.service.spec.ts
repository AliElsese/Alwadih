import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LetterService, INITIAL_ARABIC_LETTERS } from './letter.service.js';
import { LetterType } from '../enums/letter.enum.js';
import { Types } from 'mongoose';
import { AppLanguage } from '../../common/i18n/language.decorator.js';

describe('LetterService', () => {
    let service: LetterService;
    let mockLetterModel: any;

    const mockId = new Types.ObjectId();
    const sampleLetterDoc = {
        _id: mockId,
        letter: 'ث',
        nameAr: 'ثاء',
        nameEn: 'Thaa',
        type: LetterType.LATHWI,
        audioUrl: 'https://cdn.alwadih.com/audio/letters/thaa.mp3',
        order: 4,
    };

    beforeEach(() => {
        mockLetterModel = {
            countDocuments: vi.fn(),
            insertMany: vi.fn(),
            find: vi.fn(),
            findOne: vi.fn(),
            findById: vi.fn(),
            findByIdAndUpdate: vi.fn(),
        };

        service = new LetterService(mockLetterModel);
    });

    it('should seed default 28 letters when database is empty', async () => {
        mockLetterModel.countDocuments.mockReturnValue({
            exec: vi.fn().mockResolvedValue(0),
        });

        await service.seedDefaultLettersIfEmpty();

        expect(mockLetterModel.insertMany).toHaveBeenCalledWith(INITIAL_ARABIC_LETTERS);
        expect(INITIAL_ARABIC_LETTERS).toHaveLength(28);
    });

    it('should not re-seed letters when database already has documents', async () => {
        mockLetterModel.countDocuments.mockReturnValue({
            exec: vi.fn().mockResolvedValue(28),
        });

        await service.seedDefaultLettersIfEmpty();

        expect(mockLetterModel.insertMany).not.toHaveBeenCalled();
    });

    it('should return all letters with localized type labels', async () => {
        mockLetterModel.find.mockReturnValue({
            sort: vi.fn().mockReturnValue({
                exec: vi.fn().mockResolvedValue([sampleLetterDoc]),
            }),
        });

        const res = await service.getAllLetters({}, AppLanguage.AR);

        expect(res.count).toBe(1);
        expect(res.letters[0].letter).toBe('ث');
        expect(res.letters[0].type).toBe(LetterType.LATHWI);
        expect(res.letters[0].typeLabelAr).toBe('حروف لثوية');
        expect(res.letters[0].typeLabelEn).toBe('Interdental Letters');
        expect(res.letters[0].audioUrl).toBe('https://cdn.alwadih.com/audio/letters/thaa.mp3');
    });

    it('should filter letters by type when provided in query', async () => {
        mockLetterModel.find.mockImplementation((filter: any) => {
            expect(filter.type).toBe(LetterType.TAFKHEEM);
            return {
                sort: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue([]),
                }),
            };
        });

        const res = await service.getAllLetters({ type: LetterType.TAFKHEEM }, AppLanguage.EN);
        expect(res.count).toBe(0);
    });

    it('should get a letter by ObjectId', async () => {
        mockLetterModel.findById.mockReturnValue({
            exec: vi.fn().mockResolvedValue(sampleLetterDoc),
        });

        const res = await service.getLetterById(mockId.toString(), AppLanguage.EN);
        expect(res.letter.id).toBe(mockId.toString());
        expect(res.letter.letter).toBe('ث');
    });

    it('should get a letter by character if not a valid ObjectId', async () => {
        mockLetterModel.findOne.mockReturnValue({
            exec: vi.fn().mockResolvedValue(sampleLetterDoc),
        });

        const res = await service.getLetterById('ث', AppLanguage.AR);
        expect(mockLetterModel.findOne).toHaveBeenCalledWith({ letter: 'ث' });
        expect(res.letter.letter).toBe('ث');
    });

    it('should throw NotFoundException if letter does not exist', async () => {
        mockLetterModel.findById.mockReturnValue({
            exec: vi.fn().mockResolvedValue(null),
        });

        await expect(service.getLetterById(mockId.toString(), AppLanguage.EN)).rejects.toThrow();
    });

    it('should update letter audioUrl by admin', async () => {
        const updatedDoc = {
            ...sampleLetterDoc,
            audioUrl: 'https://cdn.alwadih.com/audio/letters/thaa_new.mp3',
        };

        mockLetterModel.findByIdAndUpdate.mockReturnValue({
            exec: vi.fn().mockResolvedValue(updatedDoc),
        });

        const res = await service.updateLetterAudio(
            mockId.toString(),
            { audioUrl: 'https://cdn.alwadih.com/audio/letters/thaa_new.mp3' },
            AppLanguage.AR,
        );

        expect(res.letter.audioUrl).toBe('https://cdn.alwadih.com/audio/letters/thaa_new.mp3');
    });

    it('should throw BadRequestException when updating audio with invalid ObjectId', async () => {
        await expect(
            service.updateLetterAudio(
                'invalid-id',
                { audioUrl: 'https://example.com/audio.mp3' },
                AppLanguage.EN,
            ),
        ).rejects.toThrow();
    });
});
