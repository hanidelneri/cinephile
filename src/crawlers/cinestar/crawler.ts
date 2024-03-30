import { PlaywrightCrawler } from "crawlee";
import { CinestarScraper } from "./scraper.js";

const MOVIE_GUIDE_SELECTOR = ".MovieGuideView";
const SHOW_TILE_LINK_SELECTOR = MOVIE_GUIDE_SELECTOR + " .ShowTile a:first-child";

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
      const movie = await new CinestarScraper(page).scrape();
      pushData(movie, movie.title);
    }
  },
});

await crawler.run([
  "https://www.cinestar.de/kino-berlin-treptower-park",
  "https://www.cinestar.de/kino-berlin-cubix-am-alexanderplatz",
  "https://www.cinestar.de/kino-berlin-hellersdorf",
  "https://www.cinestar.de/berlin-kino-in-der-kulturbrauerei",
  "https://www.cinestar.de/kino-berlin-tegel",
]);
