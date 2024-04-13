import { PlaywrightCrawler } from "crawlee";
import { Scraper } from "./scraper.js";
import { CinemaRepository } from "../../../repository/cinema.js";

const LAYOUT_WRAPPER_SELECTOR = ".LayoutWrapper_children";
const CINEMA_DETAIL_PAGE = "CINEMA_DETAIL_PAGE";
const CINEMA_DETAIL_PAGE_LINK_SELECTOR = LAYOUT_WRAPPER_SELECTOR + " .MuiGrid-root.MuiGrid-item a";

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    const repository = new CinemaRepository();

    if (request.label === CINEMA_DETAIL_PAGE) {
      await page.waitForSelector(LAYOUT_WRAPPER_SELECTOR);
      const cinema = await new Scraper(page).scrape();
      await repository.createOrUpdateCinema(cinema);
    } else {
      await page.waitForSelector(CINEMA_DETAIL_PAGE_LINK_SELECTOR);
      await enqueueLinks({
        selector: CINEMA_DETAIL_PAGE_LINK_SELECTOR,
        label: CINEMA_DETAIL_PAGE,
      });
    }
  },
});

await crawler.run(["https://www.yorck.de/en/cinemas"]);
