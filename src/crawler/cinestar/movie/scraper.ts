import { Locator, Page } from "playwright";
import { movie, dictionary, showTime } from "../../types.js";

const URL_TO_THEATER_MAP: dictionary = {
  "kino-berlin-treptower-park": "CineStar Berlin-Treptow",
  "kino-berlin-cubix-am-alexanderplatz": "CineStar Cubix",
  "kino-berlin-hellersdorf": "CineStar Berlin-Hellersdorf",
  "berlin-kino-in-der-kulturbrauerei": "Kino in der Kulturbrauerei",
  "kino-berlin-tegel": "CineStar Berlin-Tegel",
};

const VERSIONS = ["ov", "omeu", "omu", "df"];

export class CinestarScraper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async scrape(): Promise<movie> {
    const cast = await this.getCast();
    const metdata = await this.getMetadata();

    return {
      title: metdata["Originaltitel"] ? metdata["Originaltitel"] : await this.getTitle(),
      description: await this.getDescription(),
      genre: await this.getGenre(),
      cast: cast["Cast"],
      director: cast["Regie"],
      images: await this.getImages(),
      duration: await this.getDuration(),
      showTimes: await this.getShowTimes(),
      url: this.page.url(),
    };
  }

  private async getTitle(): Promise<string> {
    const title = await this.page.locator(".movie-header").first().locator("h1").textContent();
    return title ? title : "";
  }

  private async getDescription(): Promise<string> {
    const description = await this.page.locator("[itemprop=description]").first().textContent();
    return description ? description : "";
  }

  private async getCast(): Promise<dictionary> {
    let cast: dictionary = {};
    const castLocator = await this.page.locator(".artists");
    if ((await castLocator.count()) > 0) {
      const keys = await this.getAllContents(".artists b");
      const values = await this.getAllContents(".artists span");
      keys.forEach((key, index) => {
        cast[key] = values[index];
      });
    }

    return cast;
  }

  private async getMetadata(): Promise<dictionary> {
    const metadata: dictionary = {};

    const keys = await this.getAllContents(".metas b");
    const values = await this.getAllContents(".metas span");
    keys.forEach((key, index) => {
      metadata[key] = values[index];
    });

    return metadata;
  }

  private async getAllContents(selector: string): Promise<string[]> {
    return await Promise.all(
      (
        await this.page.locator(selector).all()
      ).map(async (locator) => {
        const value = await locator.textContent();

        return value ? value : "";
      })
    );
  }

  private async getShowTimes(): Promise<showTime[]> {
    const showTimeViews = await this.page.locator(".ShowtimeBoxView .ShowtimeDayView").all();
    const showTimes = await Promise.all(
      showTimeViews.map(async (locator) => this.getShowTimesPerDay(locator))
    );

    return showTimes.flat();
  }

  private async getShowTimesPerDay(locator: Locator): Promise<showTime[]> {
    let showTimes: showTime[][] = [];

    const showTimeGroupViewLocator = await locator.locator(".ShowtimeGroupView");
    if ((await showTimeGroupViewLocator.count()) > 0) {
      showTimes = await Promise.all(
        (
          await showTimeGroupViewLocator.all()
        ).map(async (locator) => await this.getShowTimesPerDayAndVersion(locator))
      );
    }

    return showTimes.flat();
  }

  private async getShowTimesPerDayAndVersion(locator: Locator): Promise<showTime[]> {
    const screenType = await this.getScreenType(locator);
    const versions = await this.getVersions(locator);
    return await Promise.all(
      (
        await locator.locator(".times").locator("time").all()
      ).map(async (locator) => {
        const time = await locator.getAttribute("datetime");
        return {
          time: time ? time : "",
          theater: this.getTheater(),
          screenType,
          versions,
        };
      })
    );
  }

  private async getAttributes(locator: Locator): Promise<string[] | undefined> {
    return (await locator.locator(".attributes img").first().getAttribute("alt"))?.split(",");
  }

  private async getScreenType(locator: Locator): Promise<string> {
    const attributes = await this.getAttributes(locator);
    if (attributes !== undefined) {
      return attributes[0];
    }
    return "";
  }

  private async getVersions(locator: Locator): Promise<string[]> {
    const attributes = await this.getAttributes(locator);
    if (attributes) {
      const versions = VERSIONS.filter((version) => {
        return attributes.findIndex((attribute) => attribute.toLowerCase().includes(version)) > -1;
      });

      if (attributes.findIndex((attribute) => attribute.toLowerCase().trim() === "deutsch") > -1) {
        versions.push("df");
      }

      return versions;
    }

    return [];
  }

  private getTheater(): string {
    const theater = Object.keys(URL_TO_THEATER_MAP).find((key) => this.page.url().includes(key));
    if (theater !== undefined) {
      return URL_TO_THEATER_MAP[theater] || "";
    }
    return "";
  }

  private async getGenre(): Promise<string> {
    //is not present in the movie detail page
    return "";
  }

  private async getDuration(): Promise<string> {
    // const duration =
    const duration = (
      await this.page
        .locator(".intro-data")
        .locator(".attributes span")
        .filter({ hasText: new RegExp("\\b(?:Filmlänge)\\b") })
        .first()
        .textContent()
    )
      ?.match(/\d/g)
      ?.join("");

    return duration ? duration : "";
  }

  private async getImages(): Promise<string[]> {
    const images: string[] = [];
    (await this.page.locator(".gallery img").all()).forEach(async (locator) => {
      const src = await locator.getAttribute("src");
      if (src) {
        images.push(src);
      }
    });

    return images;
  }
}
