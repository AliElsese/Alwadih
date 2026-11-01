import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export enum AppLanguage {
  AR = 'ar',
  EN = 'en',
}

export function parseLanguage(acceptLanguageHeader?: string): AppLanguage {
  if (!acceptLanguageHeader || typeof acceptLanguageHeader !== 'string') {
    return AppLanguage.EN;
  }

  const primary = acceptLanguageHeader.split(',')[0].trim().toLowerCase();
  return primary.startsWith('ar') ? AppLanguage.AR : AppLanguage.EN;
}

export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AppLanguage => {
    const request = ctx.switchToHttp().getRequest();
    const rawHeader = request.headers['accept-language'];
    return parseLanguage(rawHeader);
  },
);
