
# URL Shortener

This is a URL shortening service that allows users to input a long URL and receive a shortened URL in return. It is built using Golang and utilizes the Fiber web framework for high performance and concurrency.

## Functionality

-   Users can submit a URL via a POST request to the  `/`  endpoint. This will generate a unique 7 character ID that maps to the original URL
-   Users can visit the shortened URL (e.g.  `example.com/abc1234`) and get automatically redirected to the original long URL
-   Shortened URLs are stored in a Redis hash map with automatic expiration for cache management
-   New unique IDs are generated concurrently using goroutines and channels to improve performance

## Technologies

-   **Fiber**  - High performance Go web framework building the API endpoints
-   **Goroutines**  - Lightweight threads used to generate IDs concurrently
-   **Redis**  - In-memory data structure store to map shortened IDs to original URLs
-   **UUID**  - Generates randomized unique IDs
-   **CORS**  - Enable cross-origin resource sharing

## Shortening Process

When a URL shortening request comes in:

1.  Validate URL and return error if invalid
2.  Check Redis if the URL was shortened before
    -   If it exists, return the shortened URL. If not, continue
3.  Generate a new Unique ID
    -   Acquire lock to read channel
    -   Read new ID from channel
    -   Release lock
    - Start a goroutine to simultaneously replenish the channel with a new UUID  
4.  Save to Redis - Map long URL to short ID
5.  Return the shortened URL



This allows high performance concurrency with goroutines while avoiding collisions.

## Redirect Process

When a user visits a shortened URL:

1.  Extract the short ID code
2.  Lookup the ID in Redis to find the original URL
3.  If found - Redirect the user
4.  If not found - Return 404 error and navigate back to home page

## Frontend

The React frontend allows users to:

-   Input a long URL
-   Get back shortened URL
-   Click to copy shortened URL
-   View what original URLs redirect to

## Upcoming Work

Future plans include:

-   Rate limiting to prevent abuse
- Prevent looping via URL sanitization (maybe on the front-end itself?)
-   Custom short URL codes
-   Analytics on URL visits
-   Configurable expiration times