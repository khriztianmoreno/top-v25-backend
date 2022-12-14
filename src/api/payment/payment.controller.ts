import { Response } from 'express';
import Stripe from 'stripe';

import { AuthRequest } from '../../auth/auth.types';
import { UserDocument } from '../user/user.model';
import { updateUser } from '../user/user.services';
import { createCustomer, createPayment, makePayment, retrieveCustomer } from './payment.service';
import { customerType } from './payment.types';

export async function handlerPayment(req: AuthRequest, res: Response) {
  const user = req.user as UserDocument;
  const { paymentMethod, amount } = req.body;

  try {
    const { id, card } = paymentMethod;

    let customer = { email: user.email } as customerType;

    if (!user?.payment?.customerId) {
      customer = await createCustomer(user, paymentMethod);

      const userToUpdate = {
        payment: {
          customerId: customer.id,
          cards: [{
            paymentMethodId: id,
            brand: card.brand,
            country: card.country,
            expMonth: card.exp_month,
            expYear: card.exp_year,
            funding: card.funding,
            last4: card.last4,
          }],
        },
      };

      await updateUser(user._id, userToUpdate);
    }

    const paymentCard = { id: ''}

    if (user?.payment?.customerId) {
      const customerRetrieved = await retrieveCustomer(user.payment.customerId) as customerType;
      customer = {
        ...customerRetrieved,
        email: user.email,
      }

      paymentCard.id = user.payment.cards[0].paymentMethodId
    }

    const payment = await makePayment({ paymentMethod: paymentCard, amount, customer });

    // save payment to db
    const registerPayment = {
      refId: payment.id,
      description: payment.description as string,
      value: payment.amount,
      currency: payment.currency,
      userId: user._id,
    };

    await createPayment(registerPayment);

    return res.json(payment);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}
