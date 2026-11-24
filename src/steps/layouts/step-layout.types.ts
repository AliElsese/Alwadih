import { StepLayoutType } from '../enums/step.enum.js';

// ─── Grid Item ────────────────────────────────────────────────────────────────
// Used by: GRID-2 | GRID-4 | GRID-5
// Each item represents one Arabic letter card shown in the grid.
export interface GridItem {
    /** Arabic letter or syllable to display */
    text: string;
    /** URL of the audio clip for this letter on the external audio server */
    audioUrl: string;
}

export type GridLayoutData = {
    items: GridItem[];
};

// ─── Discriminated union of ALL layout data shapes ───────────────────────────
// Add new members here when a new layoutType is introduced.
export type StepLayoutData =
    | { layoutType: StepLayoutType.GRID_2; data: GridLayoutData }
    | { layoutType: StepLayoutType.GRID_4; data: GridLayoutData }
    | { layoutType: StepLayoutType.GRID_5; data: GridLayoutData };
