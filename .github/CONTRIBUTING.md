# Contributing to KodeDock 🚀

First off, thank you for considering contributing to KodeDock! It's people like you that make KodeDock such a great platform.

## 🏗️ Architecture Overview
KodeDock is a modern, polyglot microservices platform consisting of:
- **Frontend**: Next.js (`/web`)
- **Core Engine**: Rust (`/services/core-engine`)
- **AI Service**: Python (`/services/ai-service`)
- **Infra Worker**: Go (`/services/infra-worker`)
- **Realtime Service**: Node.js (`/services/realtime-service`)

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Devshakya19/KodeDock.git
   cd KodeDock
   ```

2. **Start Infrastructure**:
   Make sure you have Docker installed.
   ```bash
   docker compose up -d
   ```

3. **Install Dependencies**:
   Navigate to the respective directories and install dependencies using `npm`, `cargo`, `pip`, or `go`.

## ✅ Pull Request Process
1. Ensure your code follows the established style guidelines.
2. Ensure you have tested your changes locally.
3. Our CI pipeline will automatically run linting, type-checking, and security scans (Hadolint, TruffleHog, Actionlint, Bandit, Clippy). **All checks must pass before merging.**
4. Update the `README.md` with details of changes to the interface or architecture, if applicable.
5. Create a Pull Request using our standard PR template.

## 🐞 Reporting Bugs
Use the Bug Report issue template. Please include logs, steps to reproduce, and your current environment.

## ✨ Suggesting Enhancements
Use the Feature Request issue template. Provide as much context as possible.

Thank you for contributing to KodeDock! 🎉
