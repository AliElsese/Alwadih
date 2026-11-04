import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Appearance, AppPreferenceLanguage, FontSize } from '../enums/preferences.enum.js';

export class UpdatePreferencesDto {
    @IsOptional()
    @IsEnum(FontSize, {
        message: 'fontSize must be one of: small, medium, large, extra large',
    })
    fontSize?: FontSize;

    @IsOptional()
    @IsEnum(Appearance, {
        message: 'appearance must be one of: system, dark, light',
    })
    appearance?: Appearance;

    @IsOptional()
    @IsEnum(AppPreferenceLanguage, {
        message: 'language must be one of: ar, en',
    })
    language?: AppPreferenceLanguage;

    @IsOptional()
    @IsBoolean({
        message: 'sound must be a boolean value',
    })
    sound?: boolean;

    @IsOptional()
    @IsBoolean({
        message: 'haptics must be a boolean value',
    })
    haptics?: boolean;
}
