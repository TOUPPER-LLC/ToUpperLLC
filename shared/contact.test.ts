import { describe, expect, it } from 'vitest';
import { isLikelyBot, LIMITS, MIN_FILL_MS, normalizeContact, validateContact, type ContactInput } from './contact';

const valid: ContactInput = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@doe.com',
  message: 'Hello there',
};

describe('validateContact', () => {
  it('accepts a valid submission', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('requires every field', () => {
    const errors = validateContact({ firstName: '', lastName: '', email: '', message: '' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'firstName', 'lastName', 'message']);
  });

  it('trims and treats whitespace as empty', () => {
    const input = normalizeContact({ ...valid, firstName: '   ', message: '\n\t ' });
    expect(validateContact(input)).toHaveProperty('firstName');
    expect(validateContact(input)).toHaveProperty('message');
  });

  it('enforces length limits', () => {
    expect(validateContact({ ...valid, firstName: 'a'.repeat(LIMITS.name + 1) })).toHaveProperty('firstName');
    expect(validateContact({ ...valid, lastName: 'a'.repeat(LIMITS.name + 1) })).toHaveProperty('lastName');
    expect(validateContact({ ...valid, email: `${'a'.repeat(LIMITS.email - 5)}@x.co` + 'm' })).toHaveProperty('email');
    expect(validateContact({ ...valid, message: 'a'.repeat(LIMITS.message + 1) })).toHaveProperty('message');
  });

  it('accepts values exactly at the limits', () => {
    expect(
      validateContact({
        firstName: 'a'.repeat(LIMITS.name),
        lastName: 'a'.repeat(LIMITS.name),
        email: `${'a'.repeat(LIMITS.email - 5)}@x.co`,
        message: 'a'.repeat(LIMITS.message),
      }),
    ).toEqual({});
  });

  it('rejects invalid email', () => {
    for (const email of ['jane', 'jane@', 'jane@x', 'jane doe@x.com', '@x.com']) {
      expect(validateContact({ ...valid, email }), email).toHaveProperty('email');
    }
    expect(validateContact({ ...valid, email: 'jane@doe.com' })).toEqual({});
  });

  it('rejects control characters in names', () => {
    expect(validateContact({ ...valid, firstName: 'Jane\r\nBcc: x@y.com' })).toHaveProperty('firstName');
    expect(validateContact({ ...valid, lastName: 'Doe\u0000' })).toHaveProperty('lastName');
  });

  it('allows line breaks in the message', () => {
    expect(validateContact({ ...valid, message: 'Line one\nLine two' })).toEqual({});
  });
});

describe('normalizeContact', () => {
  it('trims every field', () => {
    expect(normalizeContact({ firstName: ' Jane ', lastName: ' Doe', email: 'jane@doe.com ', message: ' hi ', company: ' ' })).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@doe.com',
      message: 'hi',
      company: '',
    });
  });

  it('ignores non-string values', () => {
    const input = normalizeContact({ firstName: 5, lastName: null, email: {}, message: ['x'] });
    expect(input).toEqual({ firstName: '', lastName: '', email: '', message: '', company: '' });
  });

  it('handles non-object input', () => {
    expect(normalizeContact(null)).toEqual({ firstName: '', lastName: '', email: '', message: '', company: '' });
    expect(normalizeContact('hello')).toEqual({ firstName: '', lastName: '', email: '', message: '', company: '' });
  });
});

describe('isLikelyBot', () => {
  it('flags a filled honeypot', () => {
    expect(isLikelyBot({ ...valid, company: 'Acme' }, MIN_FILL_MS + 1)).toBe(true);
  });

  it('flags submissions faster than a person can type', () => {
    expect(isLikelyBot(valid, MIN_FILL_MS - 1)).toBe(true);
  });

  it('flags submissions without a fill time', () => {
    expect(isLikelyBot(valid, undefined)).toBe(true);
    expect(isLikelyBot(valid, Number.NaN)).toBe(true);
  });

  it('allows a normal submission', () => {
    expect(isLikelyBot(valid, MIN_FILL_MS)).toBe(false);
  });
});
