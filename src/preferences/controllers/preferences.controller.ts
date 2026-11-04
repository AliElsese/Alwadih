import { Body, Controller, Get, Patch, Req } from "@nestjs/common";
import { PreferencesService } from "../services/preferences.service.js";
import { UpdatePreferencesDto } from "../dtos/update-preferences.dto.js";
import { AppLanguage, Language } from "../../common/i18n/language.decorator.js";

@Controller('preferences')
export class PreferencesController {
    constructor(private readonly preferenceService: PreferencesService) { }

    // GET /preferences
    @Get()
    async getPreferences(
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.preferenceService.getPreferences(req.user.userId, lang);
    }

    // PATCH /preferences
    @Patch()
    async updatePreferences(
        @Body() updatePreferencesDto: UpdatePreferencesDto,
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.preferenceService.updatePreferences(
            req.user.userId,
            updatePreferencesDto,
            lang,
        );
    }
}
