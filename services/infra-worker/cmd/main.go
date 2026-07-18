package main

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"
)

func parseRedisURL(redisURL string) *redis.Options {
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	// Handle redis:// scheme
	if strings.HasPrefix(redisURL, "redis://") {
		u, err := url.Parse(redisURL)
		if err != nil {
			log.Printf("Warning: Failed to parse Redis URL: %v, using default", err)
			return &redis.Options{Addr: "localhost:6379"}
		}
		host := u.Hostname()
		port := u.Port()
		if port == "" {
			port = "6379"
		}
		opts := &redis.Options{
			Addr: fmt.Sprintf("%s:%s", host, port),
		}
		// Extract password from userinfo (redis://:password@host:port)
		if u.User != nil {
			if password, ok := u.User.Password(); ok && password != "" {
				opts.Password = password
			}
		}
		return opts
	}

	// Handle host:port format
	return &redis.Options{Addr: redisURL}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Connect to Redis
	redisURL := os.Getenv("REDIS_URL")
	opts := parseRedisURL(redisURL)

	rdb := redis.NewClient(opts)

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Connected to Redis")

	// Start job processors
	go processRepoTransferJobs(ctx, rdb)
	go processEmailJobs(ctx, rdb)

	log.Println("Infra Worker started. Waiting for jobs...")

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("Shutting down...")
	cancel()
}

func processRepoTransferJobs(ctx context.Context, rdb *redis.Client) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
			// TODO: Implement job processing from "repo_transfer" queue
			// Using BLPOP to wait for jobs (blocking pop)
			result, err := rdb.BLPop(ctx, 5*time.Second, "repo_transfer").Result()
			if err != nil {
				if err == redis.Nil {
					// No jobs, continue waiting
					continue
				}
				log.Printf("Error reading from repo_transfer queue: %v", err)
				time.Sleep(1 * time.Second)
				continue
			}
			if len(result) >= 2 {
				log.Printf("Processing repo transfer job: %s", result[1])
				// TODO: Process the job
			}
		}
	}
}

func processEmailJobs(ctx context.Context, rdb *redis.Client) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
			// Using BLPOP to wait for jobs (blocking pop)
			result, err := rdb.BLPop(ctx, 5*time.Second, "email").Result()
			if err != nil {
				if err == redis.Nil {
					continue
				}
				log.Printf("Error reading from email queue: %v", err)
				time.Sleep(1 * time.Second)
				continue
			}
			if len(result) >= 2 {
				log.Printf("Processing email job: %s", result[1])
				// TODO: Process the job
			}
		}
	}
}
