import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AppLanguage, Language } from './common/i18n/language.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Language() lang: AppLanguage): string {
    return this.appService.getHello(lang);
  }
}
