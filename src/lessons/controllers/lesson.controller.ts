import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LessonService } from '../services/lesson.service.js';
import { CreateLessonDto } from '../dtos/create-lesson.dto.js';
import { UpdateLessonDto } from '../dtos/update-lesson.dto.js';
import { GetLessonsQueryDto } from '../dtos/get-lessons-query.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../auth/enums/auth.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('lessons')
export class LessonController {
    constructor(private readonly lessonService: LessonService) { }

    // POST /lessons
    @Post()
    async createLesson(
        @Body() createLessonDto: CreateLessonDto,
        @Language() lang: AppLanguage,
    ) {
        return this.lessonService.createLesson(createLessonDto, lang);
    }

    // GET /lessons (optional ?unitId=...)
    @Get()
    async getAllLessons(
        @Query() query: GetLessonsQueryDto,
        @Language() lang: AppLanguage,
    ) {
        return this.lessonService.getAllLessons(query, lang);
    }

    // GET /lessons/:id
    @Get(':id')
    async getLessonById(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.lessonService.getLessonById(id, lang);
    }

    // PATCH /lessons/:id
    @Patch(':id')
    async updateLesson(
        @Param('id') id: string,
        @Body() updateLessonDto: UpdateLessonDto,
        @Language() lang: AppLanguage,
    ) {
        return this.lessonService.updateLesson(id, updateLessonDto, lang);
    }

    // DELETE /lessons/:id
    @Delete(':id')
    async deleteLesson(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.lessonService.deleteLesson(id, lang);
    }
}

