import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CredentialCategory, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    userId: number,
    page: number,
    limit: number,
    search?: string,
  ): Promise<[CredentialCategory[], number]> {
    const where: Prisma.CredentialCategoryWhereInput = {
      userId,
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    return this.prisma.$transaction([
      this.prisma.credentialCategory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.credentialCategory.count({ where }),
    ]);
  }

  findById(id: number, userId: number): Promise<CredentialCategory | null> {
    return this.prisma.credentialCategory.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  create(userId: number, name: string): Promise<CredentialCategory> {
    return this.prisma.credentialCategory.create({
      data: { name, userId },
    });
  }

  update(id: number, data: Prisma.CredentialCategoryUpdateInput): Promise<CredentialCategory> {
    return this.prisma.credentialCategory.update({ where: { id }, data });
  }

  softDelete(id: number): Promise<CredentialCategory> {
    return this.prisma.credentialCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}