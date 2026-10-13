import { Injectable, NotFoundException } from '@nestjs/common';
import { CredentialsRepository } from './credentials.repository.js';
import { EncryptionService } from '../encryption/encryption.service.js';
import { CategoriesService } from '../categories/categories.service.js';
import { GroupsService } from '../groups/groups.service.js';
import { CreateCredentialDto } from './dto/create-credential.dto.js';
import { UpdateCredentialDto } from './dto/update-credential.dto.js';
import { CredentialQueryDto } from './dto/credential-query.dto.js';
import { paginate } from '../common/dto/paginated-result.js';
import { Credential } from '../generated/prisma/client.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository,
    private readonly encryptionService: EncryptionService,
    private readonly categoriesService: CategoriesService,
    private readonly groupsService: GroupsService,
  ) {}

  async findAll(userId: number, query: CredentialQueryDto) {
    const { page, limit, search, groupId, categoryId } = query;
    const [data, total] = await this.credentialsRepository.findMany({
      userId,
      page,
      limit,
      search,
      groupId,
      categoryId,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(id: number, userId: number) {
    const credential = await this.getOwnedOrFail(id, userId);
    return this.hidePassword(credential);
  }

  async reveal(id: number, userId: number) {
    const credential = await this.getOwnedOrFail(id, userId);
    return { password: this.encryptionService.decrypt(credential.password) };
  }

  async create(userId: number, dto: CreateCredentialDto) {
    await this.categoriesService.findOne(dto.categoryId, userId);
    await this.groupsService.findOne(dto.groupId, userId);

    const credential = await this.credentialsRepository.create({
      ...dto,
      password: this.encryptionService.encrypt(dto.password),
      userId,
    });
    return this.hidePassword(credential);
  }

  async update(id: number, userId: number, dto: UpdateCredentialDto) {
    await this.getOwnedOrFail(id, userId);
    if (dto.categoryId) await this.categoriesService.findOne(dto.categoryId, userId);
    if (dto.groupId) await this.groupsService.findOne(dto.groupId, userId);

    const credential = await this.credentialsRepository.update(id, {
      ...dto,
      ...(dto.password && {
        password: this.encryptionService.encrypt(dto.password),
      }),
    });
    return this.hidePassword(credential);
  }

  async remove(id: number, userId: number) {
    await this.getOwnedOrFail(id, userId);
    await this.credentialsRepository.softDelete(id);
    return { message: 'Credential deleted' };
  }

  private async getOwnedOrFail(id: number, userId: number): Promise<Credential> {
    const credential = await this.credentialsRepository.findById(id, userId);
    if (!credential) {
      throw new NotFoundException('Credential not found');
    }
    return credential;
  }

  private hidePassword(credential: Credential): Omit<Credential, 'password'> {
    const { password: _password, ...rest } = credential;
    return rest;
  }
}