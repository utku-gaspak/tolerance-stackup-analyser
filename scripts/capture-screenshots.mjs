
import { chromium, devices } from "playwright";

import fs from "node:fs/promises";

import path from "node:path";



const BASE_URL = process.env.BASE_URL || "https://tolstackup.com";

const OUT_DIR = path.resolve("artifacts", "screenshots");



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

  await page.waitForTimeout(1200);

}



async function captureDesktop(browser) {

  const context = await browser.newContext({

    viewport: { width: 1440, height: 2200 },

    deviceScaleFactor: 1,

  });



  const page = await context.newPage();

  await waitForStablePage(page);



  await page.screenshot({

    path: path.join(OUT_DIR, "desktop-full.png"),

    fullPage: true,

  });



  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  const viewportHeight = page.viewportSize().height;



  const positions = [

    { name: "desktop-top.png", y: 0 },

    { name: "desktop-middle.png", y: Math.max(0, Math.floor((totalHeight - viewportHeight) / 2)) },

    { name: "desktop-bottom.png", y: Math.max(0, totalHeight - viewportHeight) },

  ];



  for (const pos of positions) {

    await page.evaluate((y) => window.scrollTo(0, y), pos.y);

    await page.waitForTimeout(500);



    await page.screenshot({

      path: path.join(OUT_DIR, pos.name),

      fullPage: false,

    });

  }



  await context.close();

}



async function captureMobile(browser) {

  const context = await browser.newContext({

    ...devices["iPhone 14 Pro Max"],

  });



  const page = await context.newPage();

  await waitForStablePage(page);



  await page.screenshot({

    path: path.join(OUT_DIR, "mobile-full.png"),

    fullPage: true,

  });



  await context.close();

}



async function main() {

  await ensureDir(OUT_DIR);



  const browser = await chromium.launch({ headless: true });



  try {

    await captureDesktop(browser);

    await captureMobile(browser);

    console.log(`Screenshots saved to: ${OUT_DIR}`);

  } finally {

    await browser.close();

  }

}



main().catch((error) => {

  console.error(error);

  process.exit(1);

});

