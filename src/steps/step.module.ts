import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Step, StepSchema } from './schemas/step.schema.js';
import { Phase, PhaseSchema } from '../phases/schemas/phase.schema.js';
import { StepService } from './services/step.service.js';
import { StepController } from './controllers/step.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Step.name, schema: StepSchema },
            { name: Phase.name, schema: PhaseSchema },
        ]),
    ],
    controllers: [StepController],
    providers: [StepService],
    exports: [StepService],
})
export class StepModule { }
