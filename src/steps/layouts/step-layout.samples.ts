import { StepLayoutType } from '../enums/step.enum.js';
import { GridLayoutData } from './step-layout.types.js';

// ─── Sample data per layoutType ───────────────────────────────────────────────
// Use these in seed scripts, documentation, or Postman examples.

const gridSample: GridLayoutData = {
    items: [
        { text: 'ء', audioUrl: 'https://cdn.alwadih.com/audio/letters/hamza.mp3' },
        { text: 'هـ', audioUrl: 'https://cdn.alwadih.com/audio/letters/ha.mp3' },
        { text: 'ع', audioUrl: 'https://cdn.alwadih.com/audio/letters/ayn.mp3' },
        { text: 'ح', audioUrl: 'https://cdn.alwadih.com/audio/letters/ha2.mp3' },
        { text: 'غ', audioUrl: 'https://cdn.alwadih.com/audio/letters/ghayn.mp3' },
        { text: 'خ', audioUrl: 'https://cdn.alwadih.com/audio/letters/kha.mp3' },
    ],
};

export const stepLayoutSamples: Record<StepLayoutType, GridLayoutData> = {
    [StepLayoutType.GRID_2]: gridSample,
    [StepLayoutType.GRID_4]: gridSample,
    [StepLayoutType.GRID_5]: gridSample,
};
