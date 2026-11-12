import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Part } from "../../parts/schemas/part.schema.js";

@Schema({ timestamps: true })
export class Unit extends Document {
    @Prop({ required: true, trim: true })
    hintAr: string;

    @Prop({ required: true, trim: true })
    hintEn: string;

    @Prop({ required: true, trim: true })
    labelAr: string;

    @Prop({ required: true, trim: true })
    labelEn: string;

    // Many-to-One reference to Part (a single Part can have many Units)
    @Prop({
        type: Types.ObjectId,
        ref: Part.name,
        required: true,
        index: true,
    })
    partId: Types.ObjectId;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

// Optimize querying units belonging to a specific part in chronological order
UnitSchema.index({ partId: 1, createdAt: 1 });