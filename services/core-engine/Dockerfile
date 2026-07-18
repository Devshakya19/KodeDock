FROM debian:bookworm-slim AS builder
RUN apt-get update && apt-get install -y curl build-essential pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
RUN useradd -r -s /bin/false appuser
COPY --from=builder /app/target/release/codehaat-core /usr/local/bin/
USER appuser
EXPOSE 4001
CMD ["codehaat-core"]
