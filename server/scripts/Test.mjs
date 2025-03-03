const { chromium } = require('playwright');

(async () => {
  // Launch browser with user-like settings
  const browser = await chromium.launch({
    headless: false, // Set to true in production with caution
    args: ['--disable-blink-features=AutomationControlled'] // Hide automation flags
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' // Mimic real browser
  });

  const page = await context.newPage();

  try {
    // Step 1: Handle Login
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });
    await page.fill('#username', 'YOUR_EMAIL'); // Replace with your LinkedIn email
    await page.fill('#password', 'YOUR_PASSWORD'); // Replace with your LinkedIn password
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Step 2: Navigate to job search
    const searchUrl = 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=New%20York';
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // Random delay to mimic human behavior
    await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1000);

    // Step 3: Scroll to load jobs
    await autoScroll(page);

    // Step 4: Extract job data
    const jobs = await page.evaluate(() => {
      const jobList = [];
      const jobElements = document.querySelectorAll('.job-card-container');

      jobElements.forEach((job) => {
        const title = job.querySelector('.job-card-list__title')?.innerText || 'N/A';
        const company = job.querySelector('.job-card-container__company-name')?.innerText || 'N/A';
        const location = job.querySelector('.job-card-container__metadata-item')?.innerText || 'N/A';
        const date = job.querySelector('time')?.getAttribute('datetime') || 'N/A';

        jobList.push({
          title,
          company,
          location,
          date
        });
      });

      return jobList;
    });

    console.log('Scraped Jobs:', jobs);
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close();
  }
})();

// Auto-scroll function with random pauses
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, Math.floor(Math.random() * 200) + 100); // Random delay between scrolls
    });
  });
}