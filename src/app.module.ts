import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config.js';
import { SupportModule } from './support/support.module.js';
import { PreferencesModule } from './preferences/preferences.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { ContentModule } from './content/content.module.js';
import { PartModule } from './parts/part.module.js';
import { UnitModule } from './units/unit.module.js';
import { LessonModule } from './lessons/lesson.module.js';
import { DayModule } from './days/day.module.js';
import { PhaseModule } from './phases/phase.module.js';
import { StepModule } from './steps/step.module.js';
import { JourneyModule } from './journey/journey.module.js';
import { LetterModule } from './letters/letter.module.js';
import { StatisticsModule } from './statistics/statistics.module.js';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwtAuth.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config]
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret')
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('database.connectionString')
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    SupportModule,
    PreferencesModule,
    ProfileModule,
    ContentModule,
    PartModule,
    UnitModule,
    LessonModule,
    DayModule,
    PhaseModule,
    StepModule,
    JourneyModule,
    LetterModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule { }
