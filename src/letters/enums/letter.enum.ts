export enum LetterType {
    LATHWI = 'LATHWI',                               // حروف لثوية
    TAFKHEEM = 'TAFKHEEM',                           // حروف تفخيم
    LATHWI_MUFAKKHAM = 'LATHWI_MUFAKKHAM',           // حرف لثوي مفخم
    TARQEEQ_WA_TAFKHEEM = 'TARQEEQ_WA_TAFKHEEM',     // حروف تدور بين الترقيق والتفخيم
}

export const LETTER_TYPE_LABELS = {
    [LetterType.LATHWI]: {
        ar: 'حروف لثوية',
        en: 'Interdental Letters',
    },
    [LetterType.TAFKHEEM]: {
        ar: 'حروف تفخيم',
        en: 'Emphatic Letters (Tafkheem)',
    },
    [LetterType.LATHWI_MUFAKKHAM]: {
        ar: 'حرف لثوي مفخم',
        en: 'Interdental Emphatic Letter',
    },
    [LetterType.TARQEEQ_WA_TAFKHEEM]: {
        ar: 'حروف تدور بين الترقيق والتفخيم',
        en: 'Letters Alternating Between Tarqeeq and Tafkheem',
    },
} as const;
