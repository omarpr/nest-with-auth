import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.email) {
      throw new BadRequestException('email is required');
    }

    if (!createUserDto.firstName) {
      throw new BadRequestException('firstName is required');
    }

    if (!createUserDto.lastName) {
      throw new BadRequestException('lastName is required');
    }

    if (!createUserDto.password) {
      throw new BadRequestException('password is required');
    }

    const create = await this.usersService.create(createUserDto);

    if (!create) {
      throw new ConflictException();
    }

    const id = create.identifiers.pop().id;
    const user = await this.usersService.findOne(id);

    return { ...user, password: undefined };
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
