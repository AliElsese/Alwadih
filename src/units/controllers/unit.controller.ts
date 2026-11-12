import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UnitService } from '../services/unit.service.js';
import { CreateUnitDto } from '../dtos/create-unit.dto.js';
import { UpdateUnitDto } from '../dtos/update-unit.dto.js';
import { GetUnitsQueryDto } from '../dtos/get-units-query.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../auth/enums/auth.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('units')
export class UnitController {
    constructor(private readonly unitService: UnitService) { }

    // POST /units
    @Post()
    async createUnit(
        @Body() createUnitDto: CreateUnitDto,
        @Language() lang: AppLanguage,
    ) {
        return this.unitService.createUnit(createUnitDto, lang);
    }

    // GET /units (optional ?partId=...)
    @Get()
    async getAllUnits(
        @Query() query: GetUnitsQueryDto,
        @Language() lang: AppLanguage,
    ) {
        return this.unitService.getAllUnits(query, lang);
    }

    // GET /units/:id
    @Get(':id')
    async getUnitById(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.unitService.getUnitById(id, lang);
    }

    // PATCH /units/:id
    @Patch(':id')
    async updateUnit(
        @Param('id') id: string,
        @Body() updateUnitDto: UpdateUnitDto,
        @Language() lang: AppLanguage,
    ) {
        return this.unitService.updateUnit(id, updateUnitDto, lang);
    }

    // DELETE /units/:id
    @Delete(':id')
    async deleteUnit(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.unitService.deleteUnit(id, lang);
    }
}