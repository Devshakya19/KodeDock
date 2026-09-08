# ==============================================================
# STAGE 1: Build Environment & Dependency Caching
# ==============================================================
FROM rust:slim-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache dependencies by building a dummy project first
RUN mkdir src && echo "fn main() {}" > src/main.rs && touch src/lib.rs
COPY Cargo.toml Cargo.lock ./
RUN cargo build --release && rm -rf src

# Copy actual source code and rebuild
COPY src ./src
RUN touch src/main.rs src/lib.rs && cargo build --release

# ==============================================================
# STAGE 2: Ultra-Lightweight Production Runtime
# ==============================================================
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tzdata curl && rm -rf /var/lib/apt/lists/*

RUN useradd -r -s /bin/false appuser
COPY --from=builder /app/target/release/kodedock-core /usr/local/bin/

USER appuser
EXPOSE 4001

CMD ["kodedock-core"]
