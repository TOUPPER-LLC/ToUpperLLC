import { defineFunction } from '@aws-amplify/backend';

export const contact = defineFunction({
  name: 'contact',
  entry: './handler.ts',
  runtime: 24,
  timeoutSeconds: 10,
  memoryMB: 256,
  // Set these in the Amplify console (Hosting > Environment variables); they are read at deploy time.
  environment: {
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL ?? '',
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL ?? '',
  },
});
