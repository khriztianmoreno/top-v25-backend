import { Application } from 'express';

import authLocal from './auth/local';
import user from './api/user';
import product from './api/product';
import healthcheck from './api/healthcheck';
import payment from './api/payment';

function routes(app: Application): void {
  app.use('/api/users', user);
  app.use('/api/products', product);
  app.use('/api/healthcheck', healthcheck);
  app.use('/api/payments', payment);

  // auth routes
  app.use('/auth/local', authLocal);
  // app.use('/auth/facebook', authFacebook);
  // app.use('/auth/google', authGoogle);
  // app.use('/auth/twitter', authTwitter);
  // app.use('/auth/github', authGithub);
}

export default routes;
