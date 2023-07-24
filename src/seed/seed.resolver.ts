import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) { }

  @Mutation(() => Boolean, { name: "executeSeed", description: "Ejecuta la construccion de la bd" })
  async executeSeed(): Promise<Boolean> {
    return await this.seedService.executeSeed();
  }
}
