import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JourneyService } from './journey.service.js';
import { DayProgressStatus, LessonProgressStatus } from '../enums/journey.enum.js';
import { Types } from 'mongoose';
import { AppLanguage } from '../../common/i18n/language.decorator.js';

describe('JourneyService', () => {
    let service: JourneyService;
    let mockUserProgressModel: any;
    let mockPartModel: any;
    let mockUnitModel: any;
    let mockLessonModel: any;
    let mockDayModel: any;
    let mockPhaseModel: any;
    let mockStepModel: any;

    const mockUserId = new Types.ObjectId().toString();
    const mockPart1Id = new Types.ObjectId();
    const mockPart2Id = new Types.ObjectId();
    const mockUnit1Id = new Types.ObjectId();
    const mockLesson1Id = new Types.ObjectId();
    const mockLesson2Id = new Types.ObjectId();
    const mockDay1Id = new Types.ObjectId();
    const mockDay2Id = new Types.ObjectId();
    const mockPhase1Id = new Types.ObjectId();
    const mockStep1Id = new Types.ObjectId();

    const mockSteps = [
        {
            _id: mockStep1Id,
            phaseId: mockPhase1Id,
            descriptionAr: 'خطوة 1',
            descriptionEn: 'Step 1',
            type: 'letter-recognition',
            layoutType: 'GRID-4',
            data: { items: [{ text: 'ء', audioUrl: 'https://cdn.example.com/audio.mp3' }] },
            createdAt: new Date(1000),
        },
    ];

    const mockParts = [
        { _id: mockPart1Id, partNameAr: 'الجزء الأول', partNameEn: 'Part 1', createdAt: new Date(1000) },
        { _id: mockPart2Id, partNameAr: 'الجزء الثاني', partNameEn: 'Part 2', createdAt: new Date(2000) },
    ];

    const mockUnits = [
        {
            _id: mockUnit1Id,
            partId: mockPart1Id,
            hintAr: 'تلميح الوحدة الأولى',
            hintEn: 'Unit 1 Hint',
            labelAr: 'الوحدة الأولى',
            labelEn: 'Unit 1',
            createdAt: new Date(1000),
        },
    ];

    const mockLessons = [
        {
            _id: mockLesson1Id,
            unitId: mockUnit1Id,
            nameAr: 'الدرس الأول',
            nameEn: 'Lesson 1',
            days: 2,
            createdAt: new Date(1000),
        },
        {
            _id: mockLesson2Id,
            unitId: mockUnit1Id,
            nameAr: 'الدرس الثاني',
            nameEn: 'Lesson 2',
            days: 2,
            createdAt: new Date(2000),
        },
    ];

    const mockDaysLesson1 = [
        {
            _id: mockDay1Id,
            nameAr: 'اليوم الأول',
            nameEn: 'Day 1',
            headerTextAr: 'رأس 1',
            headerTextEn: 'Header 1',
            purpose: 'هدف 1',
            expectedTime: 20,
            lessonId: mockLesson1Id,
            createdAt: new Date(1000),
        },
        {
            _id: mockDay2Id,
            nameAr: 'اليوم الثاني',
            nameEn: 'Day 2',
            headerTextAr: 'رأس 2',
            headerTextEn: 'Header 2',
            purpose: 'هدف 2',
            expectedTime: 25,
            lessonId: mockLesson1Id,
            createdAt: new Date(2000),
        },
    ];

    const mockPhases = [
        {
            _id: mockPhase1Id,
            type: 'learning',
            descriptionAr: 'شرح نظري',
            descriptionEn: 'Theoretical explanation',
            dayId: mockDay1Id,
            createdAt: new Date(1000),
        },
    ];

    beforeEach(() => {
        mockPartModel = {
            find: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(mockParts),
                    }),
                }),
            }),
        };

        mockUnitModel = {
            find: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(mockUnits),
                    }),
                }),
            }),
            findById: vi.fn().mockImplementation((id: string) => ({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue(
                        mockUnits.find((u) => u._id.toString() === id.toString()),
                    ),
                }),
            })),
        };

        mockLessonModel = {
            find: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(mockLessons),
                    }),
                }),
            }),
            findById: vi.fn().mockImplementation((id: string) => ({
                exec: vi.fn().mockResolvedValue(
                    mockLessons.find((l) => l._id.toString() === id.toString()),
                ),
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue(
                        mockLessons.find((l) => l._id.toString() === id.toString()),
                    ),
                }),
            })),
        };

        mockDayModel = {
            find: vi.fn().mockImplementation((query: any) => ({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(
                            query.lessonId?.toString() === mockLesson1Id.toString() ? mockDaysLesson1 : [],
                        ),
                    }),
                }),
            })),
            findOne: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(mockDaysLesson1[0]),
                    }),
                }),
            }),
            findById: vi.fn().mockImplementation((id: string) => ({
                exec: vi.fn().mockResolvedValue(
                    mockDaysLesson1.find((d) => d._id.toString() === id.toString()),
                ),
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn().mockResolvedValue(
                        mockDaysLesson1.find((d) => d._id.toString() === id.toString()),
                    ),
                }),
            })),
        };

        mockPhaseModel = {
            find: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(mockPhases),
                    }),
                }),
            }),
        };

        mockStepModel = {
            find: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockReturnValue({
                        exec: vi.fn().mockResolvedValue(mockSteps),
                    }),
                }),
            }),
        };

        mockUserProgressModel = {
            findOne: vi.fn(),
            create: vi.fn(),
            deleteOne: vi.fn().mockReturnValue({
                exec: vi.fn().mockResolvedValue({ deletedCount: 1 }),
            }),
        };

        service = new JourneyService(
            mockUserProgressModel,
            mockPartModel,
            mockUnitModel,
            mockLessonModel,
            mockDayModel,
            mockPhaseModel,
            mockStepModel,
        );
    });

    it('should initialize progress for a new user with Part 1 available and Lesson 1 CURRENT', async () => {
        mockUserProgressModel.findOne.mockReturnValue({
            exec: vi.fn().mockResolvedValue(null),
        });

        const createdProgress = {
            userId: new Types.ObjectId(mockUserId),
            currentPartId: mockPart1Id,
            currentUnitId: mockUnit1Id,
            currentLessonId: mockLesson1Id,
            completedPartIds: [],
            completedUnitIds: [],
            completedLessonIds: [],
            completedDayIds: [],
            completedPhaseIds: [],
            completedStepIds: [],
        };
        mockUserProgressModel.create.mockResolvedValue(createdProgress);

        const result = await service.getLearningJourney(mockUserId, {}, AppLanguage.AR);

        expect(result.parts).toHaveLength(2);
        const part1 = result.parts[0];
        expect(part1.id).toBe(mockPart1Id.toString());
        expect(part1.isAvailable).toBe(true);
        expect(part1.isCompleted).toBe(false);
        expect(part1.units).toHaveLength(1);

        const unit1 = part1.units[0];
        expect(unit1.id).toBe(mockUnit1Id.toString());
        expect(unit1.isCompleted).toBe(false);
        expect(unit1.lessons).toHaveLength(2);

        expect(unit1.lessons[0].id).toBe(mockLesson1Id.toString());
        expect(unit1.lessons[0].status).toBe(LessonProgressStatus.CURRENT);

        expect(unit1.lessons[1].id).toBe(mockLesson2Id.toString());
        expect(unit1.lessons[1].status).toBe(LessonProgressStatus.LOCKED);
    });

    it('should return days of a CURRENT lesson with Day 1 CURRENT and Day 2 LOCKED', async () => {
        const progressDoc = {
            userId: new Types.ObjectId(mockUserId),
            currentPartId: mockPart1Id,
            currentUnitId: mockUnit1Id,
            currentLessonId: mockLesson1Id,
            currentDayId: mockDay1Id,
            completedPartIds: [] as Types.ObjectId[],
            completedUnitIds: [] as Types.ObjectId[],
            completedLessonIds: [] as Types.ObjectId[],
            completedDayIds: [] as Types.ObjectId[],
            completedPhaseIds: [] as Types.ObjectId[],
            completedStepIds: [] as Types.ObjectId[],
        };

        mockUserProgressModel.findOne.mockReturnValue({
            exec: vi.fn().mockResolvedValue(progressDoc),
        });

        const res = await service.getLessonDays(mockUserId, mockLesson1Id.toString(), AppLanguage.EN);

        expect(res.lesson.id).toBe(mockLesson1Id.toString());
        expect(res.lesson.status).toBe(LessonProgressStatus.CURRENT);
        expect(res.days).toHaveLength(2);

        expect(res.days[0].id).toBe(mockDay1Id.toString());
        expect(res.days[0].status).toBe(DayProgressStatus.CURRENT);

        expect(res.days[1].id).toBe(mockDay2Id.toString());
        expect(res.days[1].status).toBe(DayProgressStatus.LOCKED);
    });

    it('should return days as ALL COMPLETED if the lesson is completed', async () => {
        const progressDoc = {
            userId: new Types.ObjectId(mockUserId),
            currentPartId: mockPart1Id,
            currentUnitId: mockUnit1Id,
            currentLessonId: mockLesson2Id,
            completedPartIds: [] as Types.ObjectId[],
            completedUnitIds: [] as Types.ObjectId[],
            completedLessonIds: [mockLesson1Id],
            completedDayIds: [mockDay1Id, mockDay2Id],
            completedPhaseIds: [] as Types.ObjectId[],
            completedStepIds: [] as Types.ObjectId[],
        };

        mockUserProgressModel.findOne.mockReturnValue({
            exec: vi.fn().mockResolvedValue(progressDoc),
        });

        const res = await service.getLessonDays(mockUserId, mockLesson1Id.toString(), AppLanguage.EN);

        expect(res.lesson.status).toBe(LessonProgressStatus.COMPLETED);
        expect(res.days[0].status).toBe(DayProgressStatus.COMPLETED);
        expect(res.days[1].status).toBe(DayProgressStatus.COMPLETED);
    });

    it('should return days as ALL LOCKED if the lesson is locked', async () => {
        const progressDoc = {
            userId: new Types.ObjectId(mockUserId),
            currentPartId: mockPart1Id,
            currentUnitId: mockUnit1Id,
            currentLessonId: mockLesson1Id,
            completedPartIds: [] as Types.ObjectId[],
            completedUnitIds: [] as Types.ObjectId[],
            completedLessonIds: [] as Types.ObjectId[],
            completedDayIds: [] as Types.ObjectId[],
            completedPhaseIds: [] as Types.ObjectId[],
            completedStepIds: [] as Types.ObjectId[],
        };

        mockUserProgressModel.findOne.mockReturnValue({
            exec: vi.fn().mockResolvedValue(progressDoc),
        });

        const res = await service.getLessonDays(mockUserId, mockLesson2Id.toString(), AppLanguage.EN);

        expect(res.lesson.status).toBe(LessonProgressStatus.LOCKED);
        expect(res.days).toBeDefined();
    });

    it('should return day details with unitHintAr, unitHintEn, status, and phases', async () => {
        const progressDoc = {
            userId: new Types.ObjectId(mockUserId),
            currentPartId: mockPart1Id,
            currentUnitId: mockUnit1Id,
            currentLessonId: mockLesson1Id,
            currentDayId: mockDay1Id,
            completedPartIds: [] as Types.ObjectId[],
            completedUnitIds: [] as Types.ObjectId[],
            completedLessonIds: [] as Types.ObjectId[],
            completedDayIds: [] as Types.ObjectId[],
            completedPhaseIds: [] as Types.ObjectId[],
            completedStepIds: [] as Types.ObjectId[],
        };

        mockUserProgressModel.findOne.mockReturnValue({
            exec: vi.fn().mockResolvedValue(progressDoc),
        });

        const res = await service.getDayDetails(mockUserId, mockDay1Id.toString(), AppLanguage.AR);

        expect(res.day.id).toBe(mockDay1Id.toString());
        expect(res.day.nameAr).toBe('اليوم الأول');
        expect(res.day.unitHintAr).toBe('تلميح الوحدة الأولى');
        expect(res.day.unitHintEn).toBe('Unit 1 Hint');
        expect(res.day.status).toBe(DayProgressStatus.CURRENT);
        expect(res.day.phases).toHaveLength(1);
        expect(res.day.phases[0].phaseId).toBe(mockPhase1Id.toString());
        expect(res.day.phases[0].type).toBe('learning');
        expect(res.day.phases[0].descriptionAr).toBe('شرح نظري');
    });

    it('should return day steps with phases and steps when day is CURRENT', async () => {
        const progressDoc = {
            userId: new Types.ObjectId(mockUserId),
            currentPartId: mockPart1Id,
            currentUnitId: mockUnit1Id,
            currentLessonId: mockLesson1Id,
            currentDayId: mockDay1Id,
            completedPartIds: [] as Types.ObjectId[],
            completedUnitIds: [] as Types.ObjectId[],
            completedLessonIds: [] as Types.ObjectId[],
            completedDayIds: [] as Types.ObjectId[],
            completedPhaseIds: [] as Types.ObjectId[],
            completedStepIds: [] as Types.ObjectId[],
        };

        mockUserProgressModel.findOne.mockReturnValue({
            exec: vi.fn().mockResolvedValue(progressDoc),
        });

        const res = await service.getDaySteps(mockUserId, mockDay1Id.toString(), AppLanguage.AR);

        expect(res.day.id).toBe(mockDay1Id.toString());
        expect(res.day.status).toBe(DayProgressStatus.CURRENT);
        expect(res.phases).toHaveLength(1);
        expect(res.phases[0].steps).toHaveLength(1);
        expect(res.phases[0].steps[0].id).toBe(mockStep1Id.toString());
        expect(res.phases[0].steps[0].layoutType).toBe('GRID-4');
        expect(res.steps).toHaveLength(1);
        expect(res.steps[0].id).toBe(mockStep1Id.toString());
    });

    it('should throw ForbiddenException if day is LOCKED when requesting steps', async () => {
        const progressDoc = {
            userId: new Types.ObjectId(mockUserId),
            currentPartId: mockPart1Id,
            currentUnitId: mockUnit1Id,
            currentLessonId: mockLesson1Id,
            currentDayId: mockDay1Id,
            completedPartIds: [] as Types.ObjectId[],
            completedUnitIds: [] as Types.ObjectId[],
            completedLessonIds: [] as Types.ObjectId[],
            completedDayIds: [] as Types.ObjectId[],
            completedPhaseIds: [] as Types.ObjectId[],
            completedStepIds: [] as Types.ObjectId[],
        };

        mockUserProgressModel.findOne.mockReturnValue({
            exec: vi.fn().mockResolvedValue(progressDoc),
        });

        // mockDay2Id is LOCKED because current is Day 1 and Day 1 not completed
        await expect(
            service.getDaySteps(mockUserId, mockDay2Id.toString(), AppLanguage.AR),
        ).rejects.toThrow();
    });
});
