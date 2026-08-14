# ==============================================================
# STAGE 1: Build Environment & Dependency Caching
# ==============================================================
FROM rust:slim-bookworm AS builder

# Install build dependencies required by actix and sqlx
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Create a dummy project and copy only Cargo manifests
RUN cargo init --bin .
COPY Cargo.toml Cargo.lock ./

# 2. Build ONLY the dependencies.
# Docker will CACHE this layer heavily! 
# Unless Cargo.toml changes, Docker will never rebuild dependencies.
RUN cargo build --release
RUN rm src/*.rs

# 3. Now copy the actual source code
COPY src ./src

# 4. Update modification time of main.rs to force Cargo to rebuild our app,
# rather than thinking the dummy file from step 1 is still up-to-date.
RUN touch src/main.rs

# 5. Build the final application
RUN cargo build --release


# ==============================================================
# STAGE 2: Lightweight Runtime Environment
# ==============================================================
FROM debian:bookworm-slim

# Install runtime dependencies (certificates for HTTPS/APIs)
RUN apt-get update && apt-get install -y ca-certificates tzdata && rm -rf /var/lib/apt/lists/*

# Run as non-root user for security
RUN useradd -r -s /bin/false appuser

# Copy only the compiled binary from the builder stage
COPY --from=builder /app/target/release/codehaat-core /usr/local/bin/

USER appuser
EXPOSE 4001

CMD ["codehaat-core"]
