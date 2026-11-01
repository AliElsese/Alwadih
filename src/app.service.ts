import { Injectable } from '@nestjs/common';
import type { AppLanguage } from './common/i18n/language.decorator.js';
import { getMessages } from './common/i18n/messages.js';

@Injectable()
export class AppService {
  getHello(lang: AppLanguage = 'en'): string {
    return getMessages(lang).helloWorld;
  }
}
