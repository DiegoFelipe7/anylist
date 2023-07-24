import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SingupInput } from './dto/inputs/singup.input';
import { AuthResponse } from './dto/types/auth-response';
import { LoginInput } from './dto/inputs/login.input';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService, private readonly jwtService: JwtService) {

  }

  async singUp(user: SingupInput): Promise<AuthResponse> {
    const userSave = await this.userService.create(user)
    return {
      token: this.generateJwt(userSave.id),
      user: userSave
    }
  }

  async login(login: LoginInput): Promise<AuthResponse> {
    const { email, password } = login;
    const user = await this.userService.findOneByEmail(email)
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException("email / password do not match")
    }

    return {
      token: this.generateJwt(user.id),
      user: user
    }

  }
  async validateUser(id: string) {
    const user = await this.userService.findOneById(id);

    if (!user.isActive) {
      throw new UnauthorizedException(`User is inactive, talk with an admin`);
    }

    delete user.password;

    return user;
  }
  reavalidateToken(user: User): AuthResponse {
    const token = this.generateJwt(user.id)
    return {
      token: token,
      user
    }
  }
  private generateJwt(userId: string) {
    return this.jwtService.sign({ id: userId });
  }
}
