import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema.js';
import { Part } from '../../parts/schemas/part.schema.js';
import { Unit } from '../../units/schemas/unit.schema.js';
import { Lesson } from '../../lessons/schemas/lesson.schema.js';
import { Day } from '../../days/schemas/day.schema.js';
import { Phase } from '../../phases/schemas/phase.schema.js';
import { Step } from '../../steps/schemas/step.schema.js';

@Schema({ timestamps: true })
export class UserProgress extends Document {
    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
        unique: true,
        index: true,
    })
    userId: Types.ObjectId;

    // Current pointer in the educational journey
    @Prop({ type: Types.ObjectId, ref: Part.name, default: null })
    currentPartId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Unit.name, default: null })
    currentUnitId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Lesson.name, default: null })
    currentLessonId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Day.name, default: null })
    currentDayId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Phase.name, default: null })
    currentPhaseId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Step.name, default: null })
    currentStepId?: Types.ObjectId;

    // Sets of completed IDs
    @Prop({ type: [{ type: Types.ObjectId, ref: Part.name }], default: [] })
    completedPartIds: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: Unit.name }], default: [] })
    completedUnitIds: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: Lesson.name }], default: [] })
    completedLessonIds: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: Day.name }], default: [] })
    completedDayIds: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: Phase.name }], default: [] })
    completedPhaseIds: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: Step.name }], default: [] })
    completedStepIds: Types.ObjectId[];
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
