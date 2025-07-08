// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // wait for articles to load to begin grabbing newest 100
  // '.athing' is usually the main story row and has the article ID as its 'id' attribute - can also use .submission since articles all have those same two classes
  await page.waitForSelector('.athing');

  // create empty arr to store data
  const articles = [];
  const targetArticleCount = 100; // Define the target count

  // Loop to fetch articles until we have enough
  while (articles.length < targetArticleCount) {
    const currentArticleElements = await page.locator('.athing').all();

    // Basing articles on uniqueness of ID so no duplicates are added by accident
    for (const articleElement of currentArticleElements) {
        const articleIdString = await articleElement.getAttribute('id');
        const articleId = articleIdString ? parseInt(articleIdString) : null;

        if (articleId !== null) {
            // Check if this article ID is already in our list to avoid duplicates
            if (!articles.some(a => a.id === articleId)) {
                articles.push({ id: articleId });
            }
        }
    }

    // If we have enough articles, break the loop
    // we want to manually break it due to each page having 30 articles each so we may accidetnally fetch 120 if we grab entire page
    if (articles.length >= targetArticleCount) {
      break;
    }

    // more link allows us to grab more articles instead of stopping on the initial page load which would be 30
    const moreLinkLocator = page.locator('.morelink').first();

    // Check if the "More" link is visible/present
    const isMoreLinkVisible = await moreLinkLocator.isVisible();

    if (isMoreLinkVisible) {
      console.log(`Found ${articles.length} articles. Clicking 'More' to fetch more...`);
      // Click the "More" link - helps with logging what script is doing as well for clarity
      await moreLinkLocator.click();

      // Wait for the new articles to load after clicking.
      await page.waitForLoadState('networkidle'); 

    } else {
      console.warn(`No 'More' link found. Only collected ${articles.length} articles.`);
      break;
    }
  }

  // Ensure we only validate the first 100 articles using slice method (extra parameters if we accidentally take more than what is asked)
  const articlesToValidate = articles.slice(0, targetArticleCount);

  // validate article count is exacatly 100
  if (articlesToValidate.length !== targetArticleCount) {
    console.error(`FAILURE: Expected exactly ${targetArticleCount} articles for validation, but collected only ${articlesToValidate.length}.`);
    await browser.close()
    return false;
  } else {
    console.log(`SUCCESS: Collected exactly ${targetArticleCount} articles for validation.`);
  }

  // On Hacker News, newer articles generally have higher IDs
  let isSorted = true;
  for (let i = 0; i < articlesToValidate.length - 1; i++) {
    // Article IDs are generated in order similar to keys on a table, can utilize this to also determine if things are in order - IDs should be descending in this case
    if (articlesToValidate[i].id < articlesToValidate[i + 1].id) {
      console.error(`FAILURE: Articles are not sorted correctly.`);
      console.error(`Article ${i} (ID: ${articlesToValidate[i].id}) is older than Article ${i + 1} (ID: ${articlesToValidate[i + 1].id}).`);
      isSorted = false;
      break;
    }
  }

  if (isSorted) {
    console.log(`SUCCESS: The first ${targetArticleCount} articles are sorted from newest to oldest by ID.`);
  } else {
    console.log("FAILURE: Articles are not sorted from newest to oldest.");
  }

  await browser.close();

  return isSorted;
}

(async () => {
  const validationResult = await sortHackerNewsArticles();
  if (validationResult) {
    console.log("\nAssignment Question 1: Hacker News article sorting validated successfully!");
  } else {
    console.log("\nAssignment Question 1: Hacker News article sorting validation FAILED.");
  }
})();