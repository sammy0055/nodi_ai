// stripe.ts
import Stripe from 'stripe';
import { appConfig } from '../config';

export const stripe = new Stripe(appConfig.stripe.secretKey, {
  apiVersion: '2025-08-27.basil', // keep this updated
});
