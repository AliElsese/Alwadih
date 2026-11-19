import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Day } from '../../days/schemas/day.schema.js';
import { PhaseType } from '../enums/phase.enum.js';

@Schema({ timestamps: true })
export class Phase extends Document {
    @Prop({
        type: String,
        enum: Object.values(PhaseType),
        required: true,
    })
    type: PhaseType;

    @Prop({ required: true, trim: true })
    descriptionAr: string;

    @Prop({ required: true, trim: true })
    descriptionEn: string;

    // Many-to-One reference to Day (a single Day can have many Phases)
    @Prop({
        type: Types.ObjectId,
        ref: Day.name,
        required: true,
        index: true,
    })
    dayId: Types.ObjectId;
}

export const PhaseSchema = SchemaFactory.createForClass(Phase);

// Optimize querying phases belonging to a specific day in chronological order
PhaseSchema.index({ dayId: 1, createdAt: 1 });
