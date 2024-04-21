import { PrismaClient } from "@prisma/client";
import { movie } from "../types.js";
import { firefox } from "playwright";

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
        movie_genre: {
          include: {
            genre: true,
          },
        },
        cast: {
          include: {
            people: true,
          },
        },
        show_time: true,
      },
    });
  }

  private async createNewMovieAndShowTime(movie: movie): Promise<void> {
    await this.prisma.movie.create({
      include: {
        movie_genre: {
          include: {
            genre: true,
          },
        },
        cast: {
          include: {
            people: true,
          },
        },
      },
      data: {
        title: movie.title,
        description: movie.description,
        duration: +movie.duration,
        images: movie.images,
        links: [movie.url],
        movie_genre: {
          create: movie.genre.map((genre) => ({
            genre: {
              connectOrCreate: {
                create: {
                  name: genre,
                },
                where: {
                  name: genre,
                },
              },
            },
          })),
        },
        cast: {
          create: movie.cast.map((cast) => {
            const [firstName, lastName] = cast.split(" ");
            return {
              role: "cast",
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
          }),
        },
        show_time: {
          create: movie.showTimes.map((showTime) => {
            return {
              datetime: new Date(this.getIsoDate(showTime.date, showTime.time)),
            };
          }),
        },
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
      updatedFields.images = [...movieEntity.images, ...newImages];

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
          (showTimeEntity) =>
            showTimeEntity.datetime.toISOString() === this.getIsoDate(showTime.date, showTime.time)
        );
      });

      await this.prisma.movie.update({
        where: {
          id: movieEntity.id,
        },
        data: {
          ...updatedFields,
          movie_genre: {
            create: newGenres.map((genre) => ({
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
            })),
          },
          cast: {
            create: newCast.map((cast) => {
              const [firstName, lastName] = cast.split(" ");

              return {
                people: {
                  connectOrCreate: {
                    where: {
                      first_name_last_name: {
                        first_name: firstName,
                        last_name: lastName,
                      },
                    },
                    create: {
                      first_name: firstName,
                      last_name: lastName || "",
                    },
                  },
                },
                role: "cast",
              };
            }),
          },
          show_time: {
            createMany: {
              data: newShowTimes.map((showTime) => ({
                datetime: this.getIsoDate(showTime.date, showTime.time),
              })),
            },
          },
        },
        include: {
          movie_genre: {
            include: {
              genre: true,
            },
          },
          cast: {
            include: {
              people: true,
            },
          },
        },
      });
    }
  }

  private getIsoDate(date: string, time: string): string {
    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");

    // Ensure month and day are zero-padded if they are single digits
    const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    // Concatenate date and time components in ISO-8601 format
    return `${isoDate}T${hours}:${minutes}:00`;
  }
}
