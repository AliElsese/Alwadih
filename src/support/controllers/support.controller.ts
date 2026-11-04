import { Body, Controller, Post, Req } from "@nestjs/common";
import { SupportService } from "../services/support.service.js";
import { CreateSupportRequestDto } from "../dtos/create-support-request.dto.js";
import { AppLanguage, Language } from "../../common/i18n/language.decorator.js";

@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    // POST /support/create
    @Post('create')
    async createSupportRequest(
        @Body() createSupportRequestDto: CreateSupportRequestDto,
        @Req() req: any,
        @Language() lang: AppLanguage,
    ) {
        return this.supportService.createSupportRequest(
            createSupportRequestDto,
            req.user.userId,
            lang,
        );
    }
}