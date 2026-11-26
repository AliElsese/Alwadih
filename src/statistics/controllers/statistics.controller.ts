import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../auth/enums/auth.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    /**
     * GET /statistics/parts
     * Admin-only endpoint returning curriculum breakdown by parts with unitsCount, lessonsCount, stepsCount, and layoutTypesCount.
     */
    @Get('parts')
    async getPartsStatistics(@Language() lang: AppLanguage) {
        return this.statisticsService.getPartsStatistics(lang);
    }
}
