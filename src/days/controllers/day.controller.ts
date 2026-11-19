import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DayService } from '../services/day.service.js';
import { CreateDayDto } from '../dtos/create-day.dto.js';
import { UpdateDayDto } from '../dtos/update-day.dto.js';
import { GetDaysQueryDto } from '../dtos/get-days-query.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../auth/enums/auth.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('days')
export class DayController {
    constructor(private readonly dayService: DayService) { }

    // POST /days
    @Post()
    async createDay(
        @Body() createDayDto: CreateDayDto,
        @Language() lang: AppLanguage,
    ) {
        return this.dayService.createDay(createDayDto, lang);
    }

    // GET /days (optional ?lessonId=...)
    @Get()
    async getAllDays(
        @Query() query: GetDaysQueryDto,
        @Language() lang: AppLanguage,
    ) {
        return this.dayService.getAllDays(query, lang);
    }

    // GET /days/:id
    @Get(':id')
    async getDayById(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.dayService.getDayById(id, lang);
    }

    // PATCH /days/:id
    @Patch(':id')
    async updateDay(
        @Param('id') id: string,
        @Body() updateDayDto: UpdateDayDto,
        @Language() lang: AppLanguage,
    ) {
        return this.dayService.updateDay(id, updateDayDto, lang);
    }

    // DELETE /days/:id
    @Delete(':id')
    async deleteDay(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.dayService.deleteDay(id, lang);
    }
}
