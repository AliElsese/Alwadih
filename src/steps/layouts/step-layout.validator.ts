import { StepLayoutType } from '../enums/step.enum.js';

/** Layouts that belong to the GRID family (share the same data shape). */
const GRID_LAYOUTS: ReadonlySet<string> = new Set([
    StepLayoutType.GRID_2,
    StepLayoutType.GRID_4,
    StepLayoutType.GRID_5,
]);

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

/**
 * Validates the `data` object against the expected shape for the given `layoutType`.
 * Returns { valid: true } on success, or { valid: false, message } on failure.
 */
export function validateStepLayoutData(
    layoutType: StepLayoutType,
    data: Record<string, unknown>,
): ValidationResult {
    if (!data || typeof data !== 'object') {
        return { valid: false, message: 'Step data must be a non-null object.' };
    }

    // ── GRID family ───────────────────────────────────────────────────────────
    if (GRID_LAYOUTS.has(layoutType)) {
        return validateGridData(data);
    }

    // Unknown layoutType – fail safe (should never reach here if enum is in sync)
    return { valid: false, message: `No data validator defined for layoutType "${layoutType}".` };
}

// ─── GRID validator ───────────────────────────────────────────────────────────
function validateGridData(data: Record<string, unknown>): ValidationResult {
    if (!Array.isArray(data.items)) {
        return { valid: false, message: 'data.items must be an array for GRID layout types.' };
    }

    if (data.items.length === 0) {
        return { valid: false, message: 'data.items must contain at least one item.' };
    }

    for (let i = 0; i < (data.items as unknown[]).length; i++) {
        const item = (data.items as unknown[])[i];

        if (typeof item !== 'object' || item === null) {
            return { valid: false, message: `data.items[${i}] must be an object.` };
        }

        const record = item as Record<string, unknown>;

        if (typeof record.text !== 'string' || record.text.trim() === '') {
            return {
                valid: false,
                message: `data.items[${i}].text is required and must be a non-empty string (Arabic letter).`,
            };
        }

        if (typeof record.audioUrl !== 'string' || record.audioUrl.trim() === '') {
            return {
                valid: false,
                message: `data.items[${i}].audioUrl is required and must be a non-empty string (audio URL).`,
            };
        }
    }

    return { valid: true };
}
