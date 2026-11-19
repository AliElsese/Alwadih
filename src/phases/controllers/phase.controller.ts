import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PhaseService } from '../services/phase.service.js';
import { CreatePhaseDto } from '../dtos/create-phase.dto.js';
import { UpdatePhaseDto } from '../dtos/update-phase.dto.js';
import { GetPhasesQueryDto } from '../dtos/get-phases-query.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../auth/enums/auth.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('phases')
export class PhaseController {
    constructor(private readonly phaseService: PhaseService) { }

    // POST /phases
    @Post()
    async createPhase(
        @Body() createPhaseDto: CreatePhaseDto,
        @Language() lang: AppLanguage,
    ) {
        return this.phaseService.createPhase(createPhaseDto, lang);
    }

    // GET /phases (optional ?dayId=...)
    @Get()
    async getAllPhases(
        @Query() query: GetPhasesQueryDto,
        @Language() lang: AppLanguage,
    ) {
        return this.phaseService.getAllPhases(query, lang);
    }

    // GET /phases/:id
    @Get(':id')
    async getPhaseById(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.phaseService.getPhaseById(id, lang);
    }

    // PATCH /phases/:id
    @Patch(':id')
    async updatePhase(
        @Param('id') id: string,
        @Body() updatePhaseDto: UpdatePhaseDto,
        @Language() lang: AppLanguage,
    ) {
        return this.phaseService.updatePhase(id, updatePhaseDto, lang);
    }

    // DELETE /phases/:id
    @Delete(':id')
    async deletePhase(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.phaseService.deletePhase(id, lang);
    }
}
