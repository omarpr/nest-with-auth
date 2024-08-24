import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { getReqUser } from './utils';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Get()
  getHello(@Req() req: Request): string {
    const user = getReqUser(req);

    return `Hello ${user.firstName} ${user.lastName}!`;
  }
}
