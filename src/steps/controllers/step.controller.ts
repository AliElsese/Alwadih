import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { StepService } from '../services/step.service.js';
import { stepLayoutSamples } from '../layouts/step-layout.samples.js';
import { CreateStepDto } from '../dtos/create-step.dto.js';
import { UpdateStepDto } from '../dtos/update-step.dto.js';
import { GetStepsQueryDto } from '../dtos/get-steps-query.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../auth/enums/auth.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('steps')
export class StepController {
    constructor(private readonly stepService: StepService) { }

    // POST /steps
    @Post()
    async createStep(
        @Body() createStepDto: CreateStepDto,
        @Language() lang: AppLanguage,
    ) {
        return this.stepService.createStep(createStepDto, lang);
    }

    // GET /steps (optional ?phaseId=...)
    @Get()
    async getAllSteps(
        @Query() query: GetStepsQueryDto,
        @Language() lang: AppLanguage,
    ) {
        return this.stepService.getAllSteps(query, lang);
    }

    // GET /steps/layout-samples
    @Get('layout-samples')
    getLayoutSamples() {
        return {
            message: 'Step layout samples retrieved successfully.',
            samples: stepLayoutSamples,
        };
    }

    // GET /steps/:id
    @Get(':id')
    async getStepById(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.stepService.getStepById(id, lang);
    }

    // PATCH /steps/:id
    @Patch(':id')
    async updateStep(
        @Param('id') id: string,
        @Body() updateStepDto: UpdateStepDto,
        @Language() lang: AppLanguage,
    ) {
        return this.stepService.updateStep(id, updateStepDto, lang);
    }

    // DELETE /steps/:id
    @Delete(':id')
    async deleteStep(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.stepService.deleteStep(id, lang);
    }
}
