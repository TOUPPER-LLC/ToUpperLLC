import { defineBackend } from '@aws-amplify/backend';
import { Duration, Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { type CfnFunction, FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { contact } from './functions/contact/resource';

const backend = defineBackend({ contact });

const fn = backend.contact.resources.lambda;
const { region, account } = Stack.of(fn);

// Public HTTPS endpoint for the form. Browsers may only call it from the site's own origins.
const allowedOrigins = (process.env.CONTACT_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const functionUrl = fn.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : ['*'],
    allowedMethods: [HttpMethod.POST],
    allowedHeaders: ['content-type'],
    maxAge: Duration.hours(1),
  },
});

// Cap concurrent executions so a flood of requests can't run up cost or SES volume.
(fn.node.defaultChild as CfnFunction).reservedConcurrentExecutions = 2;

// Allow sending only as the configured identity (the address and its domain).
const from = process.env.CONTACT_FROM_EMAIL ?? '';
const identities = from ? [from, from.split('@')[1]].filter(Boolean) : ['*'];
fn.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail'],
    resources: identities.map((identity) => `arn:aws:ses:${region}:${account}:identity/${identity}`),
  }),
);

backend.addOutput({ custom: { contactUrl: functionUrl.url } });
