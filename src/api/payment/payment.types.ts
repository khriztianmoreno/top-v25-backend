import Stripe from 'stripe';

export interface customerType extends Stripe.Customer {
  email: string;
}

export type makePaymentType = {
  paymentMethod: { id: string };
  amount: number;
  // customer: Stripe.Customer;
  customer: customerType;
}
