import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;

/** Short devices need tighter fixed blocks so the flexible body never collapses. */
export const COMPACT = SCREEN_H < 760;

/** Rule #13 — EXACTLY 8000ms. Shorter races the screenshot capture window. */
export const LOADER_DURATION_MS = 8000;
export const LOADER_PROGRESS_MS = 7600;
export const LOADER_FADE_MS = 300;
export const LOADER_BAR_W = 190;
export const LOADER_BAR_H = 4;

/** Header geometry — rule #6. */
export const HEADER_TOP_PAD = 44;
export const HEADER_BAR_H = 72;
export const HEADER_H = HEADER_TOP_PAD + HEADER_BAR_H;

/** Panel / board geometry — rules #4, #5. */
export const PANEL_MAX_W = Math.min(SCREEN_W - 32, 380);
export const PANEL_PAD = 12;
export const PANEL_BORDER = 1;
export const FRAME = PANEL_PAD + PANEL_BORDER;
export const CARD_GAP = 10;
export const CARD_W = Math.floor((PANEL_MAX_W - 2 * FRAME - 2 * CARD_GAP) / 3);
export const ROW_W = CARD_W * 3 + 2 * CARD_GAP + 2 * FRAME;

/** Solver screen blocks. */
export const TABS_H = 38;
export const VAR_CARD_H = COMPACT ? 138 : 152;
export const FORMULA_H = COMPACT ? 40 : 44;
export const CONTROLS_H = COMPACT ? 192 : 214;
export const STAT_PILL_H = COMPACT ? 54 : 58;
export const CHIP_H = 38;

/** Buttons. */
export const PRIMARY_BTN_H = COMPACT ? 54 : 58;
export const SECONDARY_BTN_H = 48;
export const ICON_BTN = 40;
export const BTN_ICON = 24;
export const BTN_GAP = 10;
export const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** Solver domain limits. */
export const DIST_MIN = 0.5;
export const DIST_MAX = 20;
export const DIST_STEP = 0.1;
export const ISO_MIN = 100;
export const ISO_MAX = 6400;

/** Stagger / animation timings. */
export const STAGGER_STEP = 80;
export const ENTER_MS = 320;
export const LOCK_CLICK_MS = 160;
export const COUNT_IN_MS = 160;
export const BEAM_MS = 280;
export const HOLD_REPEAT_MS = 140;
export const HAPTIC_MS = 12;

/** Practice quiz. */
export const QUIZ_LENGTH = 10;
export const QUIZ_TOLERANCE = Math.pow(2, 1 / 6); // one third of a stop

export default {
  LOADER_DURATION_MS,
  HEADER_H,
  PANEL_MAX_W,
  QUIZ_LENGTH,
};
