import { PlaywrightCrawler } from "crawlee";

const MOVIE_GUIDE_SELECTOR = ".MovieGuideView";
const SHOW_TILE_LINK_SELECTOR = MOVIE_GUIDE_SELECTOR + " .ShowTile a:first-child";

const MOVIE_HEADER_SELECTOR = ".movie-header";
const MOVIE_DETAIL_PAGE = "MOVIE_DETAIL_PAGE";

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    if (request.label !== MOVIE_DETAIL_PAGE) {
      await page.waitForSelector(MOVIE_GUIDE_SELECTOR);
      await enqueueLinks({
        selector: SHOW_TILE_LINK_SELECTOR,
        label: MOVIE_DETAIL_PAGE,
      });
    } else {
      //TITLE
      const title = await page.locator(MOVIE_HEADER_SELECTOR).first().locator("h1").textContent();

      //DESCRIPTION
      const description = await page.locator("[itemprop=description]").first().allInnerTexts();

      //CAST
      let cast = "";
      const castLocator = await page.locator(".artists span");
      if ((await castLocator.count()) > 0) {
        cast = await castLocator.first().textContent();
      }
      console.log(cast);
    }
  },
});

await crawler.run(["https://www.cinestar.de/kino-berlin-treptower-park"]);
