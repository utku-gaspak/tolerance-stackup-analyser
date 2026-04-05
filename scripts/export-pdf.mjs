
import { chromium } from "playwright";

import fs from "node:fs/promises";

import path from "node:path";



const BASE_URL = process.env.BASE_URL || "https://tolstackup.com";

const OUT_DIR = path.resolve("artifacts", "downloads");



async function ensureDir(dir) {

  await fs.mkdir(dir, { recursive: true });

}



async function waitForStablePage(page) {

  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  await page.emulateMedia({ media: "screen" });

  await page.evaluate(async () => {

    if (document.fonts?.ready) {

      await document.fonts.ready;

    }

  });

  await page.waitForTimeout(1500);

}



async function findExportPdfButton(page) {

  const candidates = [

    page.getByRole("button", { name: /export pdf/i }),

    page.locator("button:has-text('Export PDF')"),

    page.locator("text=Export PDF")

  ];



  for (const candidate of candidates) {

    try {

      const count = await candidate.count();

      if (count > 0) {

        const button = candidate.first();

        await button.waitFor({ state: "visible", timeout: 10000 });

        return button;

      }

    } catch {}

  }



  throw new Error("Export PDF button not found.");

}



async function main() {

  await ensureDir(OUT_DIR);



  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({

    acceptDownloads: true,

    viewport: { width: 1440, height: 2200 }

  });



  const page = await context.newPage();



  page.on("pageerror", (err) => {

    console.error("Page error:", err.message);

  });



  page.on("console", (msg) => {

    const type = msg.type();

    if (type === "error" || type === "warning") {

      console.log(`[browser ${type}] ${msg.text()}`);

    }

  });



  try {

    await waitForStablePage(page);



    const button = await findExportPdfButton(page);



    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });



    await button.click();



    const download = await downloadPromise;

    const suggested = download.suggestedFilename() || "tolerance-stackup-report.pdf";

    const filePath = path.join(OUT_DIR, suggested);



    await download.saveAs(filePath);

    console.log(`PDF saved to: ${filePath}`);

  } finally {

    await context.close();

    await browser.close();

  }

}



main().catch((error) => {

  console.error(error);

  process.exit(1);

});

