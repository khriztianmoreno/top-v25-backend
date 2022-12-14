import { Router } from 'express';

import { isAuthenticated } from '../../auth/auth.services';
import { handlerPayment } from './payment.controller';

const router = Router();

router.post('/', isAuthenticated, handlerPayment);

export default router;
