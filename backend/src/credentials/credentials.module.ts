import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller.js';
import { CredentialsService } from './credentials.service.js';
import { CredentialsRepository } from './credentials.repository.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { GroupsModule } from '../groups/groups.module.js';

@Module({
  imports: [CategoriesModule, GroupsModule],
  controllers: [CredentialsController],
  providers: [CredentialsService, CredentialsRepository],
})
export class CredentialsModule {}