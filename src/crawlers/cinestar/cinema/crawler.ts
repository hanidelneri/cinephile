import { PlaywrightCrawler } from "crawlee";
import { Scraper } from "./scraper.js";

const MOVIE_GUIDE_SELECTOR = "#cinema-infos-main";

const crawler = new PlaywrightCrawler({
  async requestHandler({ page, pushData }) {
    await page.waitForSelector(MOVIE_GUIDE_SELECTOR);
    const cinema = await new Scraper(page).scrape();
    pushData(cinema, cinema.name);
  },
});

await crawler.run([
  "https://www.cinestar.de/kino-berlin-treptower-park/info",
  "https://www.cinestar.de/kino-berlin-cubix-am-alexanderplatz/info",
  "https://www.cinestar.de/kino-berlin-hellersdorf/info",
  "https://www.cinestar.de/berlin-kino-in-der-kulturbrauerei/info",
  "https://www.cinestar.de/kino-berlin-tegel/info",
]);
