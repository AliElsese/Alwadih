import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PartService } from '../services/part.service.js';
import { AddPartDto } from '../dtos/add-part.dto.js';
import { UpdatePartDto } from '../dtos/update-part.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../auth/enums/auth.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('parts')
export class PartController {
    constructor(private readonly partService: PartService) { }

    // POST /parts
    @Post()
    async addPart(
        @Body() addPartDto: AddPartDto,
        @Language() lang: AppLanguage,
    ) {
        return this.partService.addPart(addPartDto, lang);
    }

    // GET /parts
    @Get()
    async getAllParts(@Language() lang: AppLanguage) {
        return this.partService.getAllParts(lang);
    }

    // GET /parts/:id
    @Get(':id')
    async getPartById(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.partService.getPartById(id, lang);
    }

    // PATCH /parts/:id
    @Patch(':id')
    async updatePart(
        @Param('id') id: string,
        @Body() updatePartDto: UpdatePartDto,
        @Language() lang: AppLanguage,
    ) {
        return this.partService.updatePart(id, updatePartDto, lang);
    }

    // DELETE /parts/:id
    @Delete(':id')
    async deletePart(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.partService.deletePart(id, lang);
    }
}

