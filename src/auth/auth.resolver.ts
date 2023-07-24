import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SingupInput } from './dto/inputs/singup.input';
import { AuthResponse } from './dto/types/auth-response';
import { LoginInput } from './dto/inputs/login.input';
//import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
//import { AuthGuard } from './guard/auth.guard';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from './guard/jwt-auth-guard';
import { CurrentUser } from './decoratos/current.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService, /*private readonly jwtService: JwtService*/) { }

  @Mutation(() => AuthResponse, { name: "singUp" })
  singUp(@Args('singupInput') user: SingupInput) {
    return this.authService.singUp(user);
  }

  @Mutation(() => AuthResponse)
  login(@Args('login') login: LoginInput) {
    return this.authService.login(login);
  }


  @Query(() => AuthResponse, { name: 'revalidate' })
  @UseGuards(JwtAuthGuard)
  revalidateToken(@CurrentUser() user: User): AuthResponse {
    return this.authService.reavalidateToken(user)
  }
}

