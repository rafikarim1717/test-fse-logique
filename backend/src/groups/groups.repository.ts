import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CredentialGroup, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    userId: number,
    page: number,
    limit: number,
    search?: string,
  ): Promise<[CredentialGroup[], number]> {
    const where: Prisma.CredentialGroupWhereInput = {
      userId,
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    return this.prisma.$transaction([
      this.prisma.credentialGroup.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.credentialGroup.count({ where }),
    ]);
  }

  findAllByUser(userId: number): Promise<CredentialGroup[]> {
    return this.prisma.credentialGroup.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: number, userId: number): Promise<CredentialGroup | null> {
    return this.prisma.credentialGroup.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  countChildren(id: number): Promise<number> {
    return this.prisma.credentialGroup.count({
      where: { parentId: id, deletedAt: null },
    });
  }

  create(
    userId: number,
    data: { name: string; parentId?: number },
  ): Promise<CredentialGroup> {
    return this.prisma.credentialGroup.create({
      data: { ...data, userId },
    });
  }

  update(
    id: number,
    data: { name?: string; parentId?: number },
  ): Promise<CredentialGroup> {
    return this.prisma.credentialGroup.update({ where: { id }, data });
  }

  softDelete(id: number): Promise<CredentialGroup> {
    return this.prisma.credentialGroup.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}