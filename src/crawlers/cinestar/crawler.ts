import { PlaywrightCrawler } from "crawlee";
import { CinestarScraper } from "./scraper.js";

const MOVIE_GUIDE_SELECTOR = ".MovieGuideView";
const SHOW_TILE_LINK_SELECTOR = MOVIE_GUIDE_SELECTOR + " .ShowTile a:first-child";

const MOVIE_DETAIL_PAGE = "MOVIE_DETAIL_PAGE";
const VERSIONS = ["ov", "omeu", "omu", "df"];

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    if (request.label !== MOVIE_DETAIL_PAGE) {
      await page.waitForSelector(MOVIE_GUIDE_SELECTOR);
      await enqueueLinks({
        selector: SHOW_TILE_LINK_SELECTOR,
        label: MOVIE_DETAIL_PAGE,
      });
    } else {
      const movie = await new CinestarScraper(page).scrape();
      console.log(movie);
    }
  },
});

await crawler.run(["https://www.cinestar.de/kino-berlin-treptower-park"]);
