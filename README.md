# Hacker News Article Order Validator

This project features an automated script designed to validate the order of articles on the "Newest" section of Hacker News. It demonstrates capabilities in web automation, dynamic content handling, data extraction, and programmatic validation using modern JavaScript tools.

**Link to project:** This is a Node.js script that runs locally and interacts with a live website. There isn't a hosted demo link.

![Hacker News Screenshot](https://placehold.co/1200x650/F0F0F0/333333?text=Hacker+News+Validation+Script+Running)

## How It's Made:

**Tech used:** Node.js, Playwright

This script was built to address a specific web automation challenge: verifying the chronological order of a large number of dynamically loaded articles on Hacker News.

The process began by launching a Chromium browser instance using Playwright and navigating to the `https://news.ycombinator.com/newest` URL. The initial step involved waiting for the primary article containers (`.athing` elements) to load on the page, ensuring the script wouldn't attempt to interact with non-existent elements.

A key challenge was that Hacker News's "Newest" page only displays 30 articles per load. To meet the requirement of validating **exactly the first 100 articles**, the script implements a loop that repeatedly clicks the "More" link at the bottom of the page. After each click, `page.waitForLoadState('networkidle')` is used to ensure all new content has finished loading before attempting to collect more articles. This robust waiting mechanism prevents race conditions and ensures data integrity.

Within this collection loop, the script identifies each article's unique ID. Through inspection of the Hacker News DOM, it was found that each main article row (`.athing` `<tr>` element) conveniently includes the article's unique ID directly in its `id` attribute. This provided a highly reliable and efficient way to extract the identifier, avoiding more complex parsing of sub-elements or URL parameters. To prevent duplicate entries when repeatedly fetching articles, a check is performed to ensure each collected article ID is unique before adding it to the main `articles` array.

Once at least 100 unique article IDs are collected, the script proceeds to the validation phase. It first confirms that precisely 100 articles were successfully gathered. Then, it iterates through the collected articles, comparing the ID of each article with the ID of the subsequent one. Since Hacker News assigns incrementally higher IDs to newer posts, a correct "newest to oldest" sort implies that each article's ID should be greater than or equal to the next article's ID in the list. Any deviation from this descending order flags the validation as a failure.

## Optimizations

During the development of this script, several optimizations were considered and implemented:

* **Direct ID Extraction:** Initially, there was an attempt to extract the article's "age" (e.g., "X minutes ago") and ID by navigating to a specific link within the article's subtext. This proved prone to timeouts and complex selector issues due to the dynamic nature of the page. Refactoring to directly extract the `id` attribute from the main `.athing` element significantly improved the script's **robustness and performance**, simplifying the DOM traversal and eliminating unreliable nested waits.
* **Efficient Waiting Strategies:** Utilizing `page.waitForSelector()` for initial page load and `page.waitForLoadState('networkidle')` after "More" clicks ensures the script waits effectively for content without relying on arbitrary `setTimeout` calls, leading to faster and more reliable execution.
* **Duplicate Prevention:** Implementing a check (`articles.some(a => a.id === articleId)`) to avoid adding duplicate article IDs to the collection array ensures that the final validation is performed on a clean, unique set of articles, even when repeatedly scraping the same elements after pagination.

## Lessons Learned:

Building this project reinforced several key lessons:

* **Importance of Robust Selectors:** The biggest learning curve was identifying and refining Playwright selectors that are resilient to minor page structure variations and timing issues. Directly targeting stable attributes like `id` on primary elements is often superior to navigating complex, nested DOM paths.
* **Handling Dynamic Content:** Effectively dealing with pagination and dynamically loaded content (like the "More" button on Hacker News) is fundamental for realistic web automation. Understanding Playwright's waiting mechanisms (`waitForLoadState`, `waitForSelector`, `waitForFunction`) is crucial for reliable interaction.
* **Debugging Playwright Timeouts:** Persistent `TimeoutError` messages taught the importance of systematically debugging selector issues and ensuring proper waiting strategies are in place for all elements the script interacts with.
* **Understanding Website Structure:** A deep dive into Hacker News's HTML structure (via browser developer tools) was invaluable. Realizing the sequential nature of Hacker News article IDs provided a simpler and more reliable metric for sorting validation than parsing human-readable time strings.