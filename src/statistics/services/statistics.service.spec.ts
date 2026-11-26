import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatisticsService } from './statistics.service.js';
import { Types } from 'mongoose';
import { AppLanguage } from '../../common/i18n/language.decorator.js';

describe('StatisticsService', () => {
    let service: StatisticsService;
    let mockPartModel: any;
    let mockUnitModel: any;
    let mockLessonModel: any;
    let mockDayModel: any;
    let mockPhaseModel: any;
    let mockStepModel: any;

    const mockPart1Id = new Types.ObjectId();
    const mockUnit1Id = new Types.ObjectId();
    const mockLesson1Id = new Types.ObjectId();
    const mockDay1Id = new Types.ObjectId();
    const mockPhase1Id = new Types.ObjectId();
    const mockStep1Id = new Types.ObjectId();
    const mockStep2Id = new Types.ObjectId();

    beforeEach(() => {
        mockPartModel = {
            find: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue([
                            { _id: mockPart1Id, partNameAr: 'الجزء الأول', partNameEn: 'Part 1' },
                        ]),
                    }),
                }),
            }),
        };

        mockUnitModel = {
            find: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue([
                        { _id: mockUnit1Id, partId: mockPart1Id, labelAr: 'الوحدة 1', labelEn: 'Unit 1' },
                    ]),
                }),
            }),
        };

        mockLessonModel = {
            find: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue([
                        { _id: mockLesson1Id, unitId: mockUnit1Id, nameAr: 'الدرس 1', nameEn: 'Lesson 1', days: 2 },
                    ]),
                }),
            }),
        };

        mockDayModel = {
            find: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue([
                        { _id: mockDay1Id, lessonId: mockLesson1Id },
                    ]),
                }),
            }),
        };

        mockPhaseModel = {
            find: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue([
                        { _id: mockPhase1Id, dayId: mockDay1Id },
                    ]),
                }),
            }),
        };

        mockStepModel = {
            find: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue([
                        { _id: mockStep1Id, phaseId: mockPhase1Id, layoutType: 'GRID-4' },
                        { _id: mockStep2Id, phaseId: mockPhase1Id, layoutType: 'GRID-2' },
                    ]),
                }),
            }),
        };

        service = new StatisticsService(
            mockPartModel,
            mockUnitModel,
            mockLessonModel,
            mockDayModel,
            mockPhaseModel,
            mockStepModel,
        );
    });

    it('should calculate correct unitsCount, lessonsCount, stepsCount, and layoutTypesCount per part', async () => {
        const res = await service.getPartsStatistics(AppLanguage.AR);

        expect(res.parts).toHaveLength(1);
        const part = res.parts[0];

        expect(part.partId).toBe(mockPart1Id.toString());
        expect(part.partNameAr).toBe('الجزء الأول');
        expect(part.unitsCount).toBe(1);
        expect(part.lessonsCount).toBe(1);
        expect(part.stepsCount).toBe(2);
        expect(part.layoutTypesCount).toBe(2); // GRID-4 and GRID-2

        // Verify "units" array is NOT returned
        expect((part as any).units).toBeUndefined();

        // Verify summary
        expect(res.summary.totalParts).toBe(1);
        expect(res.summary.totalUnits).toBe(1);
        expect(res.summary.totalLessons).toBe(1);
        expect(res.summary.totalSteps).toBe(2);
        expect(res.summary.layoutTypesCount).toBe(2);
    });
});
