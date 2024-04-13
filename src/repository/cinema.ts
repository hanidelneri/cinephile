import { PrismaClient } from "@prisma/client";
import { cinema } from "../types.js";

export class CinemaRepository {
  prisma = new PrismaClient();

  public async createOrUpdateCinema(cinema: cinema) {
    const alreadyCreatedCinema = await this.prisma.cinema.findUnique({
      where: {
        name: cinema.name,
      },
    });

    if (!alreadyCreatedCinema) {
      await this.prisma.cinema.create({
        data: {
          name: cinema.name,
          url: cinema.url,
          address: cinema.address,
        },
      });
    }
  }
}
