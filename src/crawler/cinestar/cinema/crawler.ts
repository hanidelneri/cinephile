import { PlaywrightCrawler } from "crawlee";
import { Scraper } from "./scraper.js";
import { CinemaRepository } from "../../../repository/cinema.js";

const MOVIE_GUIDE_SELECTOR = "#cinema-infos-main";

const crawler = new PlaywrightCrawler({
  async requestHandler({ page, pushData }) {
    const repository = new CinemaRepository();
    await page.waitForSelector(MOVIE_GUIDE_SELECTOR);
    const cinema = await new Scraper(page).scrape();
    await repository.createOrUpdateCinema(cinema);
  },
});

await crawler.run([
  "https://www.cinestar.de/kino-berlin-treptower-park/info",
  "https://www.cinestar.de/kino-berlin-cubix-am-alexanderplatz/info",
  "https://www.cinestar.de/kino-berlin-hellersdorf/info",
  "https://www.cinestar.de/berlin-kino-in-der-kulturbrauerei/info",
  "https://www.cinestar.de/kino-berlin-tegel/info",
]);
