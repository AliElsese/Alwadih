import { Injectable } from '@nestjs/common';
import { AppLanguage } from './common/i18n/language.decorator.js';
import { getMessages } from './common/i18n/messages.js';

@Injectable()
export class AppService {
  getHello(lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN): string {
    return getMessages(lang).helloWorld;
  }
}
