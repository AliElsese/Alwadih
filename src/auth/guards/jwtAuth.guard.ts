import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector
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

        // Extract access token from Authorization header
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException("No access token provided in headers");
        }

        // Verify the token
        const tokenPayload = this.verifyToken(token);
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

    private verifyToken(token: string): any {
        try {
            return this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }
}