import { Request } from 'express';
import { User } from './users/entities/user.entity';

export const getReqUser = (req: Request): User | null => {
  let user: User = null;

  // @ts-ignore
  if (req.user.hasOwnProperty('fullUser')) {
    // @ts-ignore
    user = req.user['fullUser'];
  }

  return user;
};