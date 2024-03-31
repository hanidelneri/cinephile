import { Page } from "playwright";
import { dictionary, showTime, movie } from "../movie.js";

const LAYOUT_WRAPPER_SELECTOR = ".LayoutWrapper_children";

const DATA_NODE_SELECTOR =
  LAYOUT_WRAPPER_SELECTOR + " > .MuiGrid-root.MuiGrid-container > .MuiGrid-item";

const DESCRIPTION_NODE_SELECTOR = DATA_NODE_SELECTOR + " > :first-child";
const METADATA_NODE_SELECTOR = DATA_NODE_SELECTOR + "> .MuiGrid-root.MuiGrid-container";
const SHOW_TIME_NODE_SELECTOR =
  DATA_NODE_SELECTOR + " > :last-child > :last-child > .MuiBox-root > .MuiBox-root";
const HEADER_SELECTOR =
  ".LayoutWrapper_children  > .MuiBox-root > .MuiBox-root .MuiGrid-root.MuiGrid-container";

export class YorckScraper {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  public async scrape(): Promise<movie> {
    const metadata = await this.getMetadata();
    return {
      title: await this.getTitle(),
      description: await this.getDescription(),
      genre: await this.getGenre(),
      cast: metadata["Cast"],
      director: metadata["Director"],
      duration: await this.getDuration(),
      showTimes: await this.getShowTimes(),
    };
  }

  private async getTitle(): Promise<string> {
    const title = await this.page.locator("h2").first().textContent();
    return title ? title : "";
  }

  private async getDescription(): Promise<string> {
    const description = await this.page.locator(DESCRIPTION_NODE_SELECTOR).first().textContent();
    return description ? description : "";
  }

  private async getMetadata(): Promise<dictionary> {
    const metadata: dictionary = {};
    const keys = await this.page
      .locator(METADATA_NODE_SELECTOR)
      .first()
      .locator("h5")
      .allInnerTexts();
    const values = await this.page
      .locator(METADATA_NODE_SELECTOR)
      .first()
      .locator("span.MuiTypography-root")
      .allInnerTexts();

    keys.forEach((key, index) => {
      metadata[key] = values[index];
    });
    return metadata;
  }

  private async getShowTimes(): Promise<showTime[]> {
    return (
      await Promise.all(
        (
          await this.page.locator(SHOW_TIME_NODE_SELECTOR).all()
        ).map(async (locator) => {
          const theater =
            (await locator.locator("nth=0").locator(".MuiTypography-root").first().textContent()) ||
            "";

          return await Promise.all(
            (
              await locator
                .locator("nth=0")
                .locator(".MuiBox-root")
                .locator("nth=0")
                .locator("nth=0")
                .all()
            ).map(async (locator) => ({
              theater,
              screenType: "2D",
              time:
                (await locator
                  .locator(".MuiTypography-listingItem")
                  .locator("nth=0")
                  .textContent()) || "",
              versions: [
                (await locator
                  .locator(".MuiTypography-listingItem")
                  .locator("nth=1")
                  .textContent()) || "",
              ],
            }))
          );
        })
      )
    ).flat();
  }

  private async getGenre(): Promise<string> {
    const genre = await this.page
      .locator(HEADER_SELECTOR)
      .locator(".MuiTypography-root.MuiTypography-label")
      .first()
      .textContent();

    return genre ? genre : "";
  }

  private async getDuration(): Promise<string> {
    const duration = (
      await this.page
        .locator(HEADER_SELECTOR)
        .locator(".MuiTypography-root.MuiTypography-label")
        .filter({ hasText: new RegExp("\\b(?:min)\\b") })
        .first()
        .textContent()
    )
      ?.match(/\d/g)
      ?.join("");

    return duration ? duration : "";
  }
}
