import { PrismaClient } from "@prisma/client";
import { movie } from "../types.js";

export class MovieRepository {
  prisma = new PrismaClient();

  public async createMovie(movie: movie) {
    await this.prisma.movie.create({
      data: {
        title: movie.title,
        description: movie.description,
        images: movie.images,
        links: [movie.url],
        duration: +movie.duration,
      },
    });
  }
}
