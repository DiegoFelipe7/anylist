import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  @IsEmail()
  email: string;
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fullName: string;
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;


}
