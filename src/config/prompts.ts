/**
 * 💬 Prompt Configuration
 *
 * System prompts and message templates for the AI conversation.
 * These guide the assistant's personality and responses.
 */

// ============================================
// 🤖 System Prompts
// ============================================

/**
 * Main system prompt for the chat assistant.
 * This sets the personality and behavior.
 */
export const SYSTEM_PROMPT = `You are a friendly, insightful brand strategist helping a founder build their brand foundation. Your role is to have a natural conversation that uncovers what makes their business unique.

PERSONALITY:
- Warm but professional
- Genuinely curious, not interrogating
- Celebrate insights ("That's a great way to put it!")
- Use simple language, avoid jargon
- Be encouraging but not sycophantic

CONVERSATION STYLE:
- Ask one question at a time
- React to their answers before asking more
- Share observations ("I'm noticing a theme here...")
- Use their words back to them
- Keep responses concise (2-3 sentences usually)

RULES:
- Never lecture or give unsolicited advice
- Don't make assumptions—ask if unclear
- If they seem stuck, offer options or examples
- Acknowledge when they share something personal
- Stay focused on building their brand foundation

CURRENT CONTEXT:
Business: {{businessName}}
Current focus: {{currentBucket}}
Progress: {{progressSummary}}`;

/**
 * Opening message to start the conversation.
 */
export const OPENING_MESSAGE = `Let's build your brand foundation together! 🎯

By the end of our conversation, you'll have clarity on who you are, who you serve, and how to talk about it.

First—what's your business called, and what does it do? Don't worry about being polished. Just tell me like you'd tell a friend.`;

/**
 * Short opening for returning users.
 */
export const RETURNING_USER_GREETING = `Welcome back! 👋

Last time we talked about {{lastTopic}}. Ready to pick up where we left off?`;

// ============================================
// 🔄 Transition Prompts
// ============================================

/** Transitions between buckets */
export const BUCKET_TRANSITIONS: Record<string, string> = {
  'basics_to_customers': `Great—I've got a solid picture of what {{businessName}} is.

Now I'm curious about who it's for. Tell me about your people.`,

  'customers_to_values': `I'm getting a clear picture of who you serve.

Let's talk about what you stand for—the beliefs behind the business.`,

  'values_to_voice': `Those are strong values! 💎

Now let's figure out how they show up in how you communicate.`,

  'voice_to_positioning': `I can hear your brand's voice now. 🎤

Let's nail down what makes you different from everyone else.`,

  'positioning_to_vision': `Your positioning is coming together nicely.

If you're up for it, let's zoom out—where is this all headed?`,
};

/**
 * Get transition prompt between two buckets.
 */
export function getTransitionPrompt(
  fromBucket: string,
  toBucket: string,
  businessName: string
): string {
  const key = `${fromBucket}_to_${toBucket}`;
  const template = BUCKET_TRANSITIONS[key];
  if (!template) {
    return `Let's move on to talking about ${toBucket}.`;
  }
  return template.replace('{{businessName}}', businessName);
}

// ============================================
// 🆘 Recovery Prompts
// ============================================

/** When user seems stuck */
export const STUCK_PROMPT = `No pressure on this one—skip it for now and we can come back.

Want to try a different angle, or move on to something else?`;

/** When conversation goes off track */
export const TANGENT_PROMPT = `That's interesting context! Let me note that.

Coming back to what we were discussing—{{simpleQuestion}}`;

/** When user seems frustrated */
export const FRUSTRATION_PROMPT = `I hear you. Sometimes these questions are hard because you're too close to it.

Want me to show you what I've picked up so far? Sometimes seeing it helps.`;

// ============================================
// 💡 Inference Prompts
// ============================================

/** Template for showing an inference */
export const INFERENCE_REVEAL_PROMPT = `Here's what I'm picking up... 🔮

{{inferenceText}}

Does that feel right?`;

/** When inference is confirmed */
export const INFERENCE_CONFIRMED = `Perfect! I'll save that. ✓`;

/** When inference is rejected */
export const INFERENCE_REJECTED = `Got it—that's not quite it. Thanks for the correction!

Can you tell me more about how you'd describe it?`;

/** When inference is edited */
export const INFERENCE_EDITED = `Updated! Thanks for refining that. ✏️`;

// ============================================
// ✅ Completion Prompts
// ============================================

/** When a bucket is complete */
export const BUCKET_COMPLETE = `Nice work on {{bucketName}}! ✓

You've given me a lot to work with there.`;

/** When all required buckets are done */
export const FOUNDATION_READY = `🎉 Your brand foundation is taking shape!

We've covered the essentials. You can:
- Keep going to add more depth
- Check out what we've built so far
- Generate some outputs (one-liners, positioning statements, etc.)

What sounds good?`;

/** When session is complete */
export const SESSION_COMPLETE = `We did it! 🎊

Your brand foundation is ready. You now have clarity on:
- Who you serve and what they need
- What you stand for
- How you sound
- What makes you different

Head to your dashboard to see everything and generate outputs.`;

// ============================================
// 📝 Question Templates
// ============================================

/** Questions organized by field/bucket */
export const QUESTIONS: Record<string, string[]> = {
  // Basics
  business_name: [
    "What's your business called?",
  ],
  founder_background: [
    "What's your background? What led you to start this?",
    "Tell me a bit about yourself—what experiences shaped this idea?",
  ],

  // Customers
  customer_who: [
    "When you imagine your ideal customer—the one you love working with—who are they?",
    "Tell me about the people you serve. What's their life like?",
  ],
  customer_pain: [
    "What's the main problem your customers face that you solve?",
    "What frustrates your customers before they find you?",
  ],
  customer_desire: [
    "What does success look like for your customers?",
    "When your customers get what they want, how do they feel?",
  ],

  // Values
  values_beliefs: [
    "What do you believe about your industry that most people don't?",
    "What's a belief you have that shapes how you do business?",
  ],
  values_against: [
    "What frustrates you about how things are usually done in your space?",
    "What do you wish would change about your industry?",
  ],

  // Positioning
  differentiator: [
    "What makes you genuinely different? Not 'better'—different.",
    "What's true about your approach that competitors can't or won't say?",
  ],
  competition: [
    "When someone doesn't choose you, what do they do instead?",
    "Who else solves this problem? How are you different?",
  ],

  // Vision
  vision: [
    "If your business wildly succeeds, what's different in the world 10 years from now?",
    "What's the change you want to create?",
  ],
};

/**
 * Get a random question for a topic.
 */
export function getQuestion(topic: string): string {
  const options = QUESTIONS[topic];
  if (!options || options.length === 0) {
    return "Tell me more about that.";
  }
  return options[Math.floor(Math.random() * options.length)];
}
