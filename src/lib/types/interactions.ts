/**
 * 🎮 Interaction Types
 *
 * Types for interactive UI elements (word banks, sliders, etc.)
 */

// ============================================
// 📦 Base Interaction Types
// ============================================

/** All possible interaction types */
export type InteractionType =
  | 'word_bank'
  | 'slider'
  | 'slider_set'
  | 'binary_choice'
  | 'sentence_starter'
  | 'inference_reveal';

/** Base interface for all interactions */
export interface BaseInteraction {
  type: InteractionType;
  id: string;
  /** Which field(s) this interaction feeds */
  targetFields: string[];
}

// ============================================
// 🏷️ Word Bank
// ============================================

/** Word bank interaction (select multiple words) */
export interface WordBankInteraction extends BaseInteraction {
  type: 'word_bank';
  /** Prompt shown above the word bank */
  prompt: string;
  /** Available words to choose from */
  words: WordOption[];
  /** How many words can be selected */
  selectionRange: {
    min: number;
    max: number;
  };
  /** Group words into categories? */
  categories?: WordCategory[];
}

/** A single word option */
export interface WordOption {
  value: string;
  label: string;
  /** Optional category for grouping */
  category?: string;
}

/** Category for grouping words */
export interface WordCategory {
  id: string;
  label: string;
}

/** Response from word bank */
export interface WordBankResponse {
  interactionId: string;
  selectedWords: string[];
}

// ============================================
// 📊 Slider
// ============================================

/** Single slider interaction */
export interface SliderInteraction extends BaseInteraction {
  type: 'slider';
  /** Prompt shown above slider */
  prompt: string;
  /** Label for low end */
  labelLow: string;
  /** Label for high end */
  labelHigh: string;
  /** Range */
  min: number;
  max: number;
  /** Step size */
  step: number;
  /** Default value */
  defaultValue: number;
}

/** Set of related sliders */
export interface SliderSetInteraction extends BaseInteraction {
  type: 'slider_set';
  prompt: string;
  sliders: SliderConfig[];
}

/** Config for a single slider in a set */
export interface SliderConfig {
  id: string;
  fieldId: string;
  labelLow: string;
  labelHigh: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

/** Response from slider(s) */
export interface SliderResponse {
  interactionId: string;
  values: Record<string, number>;
}

// ============================================
// ⚖️ Binary Choice
// ============================================

/** Binary choice interaction (this or that) */
export interface BinaryChoiceInteraction extends BaseInteraction {
  type: 'binary_choice';
  prompt: string;
  optionA: ChoiceOption;
  optionB: ChoiceOption;
  /** Allow "both" or "neither"? */
  allowMiddle?: boolean;
}

/** A choice option */
export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
}

/** Response from binary choice */
export interface BinaryChoiceResponse {
  interactionId: string;
  choice: string;
}

// ============================================
// ✏️ Sentence Starter
// ============================================

/** Sentence starter interaction */
export interface SentenceStarterInteraction extends BaseInteraction {
  type: 'sentence_starter';
  /** The sentence start (e.g., "I wish I could just...") */
  starter: string;
  /** Placeholder text */
  placeholder: string;
}

/** Response from sentence starter */
export interface SentenceStarterResponse {
  interactionId: string;
  completion: string;
}

// ============================================
// 💡 Inference Reveal
// ============================================

/** Inference reveal interaction */
export interface InferenceRevealInteraction extends BaseInteraction {
  type: 'inference_reveal';
  /** The inference ID from database */
  inferenceId: string;
  /** Field being inferred */
  fieldId: string;
  fieldName: string;
  /** The inferred value */
  inferredValue: string;
  /** Human-friendly display text */
  displayText: string;
  /** How confident we are */
  confidence: 'low' | 'medium' | 'high';
}

/** Response to inference reveal */
export interface InferenceRevealResponse {
  interactionId: string;
  inferenceId: string;
  action: 'confirm' | 'reject' | 'edit';
  editedValue?: string;
}

// ============================================
// 🔄 Union Types
// ============================================

/** Any chat interaction */
export type ChatInteraction =
  | WordBankInteraction
  | SliderInteraction
  | SliderSetInteraction
  | BinaryChoiceInteraction
  | SentenceStarterInteraction
  | InferenceRevealInteraction;

/** Any interaction response */
export type InteractionResponse =
  | WordBankResponse
  | SliderResponse
  | BinaryChoiceResponse
  | SentenceStarterResponse
  | InferenceRevealResponse;
