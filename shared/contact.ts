/**
 * Contact form rules shared by the browser form and the contact Lambda,
 * so both sides always agree on what a valid submission is.
 */

export type ContactInput = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  /** Honeypot: hidden from people, so any value means a bot filled the form. */
  company?: string;
};

export type ContactField = 'firstName' | 'lastName' | 'email' | 'message';
export type ContactErrors = Partial<Record<ContactField, string>>;

export const LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
  /** Maximum accepted request body size in bytes. */
  bodyBytes: 10_240,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Names end up in the email subject; control characters (CR/LF especially) are never legitimate there.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Coerces untrusted input (form state or a parsed request body) into trimmed strings. */
export function normalizeContact(raw: unknown): ContactInput {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    firstName: str(r.firstName),
    lastName: str(r.lastName),
    email: str(r.email),
    message: str(r.message),
    company: str(r.company),
  };
}

function validateName(value: string, label: string): string | undefined {
  if (!value) return `Please enter your ${label}.`;
  if (value.length > LIMITS.name) return `Your ${label} must be ${LIMITS.name} characters or fewer.`;
  if (CONTROL_CHARS.test(value)) return `Your ${label} contains invalid characters.`;
  return undefined;
}

/** Returns an error message per invalid field; an empty object means the input is valid. */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  const firstName = validateName(input.firstName.trim(), 'first name');
  if (firstName) errors.firstName = firstName;

  const lastName = validateName(input.lastName.trim(), 'last name');
  if (lastName) errors.lastName = lastName;

  const email = input.email.trim();
  if (!email || email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  const message = input.message.trim();
  if (!message) errors.message = 'Please enter a message.';
  else if (message.length > LIMITS.message) errors.message = `Your message must be ${LIMITS.message} characters or fewer.`;

  return errors;
}

/** People need at least this long to fill in the form; scripts post instantly. */
export const MIN_FILL_MS = 3000;

/**
 * Bot heuristics: the hidden honeypot field is filled, or the form was submitted faster
 * than a person could type (or without the fill time the real form always sends).
 */
export function isLikelyBot(input: ContactInput, elapsedMs: number | undefined): boolean {
  if (input.company) return true;
  if (typeof elapsedMs !== 'number' || !Number.isFinite(elapsedMs)) return true;
  return elapsedMs < MIN_FILL_MS;
}
