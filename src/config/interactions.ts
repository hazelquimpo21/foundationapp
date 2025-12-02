/**
 * 🎮 Interaction Configuration
 *
 * Pre-configured interactions for common scenarios.
 * These are the "word banks", "sliders", and other
 * interactive elements that help users avoid blank page syndrome.
 */

import {
  WordBankInteraction,
  SliderSetInteraction,
  BinaryChoiceInteraction,
} from '@/lib/types';

// ============================================
// 🏷️ Word Banks
// ============================================

/** Customer mindset word bank */
export const CUSTOMER_MINDSET_WORDS: WordBankInteraction = {
  type: 'word_bank',
  id: 'customer_mindset',
  targetFields: ['customer_who_psychographic'],
  prompt: "What words describe your ideal customer's mindset? Pick 4-6 that feel right.",
  words: [
    { value: 'ambitious', label: 'Ambitious' },
    { value: 'overwhelmed', label: 'Overwhelmed' },
    { value: 'skeptical', label: 'Skeptical' },
    { value: 'curious', label: 'Curious' },
    { value: 'time_starved', label: 'Time-starved' },
    { value: 'diy_minded', label: 'DIY-minded' },
    { value: 'willing_to_invest', label: 'Willing to invest' },
    { value: 'price_conscious', label: 'Price-conscious' },
    { value: 'perfectionist', label: 'Perfectionist' },
    { value: 'action_oriented', label: 'Action-oriented' },
    { value: 'cautious', label: 'Cautious' },
    { value: 'early_adopter', label: 'Early adopter' },
    { value: 'values_quality', label: 'Values quality' },
    { value: 'wants_done_for_them', label: 'Wants it done for them' },
    { value: 'loves_learning', label: 'Loves learning' },
    { value: 'frustrated', label: 'Frustrated with status quo' },
    { value: 'optimistic', label: 'Optimistic' },
    { value: 'pragmatic', label: 'Pragmatic' },
  ],
  selectionRange: { min: 4, max: 6 },
};

/** Core values word bank */
export const VALUES_WORD_BANK: WordBankInteraction = {
  type: 'word_bank',
  id: 'values_core',
  targetFields: ['values_core'],
  prompt: "Let's find your brand's values. Pick 5-7 words that feel true to who you are.",
  words: [
    // Character
    { value: 'authentic', label: 'Authentic', category: 'character' },
    { value: 'bold', label: 'Bold', category: 'character' },
    { value: 'humble', label: 'Humble', category: 'character' },
    { value: 'confident', label: 'Confident', category: 'character' },
    { value: 'curious', label: 'Curious', category: 'character' },
    { value: 'rebellious', label: 'Rebellious', category: 'character' },
    // Approach
    { value: 'thoughtful', label: 'Thoughtful', category: 'approach' },
    { value: 'fast_moving', label: 'Fast-moving', category: 'approach' },
    { value: 'meticulous', label: 'Meticulous', category: 'approach' },
    { value: 'experimental', label: 'Experimental', category: 'approach' },
    { value: 'practical', label: 'Practical', category: 'approach' },
    { value: 'visionary', label: 'Visionary', category: 'approach' },
    // Relationship
    { value: 'collaborative', label: 'Collaborative', category: 'relationship' },
    { value: 'independent', label: 'Independent', category: 'relationship' },
    { value: 'supportive', label: 'Supportive', category: 'relationship' },
    { value: 'challenging', label: 'Challenging', category: 'relationship' },
    { value: 'warm', label: 'Warm', category: 'relationship' },
    { value: 'professional', label: 'Professional', category: 'relationship' },
    // Quality
    { value: 'craft_focused', label: 'Craft-focused', category: 'quality' },
    { value: 'efficient', label: 'Efficient', category: 'quality' },
    { value: 'premium', label: 'Premium', category: 'quality' },
    { value: 'accessible', label: 'Accessible', category: 'quality' },
    { value: 'innovative', label: 'Innovative', category: 'quality' },
    { value: 'reliable', label: 'Reliable', category: 'quality' },
  ],
  categories: [
    { id: 'character', label: 'Character' },
    { id: 'approach', label: 'Approach' },
    { id: 'relationship', label: 'Relationship' },
    { id: 'quality', label: 'Quality' },
  ],
  selectionRange: { min: 5, max: 7 },
};

/** Anti-values word bank (what you don't want to be) */
export const ANTI_VALUES_WORD_BANK: WordBankInteraction = {
  type: 'word_bank',
  id: 'anti_values',
  targetFields: ['values_stands_against', 'voice_donts'],
  prompt: 'Which of these would make you cringe if someone described your brand this way?',
  words: [
    { value: 'salesy', label: 'Salesy' },
    { value: 'generic', label: 'Generic' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'trendy', label: 'Trendy' },
    { value: 'cheap', label: 'Cheap' },
    { value: 'complicated', label: 'Complicated' },
    { value: 'pushy', label: 'Pushy' },
    { value: 'boring', label: 'Boring' },
    { value: 'exclusive', label: 'Exclusive' },
    { value: 'chaotic', label: 'Chaotic' },
    { value: 'cold', label: 'Cold' },
    { value: 'preachy', label: 'Preachy' },
  ],
  selectionRange: { min: 2, max: 5 },
};

/** Brand personality word bank */
export const PERSONALITY_WORD_BANK: WordBankInteraction = {
  type: 'word_bank',
  id: 'personality',
  targetFields: ['personality_tags'],
  prompt: 'If your brand were a person at a party, how would people describe them?',
  words: [
    { value: 'expert', label: 'The expert everyone wants to talk to' },
    { value: 'warm', label: 'The warm one who makes everyone comfortable' },
    { value: 'witty', label: 'The witty one with great one-liners' },
    { value: 'calm', label: 'The calm presence in the chaos' },
    { value: 'bold', label: 'The bold one who says what others won\'t' },
    { value: 'creative', label: 'The creative one with fresh ideas' },
    { value: 'reliable', label: 'The reliable one you can count on' },
    { value: 'enthusiast', label: 'The enthusiast who\'s genuinely excited' },
    { value: 'thoughtful', label: 'The thoughtful one who asks great questions' },
    { value: 'straight_shooter', label: 'The straight-shooter who gives it direct' },
  ],
  selectionRange: { min: 3, max: 5 },
};

/** Business stage selector */
export const BUSINESS_STAGE_WORDS: WordBankInteraction = {
  type: 'word_bank',
  id: 'business_stage',
  targetFields: ['business_stage'],
  prompt: 'Where is your business in its journey right now?',
  words: [
    { value: 'idea', label: 'Just an idea' },
    { value: 'pre-launch', label: 'Building it' },
    { value: 'launched', label: 'Recently launched' },
    { value: 'growing', label: 'Up and running' },
    { value: 'established', label: 'Been at this a while' },
    { value: 'pivoting', label: 'Pivoting/evolving' },
  ],
  selectionRange: { min: 1, max: 1 },
};

// ============================================
// 📊 Slider Sets
// ============================================

/** Voice spectrum sliders */
export const VOICE_SLIDERS: SliderSetInteraction = {
  type: 'slider_set',
  id: 'voice_spectrums',
  targetFields: [
    'voice_spectrum_formal',
    'voice_spectrum_playful',
    'voice_spectrum_bold',
    'voice_spectrum_technical',
  ],
  prompt: "Where does your brand's voice sit on these spectrums?",
  sliders: [
    {
      id: 'formal',
      fieldId: 'voice_spectrum_formal',
      labelLow: 'Casual',
      labelHigh: 'Formal',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5,
    },
    {
      id: 'playful',
      fieldId: 'voice_spectrum_playful',
      labelLow: 'Serious',
      labelHigh: 'Playful',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5,
    },
    {
      id: 'bold',
      fieldId: 'voice_spectrum_bold',
      labelLow: 'Understated',
      labelHigh: 'Bold',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5,
    },
    {
      id: 'technical',
      fieldId: 'voice_spectrum_technical',
      labelLow: 'Approachable',
      labelHigh: 'Expert',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5,
    },
  ],
};

// ============================================
// ⚖️ Binary Choices
// ============================================

/** Brand walks into a room choice */
export const BRAND_ROOM_CHOICE: BinaryChoiceInteraction = {
  type: 'binary_choice',
  id: 'brand_room',
  targetFields: ['personality_tags'],
  prompt: 'Your brand walks into a room. Does it...',
  optionA: {
    value: 'social',
    label: 'Work the room, talking to everyone',
  },
  optionB: {
    value: 'focused',
    label: 'Find one person for a deep conversation',
  },
  allowMiddle: true,
};

/** Explaining complexity choice */
export const EXPLAIN_CHOICE: BinaryChoiceInteraction = {
  type: 'binary_choice',
  id: 'explain_style',
  targetFields: ['personality_tags', 'voice_spectrum_technical'],
  prompt: 'When explaining something complex, do you...',
  optionA: {
    value: 'stories',
    label: 'Use analogies and stories',
  },
  optionB: {
    value: 'facts',
    label: 'Get straight to the facts',
  },
  allowMiddle: true,
};

/** Customer frustration handling choice */
export const FRUSTRATION_CHOICE: BinaryChoiceInteraction = {
  type: 'binary_choice',
  id: 'frustration_handling',
  targetFields: ['tone_situations'],
  prompt: 'If a customer is frustrated, should they feel...',
  optionA: {
    value: 'taken_care_of',
    label: 'Taken care of',
  },
  optionB: {
    value: 'empowered',
    label: 'Empowered to solve it themselves',
  },
  allowMiddle: true,
};

/** Business model choice */
export const BUSINESS_MODEL_CHOICE: BinaryChoiceInteraction = {
  type: 'binary_choice',
  id: 'business_model_type',
  targetFields: ['business_model'],
  prompt: 'How does your business make money?',
  optionA: {
    value: 'product',
    label: 'Selling a product',
  },
  optionB: {
    value: 'service',
    label: 'Providing a service',
  },
  allowMiddle: true, // "both" option
};

// ============================================
// 📚 Interaction Registry
// ============================================

/** All available interactions by ID */
export const INTERACTIONS = {
  customer_mindset: CUSTOMER_MINDSET_WORDS,
  values_core: VALUES_WORD_BANK,
  anti_values: ANTI_VALUES_WORD_BANK,
  personality: PERSONALITY_WORD_BANK,
  business_stage: BUSINESS_STAGE_WORDS,
  voice_spectrums: VOICE_SLIDERS,
  brand_room: BRAND_ROOM_CHOICE,
  explain_style: EXPLAIN_CHOICE,
  frustration_handling: FRUSTRATION_CHOICE,
  business_model_type: BUSINESS_MODEL_CHOICE,
} as const;

/** Get an interaction by ID */
export function getInteraction(id: string) {
  return INTERACTIONS[id as keyof typeof INTERACTIONS];
}
