import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq } from '../schemas/faq.schema.js';
import { PrivacyPolicy } from '../schemas/privacy-policy.schema.js';
import { ContentStatus } from '../enums/content.enum.js';
import { AppLanguage } from '../../common/i18n/language.decorator.js';
import { getMessages } from '../../common/i18n/messages.js';
import { sanitizeLinks, sanitizeText } from '../utils/content-sanitizer.js';

@Injectable()
export class ContentService implements OnModuleInit {
    private readonly logger = new Logger(ContentService.name);

    constructor(
        @InjectModel(Faq.name) private readonly faqModel: Model<Faq>,
        @InjectModel(PrivacyPolicy.name) private readonly privacyPolicyModel: Model<PrivacyPolicy>,
    ) { }

    /**
     * Seeds initial published FAQ and Privacy Policy content if database is empty.
     */
    async onModuleInit() {
        try {
            await this.seedInitialContentIfEmpty();
        } catch (error) {
            this.logger.warn('Content seeding check skipped or failed:', error);
        }
    }

    /**
     * Retrieves published FAQ entries for the specified locale, ordered by displayOrder.
     */
    async getFaqs(locale: AppLanguage = AppLanguage.AR) {
        const msg = getMessages(locale);

        // Retrieve only published content, ordered by displayOrder then creation date
        const faqs = await this.faqModel
            .find({
                locale,
                status: ContentStatus.PUBLISHED,
            })
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean()
            .exec();

        const formattedItems = faqs.map((faq) => ({
            id: faq.faqId,
            question: sanitizeText(faq.question),
            answer: sanitizeText(faq.answer),
            links: sanitizeLinks(faq.links),
            order: faq.displayOrder,
        }));

        return {
            message: formattedItems.length > 0 ? msg.faqRetrievedSuccess : msg.faqEmpty,
            locale,
            count: formattedItems.length,
            items: formattedItems,
        };
    }

    /**
     * Retrieves the latest published Privacy Policy for the specified locale.
     */
    async getPrivacyPolicy(locale: AppLanguage = AppLanguage.AR) {
        const msg = getMessages(locale);

        // Retrieve only the latest published policy for the requested locale
        const policy = await this.privacyPolicyModel
            .findOne({
                locale,
                status: ContentStatus.PUBLISHED,
            })
            .sort({ effectiveDate: -1, createdAt: -1 })
            .lean()
            .exec();

        if (!policy) {
            throw new NotFoundException(msg.privacyPolicyNotFound);
        }

        return {
            message: msg.privacyPolicyRetrievedSuccess,
            locale,
            policy: {
                id: policy.policyId,
                version: policy.version,
                effectiveDate: policy.effectiveDate,
                title: sanitizeText(policy.title),
                summary: policy.summary ? sanitizeText(policy.summary) : undefined,
                sections: (policy.sections || []).map((sec) => ({
                    title: sanitizeText(sec.title),
                    content: sanitizeText(sec.content),
                    links: sanitizeLinks(sec.links),
                })),
            },
        };
    }

    /**
     * Initial content seed helper for empty installations.
     */
    private async seedInitialContentIfEmpty(): Promise<void> {
        const faqCount = await this.faqModel.countDocuments();
        if (faqCount === 0) {
            this.logger.log('Seeding initial published FAQs (ar & en)...');
            await this.faqModel.insertMany([
                // Arabic FAQs
                {
                    faqId: 'faq-alwadih-overview-01',
                    locale: AppLanguage.AR,
                    question: 'ما هي منصة الواضح؟',
                    answer: 'منصة الواضح هي تطبيق إسلامي متخصص في تلاوة القرآن الكريم وتدبر معانيه بخطوط عثمانية معتمدة وقراء متعددين.',
                    links: [{ label: 'موقع المنصة', url: 'https://alwadih.com' }],
                    displayOrder: 1,
                    status: ContentStatus.PUBLISHED,
                },
                {
                    faqId: 'faq-offline-reading-02',
                    locale: AppLanguage.AR,
                    question: 'هل يمكن استخدام التطبيق بدون اتصال بالإنترنت؟',
                    answer: 'نعم، يمكنك قراءة نصوص القرآن الكريم ومحفوظاتك دون اتصال بالإنترنت، بينما تتطلب التلاوات الصوتية تحميلها مسبقاً.',
                    links: [],
                    displayOrder: 2,
                    status: ContentStatus.PUBLISHED,
                },
                {
                    faqId: 'faq-reading-customization-03',
                    locale: AppLanguage.AR,
                    question: 'كيف يمكنني تخصيص حجم الخط والمظهر؟',
                    answer: 'من خلال شاشة الإعدادات، يمكنك اختيار حجم الخط المفضل (صغير، متوسط، كبير، كبير جداً) ومظهر التطبيق (فاتح، داكن، حسب النظام).',
                    links: [],
                    displayOrder: 3,
                    status: ContentStatus.PUBLISHED,
                },
                // English FAQs
                {
                    faqId: 'faq-alwadih-overview-01',
                    locale: AppLanguage.EN,
                    question: 'What is Alwadih platform?',
                    answer: 'Alwadih is a comprehensive Quran platform featuring authentic Uthmanic fonts, renowned reciters, and tailored reading experiences.',
                    links: [{ label: 'Official Website', url: 'https://alwadih.com' }],
                    displayOrder: 1,
                    status: ContentStatus.PUBLISHED,
                },
                {
                    faqId: 'faq-offline-reading-02',
                    locale: AppLanguage.EN,
                    question: 'Can I read the Quran offline?',
                    answer: 'Yes, Quran texts and your saved bookmarks are available offline. Audio recitations require pre-downloading.',
                    links: [],
                    displayOrder: 2,
                    status: ContentStatus.PUBLISHED,
                },
                {
                    faqId: 'faq-reading-customization-03',
                    locale: AppLanguage.EN,
                    question: 'How do I customize font size and appearance?',
                    answer: 'Navigate to Settings to adjust font size (small, medium, large, extra large) and theme (light, dark, system).',
                    links: [],
                    displayOrder: 3,
                    status: ContentStatus.PUBLISHED,
                },
            ]);
        }

        const policyCount = await this.privacyPolicyModel.countDocuments();
        if (policyCount === 0) {
            this.logger.log('Seeding initial published Privacy Policy (ar & en)...');
            const effectiveDate = new Date('2026-01-01T00:00:00.000Z');

            await this.privacyPolicyModel.insertMany([
                // Arabic Privacy Policy
                {
                    policyId: 'privacy-policy',
                    locale: AppLanguage.AR,
                    version: '1.0.0',
                    effectiveDate,
                    title: 'سياسة الخصوصية لمنصة الواضح',
                    summary: 'تلتزم منصة الواضح بحماية بياناتك الشخصية واحترام خصوصيتك أثناء استخدامك للتطبيق.',
                    sections: [
                        {
                            title: '١. البيانات التي نجمعها',
                            content: 'نقوم بجمع بيانات الحساب الأساسية كالاسم والبريد الإلكتروني وتفضيلات القراءة لتحسين تجربة المستخدم.',
                            links: [],
                        },
                        {
                            title: '٢. استخدام البيانات',
                            content: 'تُستخدم بياناتك فقط لتوفير الخدمات القرآنية وحفظ التفضيلات والمزامنة عبر الأجهزة.',
                            links: [],
                        },
                        {
                            title: '٣. حماية البيانات ومشاركتها',
                            content: 'نحن لا نبيع بياناتك الشخصية ولا نشاركها مع أي أطراف ثالثة لأغراض دعائية.',
                            links: [{ label: 'تواصل مع الدعم', url: 'mailto:support@alwadih.com' }],
                        },
                    ],
                    status: ContentStatus.PUBLISHED,
                },
                // English Privacy Policy
                {
                    policyId: 'privacy-policy',
                    locale: AppLanguage.EN,
                    version: '1.0.0',
                    effectiveDate,
                    title: 'Alwadih Privacy Policy',
                    summary: 'Alwadih is dedicated to protecting your privacy and personal data while using our platform.',
                    sections: [
                        {
                            title: '1. Information We Collect',
                            content: 'We collect basic profile data such as name, email, and reading preferences to personalize your Quran study experience.',
                            links: [],
                        },
                        {
                            title: '2. How We Use Information',
                            content: 'Your data is strictly utilized to deliver application services, maintain preferences, and sync reading progress.',
                            links: [],
                        },
                        {
                            title: '3. Data Protection & Sharing',
                            content: 'We never sell or disclose your personal data to third parties for advertising or marketing.',
                            links: [{ label: 'Contact Support', url: 'mailto:support@alwadih.com' }],
                        },
                    ],
                    status: ContentStatus.PUBLISHED,
                },
            ]);
        }
    }
}

