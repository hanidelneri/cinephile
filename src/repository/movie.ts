import { PrismaClient, role } from "@prisma/client";
import { movie, showTime } from "../types.js";

const INCLUDE_GENRE = {
  movie_genre: {
    include: {
      genre: true,
    },
  },
};

const INCLUDE_CAST = {
  cast: {
    include: {
      people: true,
    },
  },
};

export class MovieRepository {
  prisma = new PrismaClient();

  public async populateShowTimes(movie: movie) {
    // inefficient, queries movie by title twice to fix a typescript issue
    const movieEntity = await this.findMovieByTitle(movie.title);

    if (movieEntity) {
      await this.updateExistingMovieWithNewShowTimes(movie);
    } else {
      await this.createNewMovieAndShowTime(movie);
    }
  }

  private async findMovieByTitle(title: string) {
    return await this.prisma.movie.findFirst({
      where: {
        title: title,
      },
      include: {
        ...INCLUDE_GENRE,
        ...INCLUDE_CAST,
        show_time: true,
      },
    });
  }

  private async createNewMovieAndShowTime(movie: movie): Promise<void> {
    await this.prisma.movie.create({
      data: {
        title: movie.title,
        description: movie.description,
        duration: +movie.duration,
        images: movie.images,
        links: [movie.url],
        movie_genre: {
          create: movie.genre.map(this.createOrConnectGenre),
        },
        cast: {
          create: movie.cast.map(this.createOrConnectCast),
        },
        show_time: {
          create: movie.showTimes.map((showTime) => {
            return {
              datetime: new Date(showTime.datetime),
            };
          }),
        },
      },
      include: {
        ...INCLUDE_GENRE,
        ...INCLUDE_CAST,
      },
    });
  }

  private async updateExistingMovieWithNewShowTimes(movie: movie): Promise<void> {
    const movieEntity = await this.findMovieByTitle(movie.title);

    if (movieEntity) {
      const updatedFields: any = {};
      if (movieEntity.links.indexOf(movie.url) < 0) {
        updatedFields.links = [...movieEntity.links, movie.url];
      }

      const newImages = movie.images.filter((image) => movieEntity.images.indexOf(image) < 0);

      const newGenres = movie.genre.filter((genre) =>
        movieEntity.movie_genre.find((genreEntity) => genreEntity.genre.name === genre)
      );

      const newCast = movie.cast.filter((cast) =>
        movieEntity.cast.find((castEntity) => {
          const [firstName, lastName] = cast.split(" ");
          return (
            castEntity.people.first_name === firstName && castEntity.people.last_name === lastName
          );
        })
      );

      const newShowTimes = movie.showTimes.filter((showTime) => {
        movieEntity.show_time.find(
          (showTimeEntity) => showTimeEntity.datetime.toISOString() === showTime.datetime
        );
      });

      await this.prisma.movie.update({
        where: {
          id: movieEntity.id,
        },
        data: {
          ...updatedFields,
          images: {
            push: newImages,
          },
          movie_genre: {
            create: newGenres.map(this.createOrConnectGenre),
          },
          cast: {
            create: newCast.map(this.createOrConnectCast),
          },
          show_time: {
            createMany: {
              data: newShowTimes.map(this.createShowTime),
            },
          },
        },
        include: {
          ...INCLUDE_GENRE,
          ...INCLUDE_CAST,
        },
      });
    }
  }

  private createOrConnectGenre = (genre: string) => {
    return {
      genre: {
        connectOrCreate: {
          where: {
            name: genre,
          },
          create: {
            name: genre,
          },
        },
      },
    };
  };

  private createOrConnectCast = (cast: string) => {
    const [firstName, lastName] = cast.split(" ");

    return {
      role: role.cast,
      people: {
        connectOrCreate: {
          create: {
            first_name: firstName,
            last_name: lastName || "",
          },
          where: {
            first_name_last_name: {
              first_name: firstName,
              last_name: lastName || "",
            },
          },
        },
      },
    };
  };

  private createShowTime = (showTime: showTime) => ({
    datetime: showTime.datetime,
  });
}
