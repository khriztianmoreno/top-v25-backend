import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import {
  getAllUsers,
  getUserById,
  deleteUser,
  createUser,
} from "./user.services";
import log from '../../logger'
import { sendMailSendGrid, sendNodeMailer } from '../../utils/emails';

export async function handleAllGetUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    log.error(error)
    return res.status(500).json(error);
  }
}

export async function handleGetUser(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.profile);
  } catch(error) {
    log.error(error)
    return res.status(500).json(error);
  }
}

export async function handleCreateUser(req: Request, res: Response, next: NextFunction) {
  const data = req.body;
  const newUser = data
  try {
    const hash = crypto.createHash('sha256').update(data.email).digest('hex');

    newUser.passwordResetToken = hash;
    newUser.passwordResetExpires = Date.now() + 3_600_000 * 24; // 24 hours

    const user = await createUser(newUser);

    const msg = {
      to: user.email,
      from: `'No reply 💻' <cristian.moreno@makeitreal.camp>`,
      subject: 'Activate your account',
      templateId: 'd-649011f35b854690a0e5f47de11eb2f2',
      dynamic_template_data: {
        firstName: user.firstName,
        lastName: user.lastName,
        url: `${process.env.FRONTEND_URL}/activate/${hash}`, // URL del frontend
      },
    }

    await sendMailSendGrid(msg)

    return res.status(201).json(user);
  } catch (error: any) {
    log.error(error)
    return res.status(500).json(error.message);
  }
}

export async function handleUpdateUser(req: Request, res: Response, next: NextFunction) {}

export async function handleDeleteUser(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  try {
    await deleteUser(id);

    return res.status(200).json({ message: "User deleted" });
  } catch(error) {
    log.error(error)
    return res.status(500).json(error);
  }
}
