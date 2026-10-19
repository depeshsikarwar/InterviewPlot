/**
 * Sanitization and prompt injection defense utilities
 */

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip unprintable control characters
    .trim();
}

/**
 * Wraps user-supplied content (such as resumes, interview answers, code comments)
 * in safe delimiter tags so the LLM treats it strictly as data, never as system instructions.
 */
export function wrapInUntrustedDataFence(name: string, content: string): string {
  const sanitized = sanitizeInput(content);
  return `\n<UNTRUSTED_${name.toUpperCase()}_DATA>\n${sanitized}\n</UNTRUSTED_${name.toUpperCase()}_DATA>\n`;
}

/**
 * Checks for obvious prompt injection patterns in user content.
 */
export function containsPromptInjectionAttempt(text: string): boolean {
  const dangerousPatterns = [
    /ignore (all )?previous instructions/i,
    /disregard (all )?prior (prompts|instructions)/i,
    /you are now in (developer|dan|jailbreak) mode/i,
    /override system prompt/i,
    /reveal your (system )?instructions/i,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(text));
}
