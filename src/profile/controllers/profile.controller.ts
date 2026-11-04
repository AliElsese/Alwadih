import { Body, Controller, Get, Patch, Req } from "@nestjs/common";
import { ProfileService } from "../services/profile.service.js";
import { UpdateProfileDto } from "../dtos/update-profile.dto.js";
import { AppLanguage, Language } from "../../common/i18n/language.decorator.js";

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    // GET /profile
    @Get()
    async getProfile(@Req() req: any, @Language() lang: AppLanguage) {
        return this.profileService.getProfile(req.user.userId, lang);
    }

    // PATCH /profile
    @Patch()
    async updateProfile(
        @Body() updateProfileDto: UpdateProfileDto,
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.profileService.updateProfile(
            req.user.userId,
            updateProfileDto,
            lang,
        );
    }
}
