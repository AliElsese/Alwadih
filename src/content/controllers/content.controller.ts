import { Controller, Get, Query } from '@nestjs/common';
import { ContentService } from '../services/content.service.js';
import { ContentQueryDto } from '../dtos/content-query.dto.js';
import { AppLanguage, Language } from '../../common/i18n/language.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';

@Public()
@Controller('v1/content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    /**
     * GET /v1/content/faq?locale=ar
     * Public endpoint to fetch published FAQ entries for the specified locale.
     */
    @Get('faq')
    async getFaqs(
        @Query() query: ContentQueryDto,
        @Language() headerLang: AppLanguage,
    ) {
        const locale = query.locale ?? headerLang ?? AppLanguage.AR;
        return this.contentService.getFaqs(locale);
    }

    /**
     * GET /v1/content/privacy-policy?locale=ar
     * Public endpoint to fetch the latest published Privacy Policy for the specified locale.
     */
    @Get('privacy-policy')
    async getPrivacyPolicy(
        @Query() query: ContentQueryDto,
        @Language() headerLang: AppLanguage,
    ) {
        const locale = query.locale ?? headerLang ?? AppLanguage.AR;
        return this.contentService.getPrivacyPolicy(locale);
    }
}

