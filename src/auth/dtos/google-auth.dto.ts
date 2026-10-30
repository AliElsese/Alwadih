import { IsOptional, IsString } from "class-validator";

export class GoogleAuthDto {
    @IsString()
    @IsOptional()
    token?: string;

    @IsString()
    @IsOptional()
    idToken?: string;

    @IsString()
    @IsOptional()
    credential?: string;
}

