export type PersonaExample = {
  id: string;
  messageId: string;
  kind: "same" | "correction";
  prompt: string;
  response: string;
  reasons: string[];
  note: string;
  approved: true;
  createdAt: string;
};

export const MAX_PERSONA_EXAMPLES = 24;
export const MAX_INJECTED_PERSONA_EXAMPLES = 8;
