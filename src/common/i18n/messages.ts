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
    adminLoginOtpSent: 'A verification code has been sent to your email to complete login.',
    adminAccessDenied: 'Access denied. Administrator privileges required.',

    // Support Requests
    supportAuthRequired: 'Authentication is required to submit a support request.',
    supportInvalidUserId: 'Invalid user identifier.',
    supportSubmittedSuccess: 'Support request submitted successfully.',
    supportDuplicateRetrieved: 'Previous support request retrieved successfully.',
    supportDuplicateDetected: 'Duplicate support request detected.',
    supportInvalidPayload: 'Invalid support request payload.',
    supportSaveFailed: 'An error occurred while saving your support request. Please try again later.',

    // User Preferences
    preferencesRetrievedSuccess: 'User preferences retrieved successfully.',
    preferencesUpdatedSuccess: 'User preferences updated successfully.',
    preferencesUserRequired: 'Authentication is required to access user preferences.',
    preferencesInvalidUserId: 'Invalid user identifier.',

    // User Profile
    profileRetrievedSuccess: 'User profile retrieved successfully.',
    profileUpdatedSuccess: 'User profile updated successfully.',

    // Content APIs (FAQ & Privacy Policy)
    faqRetrievedSuccess: 'FAQs retrieved successfully.',
    faqEmpty: 'No published FAQs found for the requested locale.',
    privacyPolicyRetrievedSuccess: 'Privacy policy retrieved successfully.',
    privacyPolicyNotFound: 'No published privacy policy found for the requested locale.',
    unsupportedLocale: 'Unsupported locale. Supported locales are "ar" and "en".',

    // Parts
    partCreatedSuccess: 'Part created successfully.',
    partsRetrievedSuccess: 'Parts retrieved successfully.',
    partRetrievedSuccess: 'Part retrieved successfully.',
    partUpdatedSuccess: 'Part updated successfully.',
    partDeletedSuccess: 'Part deleted successfully.',
    partNotFound: 'Part not found.',
    partAlreadyExists: 'A part with this Arabic or English name already exists.',
    invalidPartId: 'Invalid part identifier.',

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
    adminLoginOtpSent: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني لإتمام تسجيل الدخول.',
    adminAccessDenied: 'تم رفض الوصول. يتطلب صلاحيات المشرف.',

    // Support Requests
    supportAuthRequired: 'يجب تسجيل الدخول لإرسال طلب الدعم.',
    supportInvalidUserId: 'معرف المستخدم غير صالح.',
    supportSubmittedSuccess: 'تم إرسال طلب الدعم بنجاح.',
    supportDuplicateRetrieved: 'تم استرجاع طلب الدعم السابق بنجاح.',
    supportDuplicateDetected: 'طلب دعم مكرر تم إرساله بالفعل.',
    supportInvalidPayload: 'بيانات طلب الدعم غير صالحة.',
    supportSaveFailed: 'حدث خطأ أثناء حفظ طلب الدعم. يرجى المحاولة لاحقاً.',

    // User Preferences
    preferencesRetrievedSuccess: 'تم استرجاع إعدادات المستخدم بنجاح.',
    preferencesUpdatedSuccess: 'تم تحديث إعدادات المستخدم بنجاح.',
    preferencesUserRequired: 'يجب تسجيل الدخول للوصول إلى إعدادات المستخدم.',
    preferencesInvalidUserId: 'معرف المستخدم غير صالح.',

    // User Profile
    profileRetrievedSuccess: 'تم استرجاع الملف الشخصي بنجاح.',
    profileUpdatedSuccess: 'تم تحديث الملف الشخصي بنجاح.',

    // Content APIs (FAQ & Privacy Policy)
    faqRetrievedSuccess: 'تم استرجاع الأسئلة الشائعة بنجاح.',
    faqEmpty: 'لم يتم العثور على أي أسئلة شائعة منشورة لهذه اللغة.',
    privacyPolicyRetrievedSuccess: 'تم استرجاع سياسة الخصوصية بنجاح.',
    privacyPolicyNotFound: 'لم يتم العثور على سياسة خصوصية منشورة لهذه اللغة.',
    unsupportedLocale: 'اللغة المطلوبة غير مدعومة. اللغات المدعومة هي "ar" و "en".',

    // Parts
    partCreatedSuccess: 'تم إضافة الجزء بنجاح.',
    partsRetrievedSuccess: 'تم استرجاع الأجزاء بنجاح.',
    partRetrievedSuccess: 'تم استرجاع الجزء بنجاح.',
    partUpdatedSuccess: 'تم تحديث الجزء بنجاح.',
    partDeletedSuccess: 'تم حذف الجزء بنجاح.',
    partNotFound: 'لم يتم العثور على الجزء المطلوب.',
    partAlreadyExists: 'يوجد جزء مسجل بالفعل بهذا الاسم العربي أو الإنجليزي.',
    invalidPartId: 'معرف الجزء غير صالح.',

    // General
    helloWorld: 'مرحباً بكم في منصة الواضح!',
  },
} as const;

export type MessageKey = keyof typeof messages.en;

export function getMessages(lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
  return messages[lang as 'ar' | 'en'] ?? messages.en;
}