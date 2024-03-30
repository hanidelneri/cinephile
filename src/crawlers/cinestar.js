import { PlaywrightCrawler } from "crawlee";

const MOVIE_GUIDE_SELECTOR = ".MovieGuideView";
const SHOW_TILE_LINK_SELECTOR = MOVIE_GUIDE_SELECTOR + " .ShowTile a:first-child";

const MOVIE_HEADER_SELECTOR = ".movie-header";
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

      //METADATA
      const metadatas = {};
      const keys = await Promise.all(
        (await page.locator(".metas b").all()).map(async (locator) => await locator.textContent())
      );
      const values = await Promise.all(
        (
          await page.locator(".metas span").all()
        ).map(async (locator) => await locator.textContent())
      );

      keys.forEach((key, index) => {
        metadatas[key] = values[index];
      });

      //SHOWTIME
      const showTimes = await Promise.all(
        (
          await page.locator(".ShowtimeBoxView .ShowtimeDayView").all()
        ).map(async (locator) => {
          const day = await locator.locator(".day").first().textContent();

          let when = [];
          const showTimeGroupViewLocator = await locator.locator(".ShowtimeGroupView");
          if ((await showTimeGroupViewLocator.count()) > 0) {
            when = await Promise.all(
              (
                await showTimeGroupViewLocator.all()
              ).map(async (locator) => {
                const attributes = (
                  await locator.locator(".attributes img").first().getAttribute("alt")
                ).split(",");

                const screenType = attributes[0];
                const versions = VERSIONS.filter((version) => {
                  return (
                    attributes.findIndex((attribute) => attribute.toLowerCase().includes(version)) >
                    -1
                  );
                });

                if (
                  attributes.findIndex(
                    (attribute) => attribute.toLowerCase().trim() === "deutsch"
                  ) > -1
                ) {
                  versions.push("df");
                }

                const times = await Promise.all(
                  (
                    await locator.locator(".times").locator("time").all()
                  ).map(async (locator) => {
                    return { time: await locator.getAttribute("datetime"), versions, screenType };
                  })
                );
                return times;
              })
            );
          }

          console.log(when);

          return {
            day,
            when,
          };
        })
      );
    }
  },
});

await crawler.run(["https://www.cinestar.de/kino-berlin-treptower-park"]);
