import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/inputs/create-user.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt"
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {

  }
  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const { password, ...CreateUserInput } = createUserInput;

      const user = this.userRepository.create({
        ...CreateUserInput,
        password: bcrypt.hashSync(password, 10)
      });
      return await this.userRepository.save(user)
    } catch (error) {
      this.handlerError(error)
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0) return await this.userRepository.find(
      //TODO: NO ES NECESARIO PORQUE TENEMOS LAZI 
      /* {
        relations: {
          lastUpdateBy: true
        }
      } */
    );
    return await this.userRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneBy({ email: email })
    } catch (error) {
      throw new NotFoundException("El usuario no se encuentra registrado")
    }
  }

  async findOneById(id: string): Promise<User> {

    try {
      return await this.userRepository.findOneByOrFail({ id })
    } catch (error) {
      throw new NotFoundException(`${id} not found`);
    }

  }

  async update(id: string, updateUserInput: UpdateUserInput, updateBy: User): Promise<User> {
    try {
      const user = await this.userRepository.preload({
        ...updateUserInput,
        id
      })
      user.lastUpdateBy = updateBy
      return await this.userRepository.save(user);
    } catch (error) {
      this.handlerError(error);

    }


  }

  async block(id: string, adminUser: User): Promise<User> {
    const user = await this.findOneById(id)
    user.isActive = false;
    user.lastUpdateBy = adminUser;
    return this.userRepository.save(user);
  }

  private handlerError(error: any): never {
    if (error.code === "23505") {
      throw new BadRequestException("El usuario ya se encuentra registrado")
    }
    throw new InternalServerErrorException("ocurrio un erro inesperado")
  }
}
