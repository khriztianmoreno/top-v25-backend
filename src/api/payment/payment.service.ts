import Stripe from 'stripe';
import { DocumentDefinition, FilterQuery } from "mongoose"

import Payment, { PaymentDocument } from './payment.model';
import { UserDocument } from '../user/user.model';
import { makePaymentType } from './payment.types';
import log from '../../logger';

const apiKey = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(apiKey, {apiVersion: '2022-11-15'});

/**
 * Create a new customer
 * @param {Obj} user Info
 * @param {Obj} paymentMethod Method payment
 * @returns Promise
 */
export async function createCustomer(user: UserDocument, paymentMethod: Stripe.PaymentMethod) {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      payment_method: paymentMethod.id,
    });

    return {...customer, email: user.email};
  } catch (error) {
    log.error(error)
    throw error;
  }
}

export async function retrieveCustomer(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId);

  return customer;
}

export async function makePayment({ paymentMethod, amount, customer }: makePaymentType) {
  const { id } = paymentMethod;

  try {
    const payment = await stripe.paymentIntents.create({
      payment_method: id,
      amount,
      currency: 'usd',
      confirm: true,
      description: 'Pago desde la api',
      customer: customer.id,
      receipt_email: customer.email,
    });

    return payment;
  } catch (error) {
    log.error(error)
    throw error;
  }
}

export function createPayment(
  payment: DocumentDefinition<Omit<PaymentDocument, 'createdAt' | 'updatedAt'>>
) {
  return Payment.create(payment);
}
