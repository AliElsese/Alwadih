import { describe, it, expect } from 'vitest';
import { validateStepLayoutData } from './step-layout.validator.js';
import { StepLayoutType } from '../enums/step.enum.js';
import { stepLayoutSamples } from './step-layout.samples.js';

describe('validateStepLayoutData', () => {
    it('should validate all stepLayoutSamples as valid for their respective layoutType', () => {
        for (const layoutType of Object.values(StepLayoutType)) {
            const sample = stepLayoutSamples[layoutType];
            const result = validateStepLayoutData(layoutType, sample);
            expect(result.valid).toBe(true);
            expect(result.message).toBeUndefined();
        }
    });

    it('should reject non-object or null data', () => {
        const result = validateStepLayoutData(StepLayoutType.GRID_4, null as any);
        expect(result.valid).toBe(false);
        expect(result.message).toContain('non-null object');
    });

    it('should reject GRID layout without items array', () => {
        const result = validateStepLayoutData(StepLayoutType.GRID_2, { notItems: [] });
        expect(result.valid).toBe(false);
        expect(result.message).toContain('data.items must be an array');
    });

    it('should reject GRID layout with empty items array', () => {
        const result = validateStepLayoutData(StepLayoutType.GRID_5, { items: [] });
        expect(result.valid).toBe(false);
        expect(result.message).toContain('at least one item');
    });

    it('should reject GRID layout if item is missing text or text is empty', () => {
        const result = validateStepLayoutData(StepLayoutType.GRID_4, {
            items: [{ text: '', audioUrl: 'https://example.com/audio.mp3' }],
        });
        expect(result.valid).toBe(false);
        expect(result.message).toContain('text is required and must be a non-empty string');
    });

    it('should reject GRID layout if item is missing audioUrl or audioUrl is empty', () => {
        const result = validateStepLayoutData(StepLayoutType.GRID_2, {
            items: [{ text: 'ب', audioUrl: '   ' }],
        });
        expect(result.valid).toBe(false);
        expect(result.message).toContain('audioUrl is required and must be a non-empty string');
    });

    it('should accept valid GRID items', () => {
        const result = validateStepLayoutData(StepLayoutType.GRID_4, {
            items: [
                { text: 'أ', audioUrl: 'https://example.com/alif.mp3' },
                { text: 'ب', audioUrl: 'https://example.com/baa.mp3' },
            ],
        });
        expect(result.valid).toBe(true);
    });
});
