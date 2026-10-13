import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service.js';
import { CreateCredentialDto } from './dto/create-credential.dto.js';
import { UpdateCredentialDto } from './dto/update-credential.dto.js';
import { CredentialQueryDto } from './dto/credential-query.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-auth.guard.js';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: CredentialQueryDto) {
    return this.credentialsService.findAll(user.sub, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
    return this.credentialsService.findOne(id, user.sub);
  }

  @Get(':id/reveal')
  reveal(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
    return this.credentialsService.reveal(id, user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCredentialDto) {
    return this.credentialsService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialDto,
  ) {
    return this.credentialsService.update(id, user.sub, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
    return this.credentialsService.remove(id, user.sub);
  }
}