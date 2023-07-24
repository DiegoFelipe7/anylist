import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class LoginInput {
    @Field(() => String)
    @IsString()
    @IsEmail()
    email: string;
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}