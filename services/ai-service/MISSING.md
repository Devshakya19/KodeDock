# KodeDock AI Service — Missing Features & Implementation Roadmap

This document outlines the architectural gaps, empty endpoint stubs (`# TODO`), missing machine learning pipelines, and the implementation roadmap for the **AI & Semantic Search Service (Python / FastAPI)** in **KodeDock**.

---

## 📊 Feature Status & Priority Matrix

| Feature | Current Status | Impact / Gap | Priority |
| :--- | :---: | :--- | :---: |
| **FastAPI Skeleton & CORS** | ✅ Implemented | API routing, body size limiter (1MB) | - |
| **SlowAPI Rate Limiting** | ✅ Implemented | 30 req/min limit per endpoint | - |
| **Semantic Code Search** | ❌ **Empty Stub (`TODO`)** | Returns empty `products: []` | 🔴 **Critical** |
| **Personalized Recommendations** | ❌ **Empty Stub (`TODO`)** | Returns empty `products: []` | 🔴 **Critical** |
| **Marketplace Demand Analytics** | ❌ **Empty Stub (`TODO`)** | Returns hardcoded 0s | 🟡 **Medium** |
| **PostgreSQL Database Connection** | ❌ **Missing** | Cannot query products or orders table | 🔴 **Critical** |
| **Vector Embeddings Pipeline** | ❌ **Missing** | No model (Sentence-Transformers / Gemini) | 🔴 **High** |
| **Automated Code Security Scanner** | ❌ **Missing** | Cannot scan uploaded code for leaked keys | 🟢 **Low** |

---

## 🚨 1. Critical Empty Endpoints & Gaps

### 1.1. Semantic Code Search (`POST /api/search/`)
* **Current Code:**
  ```python
  # Line 24 in search.py:
  # TODO: Implement AI-powered search
  return SearchResponse(products=[], total=0, query=body.query)
  ```
* **Required Implementation:**
  1. Generate vector embeddings for incoming natural language queries (e.g., *"SaaS starter kit with Stripe and Next.js"*).
  2. Perform Cosine Similarity vector search against product embeddings stored in PostgreSQL `pgvector` or Qdrant/FAISS.
  3. Combine vector semantic search with PostgreSQL Full-Text Search (Hybrid Search) for exact keyword matches.
  4. Return ranked product listings with relevance scores.

---

### 1.2. Recommendation Engine (`GET /api/recommendations/{user_id}`)
* **Current Code:**
  ```python
  # Line 16 in recommendations.py:
  # TODO: Implement recommendation engine
  return RecommendationResponse(products=[], algorithm="popular")
  ```
* **Required Implementation:**
  1. **Content-Based Filtering:** Match user's preferred tech stacks (e.g., Python, Rust, React) with top-rated marketplace assets.
  2. **Collaborative Filtering:** *"Users who bought this boilerplate also purchased..."* based on `orders` history.
  3. **Trending / Velocity Score:** Rank products gaining rapid recent purchases and positive 5-star reviews.

---

### 1.3. Marketplace Demand & Analytics (`GET /api/analytics/dashboard`)
* **Current Code:**
  ```python
  # Line 18 in analytics.py:
  # TODO: Implement real analytics
  return AnalyticsResponse(total_users=0, total_products=0, total_orders=0, total_revenue=0)
  ```
* **Required Implementation:**
  1. Track search queries with zero results in Redis to highlight **Unfulfilled Marketplace Demand** for sellers.
  2. Aggregate total platform search conversion rates (Search ➔ View ➔ Purchase).

---

## 🧠 2. Missing Machine Learning & Database Infrastructure

### 2.1. Embeddings & ML Model Dependencies
* Currently `requirements.txt` has no AI libraries:
  - Add `sentence-transformers` (for local offline embeddings) or `google-genai` / `openai` client.
  - Add `numpy` and `scikit-learn` for similarity matrix calculations.

### 2.2. PostgreSQL DB Integration (`asyncpg` / `SQLAlchemy`)
* Add async PostgreSQL connection pool to fetch product titles, descriptions, categories, and tags.

### 2.3. Redis Embedding Cache
* Cache frequent query vectors in Redis to avoid re-generating embeddings for identical search phrases.

---

## 🗺️ Implementation Roadmap

1. **Phase 1 (Database & Hybrid Search):**
   - [ ] Connect `asyncpg` to PostgreSQL `products` table.
   - [ ] Implement Hybrid Search: PostgreSQL Full-Text Search + Keyword weighting.
2. **Phase 2 (Semantic Vector Search):**
   - [ ] Integrate Sentence-Transformers (`all-MiniLM-L6-v2`) or Gemini Embeddings API.
   - [ ] Generate embeddings for product `title` + `description` + `tags`.
3. **Phase 3 (Recommendations & Demand Tracking):**
   - [ ] Implement collaborative filtering on `orders` and `order_items`.
   - [ ] Track zero-result queries in Redis for seller demand insights.
