import { version as versionEnum } from "@prisma/client";
import prisma from "./client.js";

export class showTimeRepository {
  public async getShowTime(start?: Date, end?: Date, version?: string) {
    return prisma.show_time.findMany({
      where: {
        datetime: {
          gte: start,
          lte: end,
        },
        versions: {
          has: version as versionEnum,
        },
      },
      select: {
        datetime: true,
        screenType: true,
        versions: true,
        cinema: {
          select: {
            name: true,
          },
        },
        movie: {
          select: {
            title: true,
            images: true,
          },
        },
      },
    });
  }
}
