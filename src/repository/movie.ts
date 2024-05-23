import {
  PrismaClient,
  role,
  screenType as screenTypeEnum,
  version as versionEnum,
} from "@prisma/client";
import { movie, showTime } from "../types.js";
import prisma from "./client.js";

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

const INCLUDE_CINEMA = {
  show_time: {
    include: {
      cinema: true,
    },
  },
};

export class MovieRepository {
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
    return await prisma.movie.findFirst({
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
    await prisma.movie.create({
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
          create: movie.showTimes.map(this.createShowTime),
        },
      },
      include: {
        ...INCLUDE_GENRE,
        ...INCLUDE_CAST,
        ...INCLUDE_CINEMA,
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

      const newGenres = movie.genre.filter(
        (genre) => !movieEntity.movie_genre.find((genreEntity) => genreEntity.genre.name === genre)
      );

      const newCast = movie.cast.filter(
        (cast) =>
          !movieEntity.cast.find((castEntity) => {
            return castEntity.people.name === cast;
          })
      );

      const newShowTimes = movie.showTimes.filter((showTime) => {
        !movieEntity.show_time.find(
          (showTimeEntity) => showTimeEntity.datetime.toISOString() === showTime.datetime
        );
      });

      await prisma.movie.update({
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
          ...INCLUDE_CINEMA,
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
    return {
      role: role.cast,
      people: {
        connectOrCreate: {
          create: {
            name: cast,
          },
          where: {
            name: cast,
          },
        },
      },
    };
  };

  private createShowTime = (showTime: showTime) => ({
    datetime: showTime.datetime,
    screenType: this.getScreenType(showTime.screenType),
    versions: showTime.versions.map(this.getVersion),
    cinema: {
      connect: {
        name: showTime.theater,
      },
    },
  });

  private getScreenType = (screenType: string): screenTypeEnum => {
    if (screenType == "3D") return screenTypeEnum.threeD;
    return screenTypeEnum.twoD;
  };

  private getVersion = (version: string): versionEnum => {
    switch (version) {
      case "df":
        return versionEnum.df;
      case "omu":
        return versionEnum.omu;
      case "omeu":
        return versionEnum.omeu;
      default:
        return versionEnum.ov;
    }
  };
}
