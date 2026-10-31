import { IsOptional, IsString } from "class-validator";

export class GoogleAuthDto {
    @IsString({ message: 'Token must be a string.' })
    @IsOptional()
    token?: string;

    @IsString({ message: 'idToken must be a string.' })
    @IsOptional()
    idToken?: string;

    @IsString({ message: 'Credential must be a string.' })
    @IsOptional()
    credential?: string;
}
