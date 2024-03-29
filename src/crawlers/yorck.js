import { PlaywrightCrawler } from "crawlee";

const LAYOUT_WRAPPER_SELECTOR = ".LayoutWrapper_children";

const DATA_NODE_SELECTOR =
  LAYOUT_WRAPPER_SELECTOR + " > .MuiGrid-root.MuiGrid-container > .MuiGrid-item";

const SHOW_TIME_NODE_SELECTOR =
  DATA_NODE_SELECTOR + " > :last-child > :last-child > .MuiBox-root > .MuiBox-root";

const DESCRIPTION_NODE_SELECTOR = DATA_NODE_SELECTOR + " > :first-child";

const METADATA_NODE_SELECTOR = DATA_NODE_SELECTOR + "> .MuiGrid-root.MuiGrid-container";

const MOVIE_DETAIL_PAGE = "MOVIE_DETAIL_PAGE";
const MOVIE_DETAIL_PAGE_LINK_SELECTOR = ".FilmListingItem a";

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    if (request.label === MOVIE_DETAIL_PAGE) {
      await page.waitForSelector(LAYOUT_WRAPPER_SELECTOR);

      //TITLE
      const title = await page.locator("h2").first().textContent();

      //DESCRIPTION
      const description = await page.locator(DESCRIPTION_NODE_SELECTOR).first().textContent();

      //METADATA
      const metadata = {};
      const keys = await page.locator(METADATA_NODE_SELECTOR).first().locator("h5").allInnerTexts();
      const values = await page
        .locator(METADATA_NODE_SELECTOR)
        .first()
        .locator("span.MuiTypography-root")
        .allInnerTexts();

      keys.forEach((key, index) => {
        metadata[key] = values[index];
      });

      //SHOWTIME
      const showTimes = await Promise.all(
        (
          await page.locator(SHOW_TIME_NODE_SELECTOR).all()
        ).map(async (locator) => {
          const theater = await locator
            .locator("nth=0")
            .locator(".MuiTypography-root")
            .first()
            .textContent();

          const showTimeAndVersions = await Promise.all(
            (
              await locator
                .locator("nth=0")
                .locator(".MuiBox-root")
                .locator("nth=0")
                .locator("nth=0")
                .all()
            ).map(async (locator) => ({
              time: await locator
                .locator(".MuiTypography-listingItem")
                .locator("nth=0")
                .textContent(),
              version: await locator
                .locator(".MuiTypography-listingItem")
                .locator("nth=1")
                .textContent(),
            }))
          );

          return {
            theater,
            when: showTimeAndVersions,
          };
        })
      );

      pushData({ ...metadata, description, showTimes }, title);
    } else {
      await page.waitForSelector(MOVIE_DETAIL_PAGE_LINK_SELECTOR);
      await enqueueLinks({
        selector: MOVIE_DETAIL_PAGE_LINK_SELECTOR,
        label: MOVIE_DETAIL_PAGE,
      });
    }
  },
  maxRequestsPerCrawl: 100,
});

await crawler.run(["https://www.yorck.de/en/films"]);
