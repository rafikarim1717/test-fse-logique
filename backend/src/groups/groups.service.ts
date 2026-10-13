import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupsRepository } from './groups.repository.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { paginate } from '../common/dto/paginated-result.js';

export interface GroupTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  children: GroupTreeNode[];
}

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async findAll(userId: number, query: PaginationQueryDto) {
    const { page, limit, search } = query;
    const [data, total] = await this.groupsRepository.findMany(
      userId,
      page,
      limit,
      search,
    );
    return paginate(data, total, page, limit);
  }

  async findTree(userId: number): Promise<GroupTreeNode[]> {
    const groups = await this.groupsRepository.findAllByUser(userId);

    const nodeMap = new Map<number, GroupTreeNode>();
    for (const group of groups) {
      nodeMap.set(group.id, {
        id: group.id,
        name: group.name,
        parentId: group.parentId,
        children: [],
      });
    }

    const roots: GroupTreeNode[] = [];
    for (const node of nodeMap.values()) {
      const parent = node.parentId ? nodeMap.get(node.parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async findOne(id: number, userId: number) {
    const group = await this.groupsRepository.findById(id, userId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async create(userId: number, dto: CreateGroupDto) {
    if (dto.parentId) {
      await this.findOne(dto.parentId, userId);
    }
    return this.groupsRepository.create(userId, dto);
  }

  async update(id: number, userId: number, dto: UpdateGroupDto) {
    await this.findOne(id, userId);
    if (dto.parentId) {
      await this.ensureNoCycle(id, dto.parentId, userId);
    }
    return this.groupsRepository.update(id, dto);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    const childCount = await this.groupsRepository.countChildren(id);
    if (childCount > 0) {
      throw new ConflictException('Delete or move its sub-groups first');
    }
    await this.groupsRepository.softDelete(id);
    return { message: 'Group deleted' };
  }

  private async ensureNoCycle(id: number, newParentId: number, userId: number) {
    let currentId: number | null = newParentId;
    while (currentId) {
      if (currentId === id) {
        throw new BadRequestException('A group cannot be moved under itself');
      }
      const current = await this.findOne(currentId, userId);
      currentId = current.parentId;
    }
  }
}