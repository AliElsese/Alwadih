import { IsEnum, IsOptional } from 'class-validator';
import { AppLanguage } from '../../common/i18n/language.decorator.js';

export class ContentQueryDto {
    @IsOptional()
    @IsEnum(AppLanguage, {
        message: 'Unsupported locale. Supported locales are "ar" and "en".',
    })
    locale?: AppLanguage;
}
