import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import type { APIGatewayProxyStructuredResultV2 as FunctionUrlResult, LambdaFunctionURLEvent } from 'aws-lambda';
import { isLikelyBot, LIMITS, normalizeContact, validateContact, type ContactInput } from '../../../shared/contact';

const ses = new SESv2Client({});

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

/**
 * Contact form endpoint behind a Lambda Function URL.
 * CORS is configured on the Function URL itself (see amplify/backend.ts).
 */
export async function handler(event: LambdaFunctionURLEvent): Promise<FunctionUrlResult> {
  if (event.requestContext.http.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!from || !to) {
    console.error('Contact function is missing CONTACT_FROM_EMAIL or CONTACT_TO_EMAIL');
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
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [to] },
        ReplyToAddresses: [input.email],
        Content: {
          Simple: {
            Subject: { Data: `New contact form message from ${input.firstName} ${input.lastName}`, Charset: 'UTF-8' },
            Body: { Text: { Data: emailText(input), Charset: 'UTF-8' } },
          },
        },
      }),
    );
  } catch (error) {
    console.error('SES SendEmail failed', error);
    return json(502, { error: 'Unable to send message' });
  }

  return json(200, { ok: true });
}
