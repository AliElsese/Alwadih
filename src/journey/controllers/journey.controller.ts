import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { JourneyService } from '../services/journey.service.js';
import { GetJourneyQueryDto } from '../dtos/get-journey-query.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';

@Controller('journey')
export class JourneyController {
    constructor(private readonly journeyService: JourneyService) { }

    /**
     * GET /journey
     * Retrieves the current user's educational journey (parts, availability, visited units, lessons).
     */
    @Get()
    async getLearningJourney(
        @Req() req: any,
        @Query() query: GetJourneyQueryDto,
        @Language() lang: AppLanguage,
    ) {
        return this.journeyService.getLearningJourney(req.user.userId, query, lang);
    }

    /**
     * GET /journey/lessons/:lessonId/days
     * Retrieves the days of a specific lesson along with their progress status (CURRENT, COMPLETED, LOCKED).
     */
    @Get('lessons/:lessonId/days')
    async getLessonDays(
        @Param('lessonId') lessonId: string,
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.journeyService.getLessonDays(req.user.userId, lessonId, lang);
    }

    /**
     * GET /journey/lessons/:lessonId
     * Alias for getting days of a specific lesson.
     */
    @Get('lessons/:lessonId')
    async getLessonDaysAlias(
        @Param('lessonId') lessonId: string,
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.journeyService.getLessonDays(req.user.userId, lessonId, lang);
    }

    /**
     * GET /journey/days/:dayId
     * Retrieves the details of a specific day, including its unit hints (unitHintAr, unitHintEn),
     * user progress status (CURRENT, COMPLETED, LOCKED), and its phases.
     */
    @Get('days/:dayId')
    async getDayDetails(
        @Param('dayId') dayId: string,
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.journeyService.getDayDetails(req.user.userId, dayId, lang);
    }

    /**
     * POST /journey/complete-day/:dayId
     * Marks a day as completed for the current user and advances to the next day or lesson.
     */
    @Post('complete-day/:dayId')
    async completeDay(
        @Param('dayId') dayId: string,
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.journeyService.completeDay(req.user.userId, dayId, lang);
    }

    /**
     * POST /journey/complete-lesson/:lessonId
     * Marks a lesson as completed for the current user and advances the journey pointer.
     */
    @Post('complete-lesson/:lessonId')
    async completeLesson(
        @Param('lessonId') lessonId: string,
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.journeyService.completeLesson(req.user.userId, lessonId, lang);
    }

    /**
     * POST /journey/reset
     * Resets the current user's journey progress back to the beginning.
     */
    @Post('reset')
    async resetProgress(@Req() req: any, @Language() lang: AppLanguage) {
        return this.journeyService.resetProgress(req.user.userId, lang);
    }
}
