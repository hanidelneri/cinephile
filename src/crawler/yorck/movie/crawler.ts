import { PlaywrightCrawler } from "crawlee";
import { YorckScraper } from "./scraper.js";

const LAYOUT_WRAPPER_SELECTOR = ".LayoutWrapper_children";
const MOVIE_DETAIL_PAGE = "MOVIE_DETAIL_PAGE";
const MOVIE_DETAIL_PAGE_LINK_SELECTOR = ".FilmListingItem a";

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    if (request.label === MOVIE_DETAIL_PAGE) {
      await page.waitForSelector(LAYOUT_WRAPPER_SELECTOR);
      const movie = await new YorckScraper(page).scrape();

      pushData(movie, movie.title);
    } else {
      await page.waitForSelector(MOVIE_DETAIL_PAGE_LINK_SELECTOR);
      await enqueueLinks({
        selector: MOVIE_DETAIL_PAGE_LINK_SELECTOR,
        label: MOVIE_DETAIL_PAGE,
      });
    }
  },
});

await crawler.run(["https://www.yorck.de/en/films"]);
