import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { LetterService } from '../services/letter.service.js';
import { GetLettersQueryDto } from '../dtos/get-letters-query.dto.js';
import { UpdateLetterAudioDto } from '../dtos/update-letter-audio.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../auth/enums/auth.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

@Controller('letters')
export class LetterController {
    constructor(private readonly letterService: LetterService) { }

    /**
     * GET /letters
     * Public API: Returns all 28 Arabic letters with their tajweed types and audio URLs.
     */
    @Public()
    @Get()
    async getAllLetters(
        @Query() query: GetLettersQueryDto,
        @Language() lang: AppLanguage,
    ) {
        return this.letterService.getAllLetters(query, lang);
    }

    /**
     * GET /letters/:id
     * Public API: Returns a single Arabic letter by its ObjectId or character.
     */
    @Public()
    @Get(':id')
    async getLetterById(
        @Param('id') id: string,
        @Language() lang: AppLanguage,
    ) {
        return this.letterService.getLetterById(id, lang);
    }

    /**
     * PATCH /letters/:id/audio
     * Admin-only API: Updates or attaches an audio clip URL to an Arabic letter.
     */
    @Roles(UserRole.ADMIN)
    @UseGuards(RolesGuard)
    @Patch(':id/audio')
    async updateLetterAudio(
        @Param('id') id: string,
        @Body() dto: UpdateLetterAudioDto,
        @Language() lang: AppLanguage,
    ) {
        return this.letterService.updateLetterAudio(id, dto, lang);
    }
}
