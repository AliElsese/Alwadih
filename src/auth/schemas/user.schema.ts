import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: false })
    password?: string;

    @Prop({ required: false })
    googleId?: string;

    @Prop({ required: false })
    avatar?: string;

    // Account verification OTP
    @Prop()
    otp?: string;

    @Prop()
    otpExpiresAt?: Date;

    @Prop({ default: false })
    isVerified: boolean;

    // Forgot password OTP & Reset session
    @Prop()
    resetOtp?: string;

    @Prop()
    resetOtpExpiresAt?: Date;

    @Prop()
    resetToken?: string;

    @Prop()
    resetTokenExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
