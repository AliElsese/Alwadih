import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateLetterAudioDto {
    @IsString({ message: 'Audio URL must be a valid string.' })
    @IsNotEmpty({ message: 'Audio URL is required.' })
    @IsUrl({}, { message: 'Audio URL must be a valid URL format.' })
    audioUrl: string;
}
