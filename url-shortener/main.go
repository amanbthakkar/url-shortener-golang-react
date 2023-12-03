package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/net/context"
)

var (
	redisClient *redis.Client
	uuidChannel chan string
	mu          sync.Mutex
)

func init() {
	// Initialize the redis client
	redisClient = redis.NewClient(&redis.Options{
		Addr: "redis-server:6379",
	})

	// Initialize the UUID channel
	uuidChannel = make(chan string, 100)
	go generateUUIDs()
}

func main() {
	app := fiber.New()

	app.Post("/", func(c *fiber.Ctx) error {
		var requestData map[string]string

		// Parse the JSON request body
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid JSON format")
		}

		url, ok := requestData["url"]
		if !ok {
			return c.Status(fiber.StatusBadRequest).SendString("Missing 'url' in request body")
		}

		// Check if URL is already shortened
		shortened, err := redisClient.HGet(context.Background(), "long_to_short", url).Result()
		if err == nil {
			// URL is already shortened
			return c.JSON(fiber.Map{
				"url":   url,
				"value": shortened,
				"code":  1, // Represents previously shortened URL
			})
		} else if err != redis.Nil {
			// Handle other errors
			log.Printf("Error checking if URL is shortened: %v", err)
			return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
		}

		// Acquire lock on the channel to generate a new UUID
		mu.Lock()
		defer mu.Unlock()
		newUUID := <-uuidChannel

		// Use the first 7 characters of the UUID as the "shortened" string
		shortened = newUUID[:7]

		// Store the URL with the UUID in the Redis hash (long to short)
		err = redisClient.HSet(context.Background(), "long_to_short", url, shortened).Err()
		if err != nil {
			log.Printf("Error storing long to short URL mapping in Redis: %v", err)
			return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
		}

		// Store the URL with the UUID in the Redis hash (short to long)
		err = redisClient.HSet(context.Background(), "short_to_long", shortened, url).Err()
		if err != nil {
			log.Printf("Error storing short to long URL mapping in Redis: %v", err)
			return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
		}

		return c.JSON(fiber.Map{
			"url":   url,
			"value": shortened,
			"code":  2, // Represents newly shortened URL
		})
	})

	app.Get("/", func(c *fiber.Ctx) error {
		// Get the shortened part of the URL from the request body
		var requestData map[string]string
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid JSON format")
		}

		shortened, ok := requestData["shortened"]
		if !ok {
			return c.Status(fiber.StatusBadRequest).SendString("Missing 'shortened' in request body")
		}

		// Check if the shortened URL is present in the Redis hash (short to long)
		originalURL, err := redisClient.HGet(context.Background(), "short_to_long", shortened).Result()
		if err == redis.Nil {
			// Shortened URL not found
			return c.Status(fiber.StatusNotFound).SendString("Shortened URL not found")
		} else if err != nil {
			// Handle other errors
			log.Printf("Error reading from Redis: %v", err)
			return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
		}

		// Redirect to the original URL
		return c.Redirect(originalURL, http.StatusFound)
	})

	app.Listen(":3000")
}

func generateUUIDs() {
	for {
		newUUID := uuid.New().String()
		uuidChannel <- newUUID
	}
}
