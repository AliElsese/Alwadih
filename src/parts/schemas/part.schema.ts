import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Part extends Document {
    @Prop({ required: true })
    partNameAr: string;

    @Prop({ required: true })
    partNameEn: string;
}

export const PartSchema = SchemaFactory.createForClass(Part);