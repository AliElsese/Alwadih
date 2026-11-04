import { Module } from '@nestjs/common';
import { PreferencesController } from './controllers/preferences.controller.js';
import { PreferencesService } from './services/preferences.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Preference, PreferenceSchema } from './schemas/preferences.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: Preference.name,
            schema: PreferenceSchema,
        }]),
    ],
    controllers: [PreferencesController],
    providers: [PreferencesService],
})
export class PreferencesModule { }