FROM golang:1.23 AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /infra-worker ./cmd/main.go

FROM alpine:3.20
RUN apk --no-cache add ca-certificates && \
    adduser -D -H appuser
COPY --from=builder /infra-worker /usr/local/bin/
USER appuser
EXPOSE 4003
CMD ["infra-worker"]
