const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const https = require("https");

const BASE_URL = "https://zahcomputers.pk/shop/page/";
const START_PAGE = 120; // 👈 start from here
const END_PAGE = 158;
const OUTPUT_DIR = path.join(__dirname, "zah_images");
const RESUME_FILE = path.join(__dirname, "resume.txt");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadImage(url, name) {
  return new Promise((resolve, reject) => {
    const safeName = name.replace(/[\\/:*?"<>|]/g, "").substring(0, 120);
    const filePath = path.join(OUTPUT_DIR, safeName + ".jpg");

    if (fs.existsSync(filePath)) return resolve("exists");

    const file = fs.createWriteStream(filePath);
    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          res.pipe(file);
          file.on("finish", () => {
            file.close(() => resolve("done"));
          });
        } else {
          file.close();
          fs.unlink(filePath, () => {});
          reject(`Failed with code ${res.statusCode}`);
        }
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {});
        reject(err.message);
      });
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  );

  let start = START_PAGE;
  if (fs.existsSync(RESUME_FILE)) {
    start = parseInt(fs.readFileSync(RESUME_FILE, "utf-8")) || START_PAGE;
    console.log(`🔁 Resuming from page ${start}`);
  }

  for (let i = start; i <= END_PAGE; i++) {
    console.log(`\n🌍 Page ${i}/${END_PAGE}...`);
    try {
      await page.goto(`${BASE_URL}${i}/`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await sleep(2000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(3000);

      const products = await page.evaluate(() => {
        const arr = [];
        // Try multiple selectors
        const selectors = ['.product-small', '.product', 'li.product', '.col-inner'];
        let elements = [];
        
        for (const sel of selectors) {
          elements = document.querySelectorAll(sel);
          if (elements.length > 0) break;
        }
        
        elements.forEach((el) => {
          // Try multiple name selectors
          const nameEl = 
            el.querySelector(".product-title a") ||
            el.querySelector(".woocommerce-loop-product__title") ||
            el.querySelector("h2 a") ||
            el.querySelector("h3 a") ||
            el.querySelector("a[href*='/product/']");
          
          const imgEl = el.querySelector("img");
          const name = nameEl?.innerText?.trim() || nameEl?.textContent?.trim();
          let img =
            imgEl?.getAttribute("data-src") ||
            imgEl?.getAttribute("data-lazy-src") ||
            imgEl?.src ||
            null;

          if (img && img.startsWith("http") && name) {
            img = img.split("?")[0];
            arr.push({ name, img });
          }
        });
        return arr;
      });

      console.log(`➡️ Found ${products.length} products on page ${i}`);

      for (const p of products) {
        try {
          await downloadImage(p.img, p.name);
          console.log(`✅ ${p.name}`);
        } catch (err) {
          console.log(`❌ ${p.name} (${err})`);
        }
      }

      fs.writeFileSync(RESUME_FILE, i.toString());
      await sleep(1500);
    } catch (err) {
      console.log(`⚠️ Error on page ${i}: ${err.message}`);
    }
  }

  await browser.close();
  console.log("🎉 Done downloading all images!");
})();
