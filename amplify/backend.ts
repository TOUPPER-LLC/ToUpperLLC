import { defineBackend } from '@aws-amplify/backend';
import { Duration, Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { type CfnFunction, type Function as LambdaFunction, FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
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

const from = process.env.CONTACT_FROM_EMAIL ?? '';
const to = process.env.CONTACT_TO_EMAIL ?? '';

if (from) {
  // SES mode: allow sending only as the configured identity (the address and its domain).
  fn.addToRolePolicy(
    new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: [from, from.split('@')[1]]
        .filter(Boolean)
        .map((identity) => `arn:aws:ses:${region}:${account}:identity/${identity}`),
    }),
  );
} else if (to) {
  // SNS mode (no sender domain yet): AWS emails CONTACT_TO_EMAIL from its own address.
  // The inbox receives a one-time "AWS Notification - Subscription Confirmation" email to accept.
  const topic = new Topic(Stack.of(fn), 'ContactMessages', { displayName: 'ToUpper contact form' });
  topic.addSubscription(new EmailSubscription(to));
  topic.grantPublish(fn);
  (fn as LambdaFunction).addEnvironment('CONTACT_TOPIC_ARN', topic.topicArn);
}

backend.addOutput({ custom: { contactUrl: functionUrl.url } });
