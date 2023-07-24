import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {
    private state: boolean;
    constructor(private userService: UsersService, private readonly itemService: ItemsService, @InjectRepository(Item) private readonly itemRepository: Repository<Item>, @InjectRepository(Item) private readonly userRepository: Repository<User>, private readonly configService: ConfigService) {
        this.state = this.configService.get("STATE") === "prod";
    }

    async executeSeed() {
        if (this.state) {
            throw new UnauthorizedException("we cannot run seed on prod")
        }
        //this.deleteDatabase();
        const user = await this.insertUser();
        this.insertItems(user);
        return true;
    }


    async deleteDatabase() {

        await this.userRepository.createQueryBuilder().delete().where({}).execute();
        await this.itemRepository.createQueryBuilder().delete().where({}).execute();
    }


    async insertUser() {
        const user = [];
        SEED_USERS.map((ele) => {
            user.push(this.userService.create(ele));
        })
        await Promise.all(user)
        return user[0];
    }

    async insertItems(user: User) {
        const item = [];
        SEED_ITEMS.map((ele) => {
            item.push(this.itemService.create(ele, user));
        })
        await Promise.all(item)
    }
}
