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
    logoutSuccess: 'Logged out successfully.',
    tokenInvalidated: 'Session expired or token invalidated. Please log in again.',
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

    // Units
    unitCreatedSuccess: 'Unit created successfully.',
    unitsRetrievedSuccess: 'Units retrieved successfully.',
    unitRetrievedSuccess: 'Unit retrieved successfully.',
    unitUpdatedSuccess: 'Unit updated successfully.',
    unitDeletedSuccess: 'Unit deleted successfully.',
    unitNotFound: 'Unit not found.',
    unitAlreadyExists: 'A unit with this Arabic or English label already exists in this part.',
    invalidUnitId: 'Invalid unit identifier.',

    // Lessons
    lessonCreatedSuccess: 'Lesson created successfully.',
    lessonsRetrievedSuccess: 'Lessons retrieved successfully.',
    lessonRetrievedSuccess: 'Lesson retrieved successfully.',
    lessonUpdatedSuccess: 'Lesson updated successfully.',
    lessonDeletedSuccess: 'Lesson deleted successfully.',
    lessonNotFound: 'Lesson not found.',
    lessonAlreadyExists: 'A lesson with this Arabic or English name already exists in this unit.',
    invalidLessonId: 'Invalid lesson identifier.',

    // Days
    dayCreatedSuccess: 'Day created successfully.',
    daysRetrievedSuccess: 'Days retrieved successfully.',
    dayRetrievedSuccess: 'Day retrieved successfully.',
    dayUpdatedSuccess: 'Day updated successfully.',
    dayDeletedSuccess: 'Day deleted successfully.',
    dayNotFound: 'Day not found.',
    dayAlreadyExists: 'A day with this Arabic or English name already exists in this lesson.',
    invalidDayId: 'Invalid day identifier.',

    // Phases
    phaseCreatedSuccess: 'Phase created successfully.',
    phasesRetrievedSuccess: 'Phases retrieved successfully.',
    phaseRetrievedSuccess: 'Phase retrieved successfully.',
    phaseUpdatedSuccess: 'Phase updated successfully.',
    phaseDeletedSuccess: 'Phase deleted successfully.',
    phaseNotFound: 'Phase not found.',
    phaseAlreadyExists: 'A phase with this type already exists in this day.',
    invalidPhaseId: 'Invalid phase identifier.',

    // Steps
    stepCreatedSuccess: 'Step created successfully.',
    stepsRetrievedSuccess: 'Steps retrieved successfully.',
    stepRetrievedSuccess: 'Step retrieved successfully.',
    stepUpdatedSuccess: 'Step updated successfully.',
    stepDeletedSuccess: 'Step deleted successfully.',
    stepNotFound: 'Step not found.',
    invalidStepId: 'Invalid step identifier.',
    invalidStepData: 'Invalid step data for the given layout type.',

    // Journey
    journeyRetrievedSuccess: 'Learning journey retrieved successfully.',
    journeyProgressUpdatedSuccess: 'Learning journey progress updated successfully.',
    journeyProgressResetSuccess: 'Learning journey progress reset successfully.',
    lessonDaysRetrievedSuccess: 'Lesson days retrieved successfully.',
    dayProgressUpdatedSuccess: 'Day progress updated successfully.',
    phaseStepsRetrievedSuccess: 'Phase steps retrieved successfully.',
    dayStepsRetrievedSuccess: 'Day steps retrieved successfully.',
    dayLocked: 'This day is locked and cannot be accessed yet.',

    // Arabic Letters
    lettersRetrievedSuccess: 'Arabic letters retrieved successfully.',
    letterRetrievedSuccess: 'Arabic letter retrieved successfully.',
    letterNotFound: 'Arabic letter not found.',
    invalidLetterId: 'Invalid letter identifier.',
    letterAudioUpdatedSuccess: 'Letter audio clip updated successfully.',

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
    logoutSuccess: 'تم تسجيل الخروج بنجاح.',
    tokenInvalidated: 'انتهت صلاحية الجلسة أو تم تسجيل الخروج. يرجى تسجيل الدخول مجدداً.',
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

    // Units
    unitCreatedSuccess: 'تم إضافة الوحدة بنجاح.',
    unitsRetrievedSuccess: 'تم استرجاع الوحدات بنجاح.',
    unitRetrievedSuccess: 'تم استرجاع الوحدة بنجاح.',
    unitUpdatedSuccess: 'تم تحديث الوحدة بنجاح.',
    unitDeletedSuccess: 'تم حذف الوحدة بنجاح.',
    unitNotFound: 'لم يتم العثور على الوحدة المطلوبة.',
    unitAlreadyExists: 'توجد وحدة مسجلة بالفعل بهذا الاسم العربي أو الإنجليزي في هذا الجزء.',
    invalidUnitId: 'معرف الوحدة غير صالح.',

    // Lessons
    lessonCreatedSuccess: 'تم إضافة الدرس بنجاح.',
    lessonsRetrievedSuccess: 'تم استرجاع الدروس بنجاح.',
    lessonRetrievedSuccess: 'تم استرجاع الدرس بنجاح.',
    lessonUpdatedSuccess: 'تم تحديث الدرس بنجاح.',
    lessonDeletedSuccess: 'تم حذف الدرس بنجاح.',
    lessonNotFound: 'لم يتم العثور على الدرس المطلوب.',
    lessonAlreadyExists: 'يوجد درس مسجل بالفعل بهذا الاسم العربي أو الإنجليزي في هذه الوحدة.',
    invalidLessonId: 'معرف الدرس غير صالح.',

    // Days
    dayCreatedSuccess: 'تم إضافة اليوم بنجاح.',
    daysRetrievedSuccess: 'تم استرجاع الأيام بنجاح.',
    dayRetrievedSuccess: 'تم استرجاع اليوم بنجاح.',
    dayUpdatedSuccess: 'تم تحديث اليوم بنجاح.',
    dayDeletedSuccess: 'تم حذف اليوم بنجاح.',
    dayNotFound: 'لم يتم العثور على اليوم المطلوب.',
    dayAlreadyExists: 'يوجد يوم مسجل بالفعل بهذا الاسم العربي أو الإنجليزي في هذا الدرس.',
    invalidDayId: 'معرف اليوم غير صالح.',

    // Phases
    phaseCreatedSuccess: 'تم إضافة المرحلة بنجاح.',
    phasesRetrievedSuccess: 'تم استرجاع المراحل بنجاح.',
    phaseRetrievedSuccess: 'تم استرجاع المرحلة بنجاح.',
    phaseUpdatedSuccess: 'تم تحديث المرحلة بنجاح.',
    phaseDeletedSuccess: 'تم حذف المرحلة بنجاح.',
    phaseNotFound: 'لم يتم العثور على المرحلة المطلوبة.',
    phaseAlreadyExists: 'توجد مرحلة مسجلة بالفعل بهذا النوع في هذا اليوم.',
    invalidPhaseId: 'معرف المرحلة غير صالح.',

    // Steps
    stepCreatedSuccess: 'تم إضافة الخطوة بنجاح.',
    stepsRetrievedSuccess: 'تم استرجاع الخطوات بنجاح.',
    stepRetrievedSuccess: 'تم استرجاع الخطوة بنجاح.',
    stepUpdatedSuccess: 'تم تحديث الخطوة بنجاح.',
    stepDeletedSuccess: 'تم حذف الخطوة بنجاح.',
    stepNotFound: 'لم يتم العثور على الخطوة المطلوبة.',
    invalidStepId: 'معرف الخطوة غير صالح.',
    invalidStepData: 'بيانات الخطوة غير صالحة للنوع المحدد.',

    // Journey
    journeyRetrievedSuccess: 'تم استرجاع الرحلة التعليمية بنجاح.',
    journeyProgressUpdatedSuccess: 'تم تحديث تقدم الرحلة التعليمية بنجاح.',
    journeyProgressResetSuccess: 'تمت إعادة ضبط تقدم الرحلة التعليمية بنجاح.',
    lessonDaysRetrievedSuccess: 'تم استرجاع أيام الدرس بنجاح.',
    dayProgressUpdatedSuccess: 'تم تحديث تقدم اليوم بنجاح.',
    phaseStepsRetrievedSuccess: 'تم استرجاع خطوات المرحلة بنجاح.',
    dayStepsRetrievedSuccess: 'تم استرجاع خطوات اليوم بنجاح.',
    dayLocked: 'هذا اليوم مغلق ولا يمكن الوصول إليه حالياً.',

    // Arabic Letters
    lettersRetrievedSuccess: 'تم استرجاع حروف اللغة العربية بنجاح.',
    letterRetrievedSuccess: 'تم استرجاع الحرف العربي بنجاح.',
    letterNotFound: 'لم يتم العثور على الحرف المطلوب.',
    invalidLetterId: 'معرف الحرف غير صالح.',
    letterAudioUpdatedSuccess: 'تم تحديث المقطع الصوتي للحرف بنجاح.',

    // General
    helloWorld: 'مرحباً بكم في منصة الواضح!',
  },
} as const;

export type MessageKey = keyof typeof messages.en;

export function getMessages(lang: AppLanguage | 'ar' | 'en' = AppLanguage.EN) {
  return messages[lang as 'ar' | 'en'] ?? messages.en;
}