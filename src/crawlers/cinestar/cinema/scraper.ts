import { Page } from "playwright";
import { cinema } from "../../types.js";

export class Scraper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async scrape(): Promise<cinema> {
    return {
      name: await this.getName(),
      address: await this.getAddress(),
      url: this.page.url(),
    };
  }

  private async getName(): Promise<string> {
    const name = await this.page.locator("#address").locator("h2").first().textContent();

    return name ? name : "";
  }

  private async getAddress(): Promise<string> {
    const address = await this.page.locator("#address").locator(".address").textContent();

    return address ? address.split("\n")[1].trim().replace("Anfahrt", "") : "";
  }
}
