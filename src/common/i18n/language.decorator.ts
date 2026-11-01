import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AppLanguage = 'ar' | 'en';

export function parseLanguage(acceptLanguageHeader?: string): AppLanguage {
  if (!acceptLanguageHeader || typeof acceptLanguageHeader !== 'string') {
    return 'en';
  }

  // Accepts standard Accept-Language formats e.g. "ar", "ar-EG", "ar,en;q=0.9", "en-US"
  const primary = acceptLanguageHeader.split(',')[0].trim().toLowerCase();
  return primary.startsWith('ar') ? 'ar' : 'en';
}

export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AppLanguage => {
    const request = ctx.switchToHttp().getRequest();
    const rawHeader = request.headers['accept-language'];
    return parseLanguage(rawHeader);
  },
);

