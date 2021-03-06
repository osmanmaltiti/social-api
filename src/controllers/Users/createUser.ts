import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Request, Response } from 'express';
import { v4 } from 'uuid';
import { prisma } from '../..';
import { encryptPassword } from '../../helpers/encryption';
import { createSession } from '../../helpers/session';
import { User } from '../../mongoose/schema';

const createUser = async (req: Request, res: Response) => {
  const uid = v4();
  const { fullname, email, username, password, age, bio } = req.body;
  const splitName = String(username).split('').slice(0, 4);

  try {
    const encryptedPassword = encryptPassword(password);
    const createdUser = await prisma.user.create({
      data: {
        id: splitName.join('').toUpperCase() + '-' + uid,
        fullname,
        email,
        username,
        password: encryptedPassword,
        age,
        bio,
      },
    });

    const token = await createSession(email);
    const createNosqlUser = new User({
      uid: createdUser.id,
      followers: [],
      following: [],
    });
    await createNosqlUser.save();

    res.status(200).json({ status: 'Success', id: createdUser.id, token });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(401).json({
          status: 'Failed',
          message: error.meta?.target + ' already exists',
        });
      }
    }
  }
};
export default createUser;
