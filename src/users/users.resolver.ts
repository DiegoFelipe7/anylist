import { Resolver, Query, Mutation, Args, ID, ResolveField, Int, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/inputs/create-user.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { ValidRolesArgs } from './dto/args/role';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth-guard';
import { CurrentUser } from 'src/auth/decoratos/current.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { ItemsService } from 'src/items/items.service';
import { Item } from 'src/items/entities/item.entity';
import { SearchArg } from 'src/common/dto/args/search.arg';
import { PaginationArgs } from 'src/common/dto/args/pagination.arg';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService, private readonly itemService: ItemsService) { }
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }
  @Query(() => [User], { name: 'users' })
  findAll(@Args() validRoles: ValidRolesArgs, @CurrentUser([ValidRoles.admin]) user: User) {
    return this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'userId' })
  findOne(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.user]) user: User,
  ) {
    return this.usersService.findOneById(id)
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput, @CurrentUser([ValidRoles.user]) user: User,) {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User)
  blockUser(@Args('id', { type: () => ID }) id: string, @CurrentUser([ValidRoles.admin]) user: User) {

    return this.usersService.block(id, user);
  }

  @ResolveField(() => Int, { name: "itemCount" })
  itemCount(@Parent() user: User) {
    return this.itemService.itemCountByUser(user);
  }

  @ResolveField(() => [Item], { name: "items" })
  items(@Parent() user: User, @Args() paginationArg: PaginationArgs,
    @Args() searchArg: SearchArg) {
    return this.itemService.findAll(user, paginationArg, searchArg)
  }
}

