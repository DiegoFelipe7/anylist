import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { InjectRepository } from "@nestjs/typeorm"
import { ILike, Repository } from "typeorm"
import { Item } from './entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs } from 'src/common/dto/args/pagination.arg';
import { SearchArg } from 'src/common/dto/args/search.arg';
@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private readonly itemsRepository: Repository<Item>) {

  }
  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user })
    return await this.itemsRepository.save(newItem);
  }

  async findAll(user: User, paginationArg: PaginationArgs, serchArg: SearchArg): Promise<Item[]> {
    const { limit, offset } = paginationArg;
    const { search } = serchArg;
    const queryBuilder = this.itemsRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId"=:userId`, { userId: user.id });
    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', { name: `%${search.toLowerCase()}%` });
    }
    return queryBuilder.getMany();
    /* return this.itemsRepository.find({
      where: {
        user: {
          id: user.id
        },
        name: ILike(`%${search.search}%`)
      },

      take: paginationArg.limit,
      skip: paginationArg.offset
    }); */
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = this.itemsRepository.findOneBy({
      id: id,
      user: {
        id: user.id
      }
    })
    if (!item) throw new NotFoundException(`Item with id ${id} not found`)
    return await item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {
    await this.findOne(id, user)
    const item = await this.itemsRepository.preload(updateItemInput)
    if (!item) throw new NotFoundException(`Item with id ${id} not found`)
    return await this.itemsRepository.save(item);

  }

  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user)
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }
  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id
        }
      }
    })
  }

}
