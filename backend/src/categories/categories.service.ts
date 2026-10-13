import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { paginate } from '../common/dto/paginated-result.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(userId: number, query: PaginationQueryDto) {
    const { page, limit, search } = query;
    const [data, total] = await this.categoriesRepository.findMany(
      userId,
      page,
      limit,
      search,
    );
    return paginate(data, total, page, limit);
  }

  async findOne(id: number, userId: number) {
    const category = await this.categoriesRepository.findById(id, userId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  create(userId: number, dto: CreateCategoryDto) {
    return this.categoriesRepository.create(userId, dto.name);
  }

  async update(id: number, userId: number, dto: UpdateCategoryDto) {
    await this.findOne(id, userId);
    return this.categoriesRepository.update(id, dto);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.categoriesRepository.softDelete(id);
    return { message: 'Category deleted' };
  }
}