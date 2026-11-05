import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type { APIGatewayProxyStructuredResultV2 as FunctionUrlResult, LambdaFunctionURLEvent } from 'aws-lambda';
import { isLikelyBot, LIMITS, normalizeContact, validateContact, type ContactInput } from '../../../shared/contact';

const ses = new SESv2Client({});
const sns = new SNSClient({});

/** SNS email subjects are limited to 100 characters. */
const SNS_SUBJECT_MAX = 100;

function json(statusCode: number, body: unknown): FunctionUrlResult {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

function emailText(input: ContactInput): string {
  return [
    `Name: ${input.firstName} ${input.lastName}`,
    `Email: ${input.email}`,
    '',
    input.message,
    '',
    '— Sent from the ToUpper LLC website contact form',
  ].join('\n');
}

type Delivery = { kind: 'ses'; from: string; to: string } | { kind: 'sns'; topicArn: string };

/**
 * How messages are delivered:
 * - SES when CONTACT_FROM_EMAIL (a verified sender on your domain) is set: a normal email with Reply-To.
 * - Otherwise SNS (CONTACT_TOPIC_ARN, created by the backend) emails CONTACT_TO_EMAIL from AWS's
 *   own address, which needs no domain; reply by copying the visitor's address from the message.
 */
function deliveryFromEnv(): Delivery | undefined {
  const { CONTACT_FROM_EMAIL: from, CONTACT_TO_EMAIL: to, CONTACT_TOPIC_ARN: topicArn } = process.env;
  if (from) return to ? { kind: 'ses', from, to } : undefined;
  return topicArn ? { kind: 'sns', topicArn } : undefined;
}

async function deliver(delivery: Delivery, input: ContactInput): Promise<void> {
  const subject = `New contact form message from ${input.firstName} ${input.lastName}`;
  const text = emailText(input);

  if (delivery.kind === 'sns') {
    await sns.send(
      new PublishCommand({ TopicArn: delivery.topicArn, Subject: subject.slice(0, SNS_SUBJECT_MAX), Message: text }),
    );
    return;
  }

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: delivery.from,
      Destination: { ToAddresses: [delivery.to] },
      ReplyToAddresses: [input.email],
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: { Text: { Data: text, Charset: 'UTF-8' } },
        },
      },
    }),
  );
}

/**
 * Contact form endpoint behind a Lambda Function URL.
 * CORS is configured on the Function URL itself (see amplify/backend.ts).
 */
export async function handler(event: LambdaFunctionURLEvent): Promise<FunctionUrlResult> {
  if (event.requestContext.http.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const delivery = deliveryFromEnv();
  if (!delivery) {
    console.error('Contact function needs CONTACT_FROM_EMAIL + CONTACT_TO_EMAIL (SES) or CONTACT_TOPIC_ARN (SNS)');
    return json(500, { error: 'Contact form is not configured' });
  }

  if (!event.body) return json(400, { error: 'Missing request body' });
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body, 'utf8');
  if (raw.byteLength > LIMITS.bodyBytes) return json(413, { error: 'Request body too large' });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString('utf8'));
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const input = normalizeContact(parsed);
  const elapsedMs = (parsed as { elapsedMs?: unknown } | null)?.elapsedMs;
  // Answer bots with a normal success so they have no signal to adapt to; nothing is sent.
  if (isLikelyBot(input, typeof elapsedMs === 'number' ? elapsedMs : undefined)) return json(200, { ok: true });

  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) return json(400, { errors });

  try {
    await deliver(delivery, input);
  } catch (error) {
    console.error(`Sending via ${delivery.kind.toUpperCase()} failed`, error);
    return json(502, { error: 'Unable to send message' });
  }

  return json(200, { ok: true });
}
