import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/user.schema.js";
import { UserRole } from "../enums/auth.enum.js";
import { parseLanguage } from "../../common/i18n/language.decorator.js";
import { getMessages } from "../../common/i18n/messages.js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Check if the route is public, and if so, allow access
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const lang = parseLanguage(request.headers?.['accept-language']);
        const msg = getMessages(lang);

        // Extract access token from Authorization header
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException("No access token provided in headers");
        }

        // Verify the token
        const tokenPayload = await this.verifyToken(token, msg);
        request.user = tokenPayload;

        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const authHeader = request.headers?.authorization;
        if (!authHeader) {
            return undefined;
        }

        const [type, token] = authHeader.split(' ');
        if (type === 'Bearer' && token) {
            return token;
        }

        return token || authHeader;
    }

    private async verifyToken(token: string, msg: ReturnType<typeof getMessages>): Promise<any> {
        let payload: any;
        try {
            payload = this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException("Invalid or expired token");
        }

        // Validate tokenVersion for regular users to enforce logout and token invalidation
        if (payload.role === UserRole.USER && payload.userId) {
            const user = await this.userModel.findById(payload.userId).select('tokenVersion').lean().exec();
            if (!user) {
                throw new UnauthorizedException(msg.accountNotFound);
            }
            const currentVersion = user.tokenVersion ?? 0;
            const tokenVersion = payload.tokenVersion ?? 0;
            if (currentVersion !== tokenVersion) {
                throw new UnauthorizedException(msg.tokenInvalidated);
            }
        }

        return payload;
    }
}