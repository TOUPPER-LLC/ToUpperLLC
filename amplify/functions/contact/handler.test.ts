// @vitest-environment node
import type { LambdaFunctionURLEvent } from 'aws-lambda';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LIMITS } from '../../../shared/contact';

const send = vi.fn();
vi.mock('@aws-sdk/client-sesv2', () => ({
  SESv2Client: class {
    send = send;
  },
  SendEmailCommand: class {
    constructor(public input: unknown) {}
  },
}));

const publish = vi.fn();
vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: class {
    send = publish;
  },
  PublishCommand: class {
    constructor(public input: unknown) {}
  },
}));

const { handler } = await import('./handler');

const valid = { firstName: 'Jane', lastName: 'Doe', email: 'jane@doe.com', message: 'Hello there', company: '', elapsedMs: 8000 };

function event(overrides: Partial<{ method: string; body: string; isBase64Encoded: boolean }> = {}): LambdaFunctionURLEvent {
  return {
    requestContext: { http: { method: overrides.method ?? 'POST' } },
    body: overrides.body ?? JSON.stringify(valid),
    isBase64Encoded: overrides.isBase64Encoded ?? false,
    headers: {},
  } as unknown as LambdaFunctionURLEvent;
}

type SentEmail = {
  FromEmailAddress: string;
  Destination: { ToAddresses: string[] };
  ReplyToAddresses: string[];
  Content: { Simple: { Subject: { Data: string }; Body: { Text: { Data: string } } } };
};
const sentInput = () => (send.mock.calls[0][0] as { input: SentEmail }).input;

beforeEach(() => {
  vi.stubEnv('CONTACT_FROM_EMAIL', 'from@example.com');
  vi.stubEnv('CONTACT_TO_EMAIL', 'to@example.com');
  send.mockResolvedValue({ MessageId: 'abc' });
  publish.mockResolvedValue({ MessageId: 'sns-1' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  send.mockReset();
  publish.mockReset();
});

describe('contact handler', () => {
  it('sends a valid message', async () => {
    const res = await handler(event());

    expect(res.statusCode).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    const input = sentInput();
    expect(input.FromEmailAddress).toBe('from@example.com');
    expect(input.Destination.ToAddresses).toEqual(['to@example.com']);
    expect(input.ReplyToAddresses).toEqual(['jane@doe.com']);
    expect(input.Content.Simple.Subject.Data).toBe('New contact form message from Jane Doe');
    const body: string = input.Content.Simple.Body.Text.Data;
    expect(body).toContain('Jane Doe');
    expect(body).toContain('jane@doe.com');
    expect(body).toContain('Hello there');
  });

  it('rejects non-POST', async () => {
    const res = await handler(event({ method: 'GET' }));
    expect(res.statusCode).toBe(405);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON', async () => {
    const res = await handler(event({ body: '{' }));
    expect(res.statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a missing body', async () => {
    const res = await handler({ ...event(), body: undefined });
    expect(res.statusCode).toBe(400);
  });

  it('rejects oversized bodies', async () => {
    const res = await handler(event({ body: 'x'.repeat(LIMITS.bodyBytes + 1) }));
    expect(res.statusCode).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it('returns field errors', async () => {
    const res = await handler(event({ body: JSON.stringify({ ...valid, email: '' }) }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body as string).errors).toHaveProperty('email');
    expect(send).not.toHaveBeenCalled();
  });

  it('drops honeypot submissions', async () => {
    const res = await handler(event({ body: JSON.stringify({ ...valid, company: 'Acme' }) }));
    expect(res.statusCode).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('drops submissions made too quickly', async () => {
    const res = await handler(event({ body: JSON.stringify({ ...valid, elapsedMs: 500 }) }));
    expect(res.statusCode).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('drops submissions without a fill time', async () => {
    const { elapsedMs: _omit, ...rest } = valid;
    void _omit;
    const res = await handler(event({ body: JSON.stringify(rest) }));
    expect(res.statusCode).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('decodes base64 bodies', async () => {
    const body = Buffer.from(JSON.stringify(valid)).toString('base64');
    const res = await handler(event({ body, isBase64Encoded: true }));
    expect(res.statusCode).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('returns 502 when SES fails', async () => {
    send.mockRejectedValue(new Error('MessageRejected: Email address is not verified'));
    const res = await handler(event());
    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body as string)).toEqual({ error: 'Unable to send message' });
  });

  it('returns 500 when env is missing', async () => {
    vi.stubEnv('CONTACT_TO_EMAIL', '');
    const res = await handler(event());
    expect(res.statusCode).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('contact handler without a sender address (SNS mode)', () => {
  const TOPIC = 'arn:aws:sns:us-east-1:123456789012:contact';
  type Published = { TopicArn: string; Subject: string; Message: string };
  const publishedInput = () => (publish.mock.calls[0][0] as { input: Published }).input;

  beforeEach(() => {
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    vi.stubEnv('CONTACT_TOPIC_ARN', TOPIC);
  });

  it('publishes the message to the SNS topic instead of SES', async () => {
    const res = await handler(event());

    expect(res.statusCode).toBe(200);
    expect(send).not.toHaveBeenCalled();
    expect(publish).toHaveBeenCalledTimes(1);
    const input = publishedInput();
    expect(input.TopicArn).toBe(TOPIC);
    expect(input.Subject).toBe('New contact form message from Jane Doe');
    expect(input.Message).toContain('Jane Doe');
    expect(input.Message).toContain('jane@doe.com');
    expect(input.Message).toContain('Hello there');
  });

  it('caps the SNS subject at 100 characters', async () => {
    const long = 'A'.repeat(LIMITS.name);
    await handler(event({ body: JSON.stringify({ ...valid, firstName: long, lastName: long }) }));
    expect(publishedInput().Subject.length).toBeLessThanOrEqual(100);
  });

  it('returns 502 when SNS fails', async () => {
    publish.mockRejectedValue(new Error('AuthorizationError'));
    const res = await handler(event());
    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.body as string)).toEqual({ error: 'Unable to send message' });
  });

  it('returns 500 when neither a sender nor a topic is configured', async () => {
    vi.stubEnv('CONTACT_TOPIC_ARN', '');
    const res = await handler(event());
    expect(res.statusCode).toBe(500);
    expect(publish).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('prefers SES when a sender address is configured', async () => {
    vi.stubEnv('CONTACT_FROM_EMAIL', 'from@example.com');
    await handler(event());
    expect(send).toHaveBeenCalledTimes(1);
    expect(publish).not.toHaveBeenCalled();
  });
});
