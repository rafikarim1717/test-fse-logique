import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Credential, Prisma } from '../generated/prisma/client.js';

const listInclude = {
  category: { select: { id: true, name: true } },
  group: { select: { id: true, name: true } },
} satisfies Prisma.CredentialInclude;

export type CredentialListItem = Prisma.CredentialGetPayload<{
  include: typeof listInclude;
  omit: { password: true };
}>;

interface FindManyParams {
  userId: number;
  page: number;
  limit: number;
  search?: string;
  groupId?: number;
  categoryId?: number;
}

@Injectable()
export class CredentialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: FindManyParams): Promise<[CredentialListItem[], number]> {
    const { userId, page, limit, search, groupId, categoryId } = params;

    const where: Prisma.CredentialWhereInput = {
      userId,
      deletedAt: null,
      ...(groupId && { groupId }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.$transaction([
      this.prisma.credential.findMany({
        where,
        include: listInclude,
        omit: { password: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.credential.count({ where }),
    ]);
  }

  findById(id: number, userId: number): Promise<Credential | null> {
    return this.prisma.credential.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  create(data: Prisma.CredentialUncheckedCreateInput): Promise<Credential> {
    return this.prisma.credential.create({ data });
  }

  update(id: number, data: Prisma.CredentialUncheckedUpdateInput): Promise<Credential> {
    return this.prisma.credential.update({ where: { id }, data });
  }

  softDelete(id: number): Promise<Credential> {
    return this.prisma.credential.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}