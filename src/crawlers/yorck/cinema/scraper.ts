import { Page } from "playwright";
import { cinema } from "../../types.js";

export class Scraper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async scrape(): Promise<cinema> {
    return {
      address: await this.getAddress(),
      name: await this.getName(),
      url: this.page.url(),
    };
  }

  private async getName(): Promise<string> {
    const name = await this.page.locator("h2").first().textContent();
    return name ? name : "";
  }

  private async getAddress(): Promise<string> {
    const address = await this.page
      .locator(".LayoutWrapper_children")
      .locator(".MuiBox-root")
      .locator(".MuiBox-root")
      .locator(".MuiGrid-root.MuiGrid-container")
      .locator(".MuiGrid-root.MuiGrid-item")
      .locator(".MuiBox-root")
      .locator("span.MuiTypography-root.MuiTypography-label")
      .first()
      .textContent();

    if (address) {
      return address.split("|")[1];
    }

    return "";
  }
}
