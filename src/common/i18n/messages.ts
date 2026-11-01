import { AppLanguage } from './language.decorator.js';

export const messages = {
  en: {
    // Signup & Verification
    accountAlreadyExists: 'An account with this email address already exists.',
    accountRegisteredSuccess: 'Account registered successfully. A verification code has been sent to your email.',
    accountNotFound: 'Account not found with the provided email.',
    accountAlreadyVerified: 'Account is already verified.',
    invalidOtp: 'Invalid verification code.',
    otpExpired: 'Verification code has expired. Please request a new one.',
    accountVerifiedSuccess: 'Account verified successfully.',
    otpResentSuccess: 'A new verification code has been sent to your email.',

    // Google Authentication
    googleTokenRequired: 'Google authentication token is required.',
    googleAuthFailed: 'Google authentication failed: token is invalid or expired.',
    googleAuthSuccess: 'Google authentication successful.',

    // Password Reset
    emailNotFound: 'No account found with this email address.',
    forgotPasswordOtpSent: 'Password reset code has been sent to your email.',
    resetOtpResent: 'A new password reset code has been sent to your email.',
    resetOtpVerified: 'Verification code verified successfully. You may now reset your password.',
    resetSessionExpired: 'Password reset session has expired or is invalid. Please request a new verification code.',
    invalidResetToken: 'Invalid or expired reset token.',
    passwordResetSuccess: 'Password has been reset successfully. You can now log in with your new password.',

    // Login
    invalidCredentials: 'Invalid email or password.',
    googleAccountNotice: 'This account was registered using Google. Please sign in with Google or reset your password.',
    accountNotVerified: 'Account is not verified. Please verify your email before logging in.',
    loginSuccess: 'Login successful.',

    // General
    helloWorld: 'Hello World!',
  },
  ar: {
    // Signup & Verification
    accountAlreadyExists: 'يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني.',
    accountRegisteredSuccess: 'تم تسجيل الحساب بنجاح. تم إرسال رمز التحقق إلى بريدك الإلكتروني.',
    accountNotFound: 'لم يتم العثور على حساب مسجل بهذا البريد الإلكتروني.',
    accountAlreadyVerified: 'هذا الحساب مفعل بالفعل.',
    invalidOtp: 'رمز التحقق غير صحيح.',
    otpExpired: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.',
    accountVerifiedSuccess: 'تم تفعيل الحساب بنجاح.',
    otpResentSuccess: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.',

    // Google Authentication
    googleTokenRequired: 'رمز مصادقة جوجل مطلوب.',
    googleAuthFailed: 'فشلت مصادقة جوجل: الرمز غير صالح أو منتهي الصلاحية.',
    googleAuthSuccess: 'تمت المصادقة عبر جوجل بنجاح.',

    // Password Reset
    emailNotFound: 'لم يتم العثور على أي حساب مسجل بهذا البريد الإلكتروني.',
    forgotPasswordOtpSent: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
    resetOtpResent: 'تم إرسال رمز جديد لإعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
    resetOtpVerified: 'تم التحقق من الرمز بنجاح. يمكنك الآن إعادة تعيين كلمة المرور.',
    resetSessionExpired: 'انتهت صلاحية جلسة إعادة تعيين كلمة المرور. يرجى طلب رمز تحقق جديد.',
    invalidResetToken: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية.',
    passwordResetSuccess: 'تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',

    // Login
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    googleAccountNotice: 'تم تسجيل هذا الحساب عبر جوجل. يرجى تسجيل الدخول عبر جوجل أو طلب إعادة تعيين كلمة المرور.',
    accountNotVerified: 'الحساب غير مفعل. يرجى تأكيد بريدك الإلكتروني أولاً لتسجيل الدخول.',
    loginSuccess: 'تم تسجيل الدخول بنجاح.',

    // General
    helloWorld: 'مرحباً بكم في منصة الواضح!',
  },
} as const;

export type MessageKey = keyof typeof messages.en;

export function getMessages(lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
  return messages[lang as 'ar' | 'en'] ?? messages.en;
}

