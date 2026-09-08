-- =============================================================================
-- KODEDOCK MIGRATION 010: PRODUCTION SEED PRODUCTS
-- Real curated boilerplates, templates, and microservices for the marketplace
-- Prices stored in BIGINT (Integer Paise): ₹1.00 = 100 Paise
-- =============================================================================

DO $$
DECLARE
    seller_uuid UUID := '00000000-0000-0000-0000-000000000001';
    cat_saas UUID;
    cat_web UUID;
    cat_mobile UUID;
    cat_backend UUID;
    cat_ai UUID;
    cat_devops UUID;
    cat_ui UUID;
BEGIN
    -- Ensure official verified studio user exists
    INSERT INTO users (id, email, full_name, role, github_username, is_verified)
    VALUES (seller_uuid, 'official@kodedock.com', 'KodeDock Studio', 'developer', 'kodedock-labs', TRUE)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (id, full_name, role, github_username, is_verified, bio)
    VALUES (seller_uuid, 'KodeDock Studio', 'developer', 'kodedock-labs', TRUE, 'Official vetted and security-audited enterprise boilerplates.')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO wallets (user_id, balance_paise)
    VALUES (seller_uuid, 0)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT id INTO cat_saas FROM categories WHERE slug = 'saas-starters';
    SELECT id INTO cat_web FROM categories WHERE slug = 'web-applications';
    SELECT id INTO cat_mobile FROM categories WHERE slug = 'mobile-apps';
    SELECT id INTO cat_backend FROM categories WHERE slug = 'backend-microservices';
    SELECT id INTO cat_ai FROM categories WHERE slug = 'ai-machine-learning';
    SELECT id INTO cat_devops FROM categories WHERE slug = 'devops-infra';
    SELECT id INTO cat_ui FROM categories WHERE slug = 'ui-components';

    -- 1. DockShip Next.js 15 SaaS Starter
    INSERT INTO products (
        seller_id, category_id, title, slug, description, long_description,
        price_paise, original_price_paise, tags, status,
        tech_stack, sales_count, view_count, rating, review_count, is_featured
    ) VALUES (
        seller_uuid, cat_saas,
        'DockShip - Next.js 15 Enterprise SaaS Starter',
        'dockship-nextjs-15-enterprise-saas-starter',
        'Production-ready Next.js 15 SaaS boilerplate with Stripe billing, multi-tenant auth, PostgreSQL, and Shadcn UI.',
        'DockShip is the gold standard for shipping modern B2B/B2C software in days instead of months. It includes full multi-tenant organization workspaces, RBAC role permissions, Stripe billing with customer portal integration, automated transactional emails with React Email, and database migrations via Prisma & PostgreSQL. Fully vetted and ready for production scale.',
        249900, 499900,
        ARRAY['saas', 'nextjs', 'typescript', 'stripe', 'auth', 'prisma'],
        'active',
        ARRAY['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Stripe', 'PostgreSQL', 'Prisma'],
        142, 1850, 4.90, 38, TRUE
    ) ON CONFLICT (slug) DO NOTHING;

    -- 2. RustAxum High-Throughput Microservice
    INSERT INTO products (
        seller_id, category_id, title, slug, description, long_description,
        price_paise, original_price_paise, tags, status,
        tech_stack, sales_count, view_count, rating, review_count, is_featured
    ) VALUES (
        seller_uuid, cat_backend,
        'RustAxum - High-Throughput Async Microservice Engine',
        'rustaxum-high-throughput-async-microservice-engine',
        'Ultra-fast async Rust microservice with JWT rotation, SQLx connection pooling, Redis caching, and Prometheus metrics.',
        'Built for mission-critical fintech and API gateways demanding sub-millisecond latencies. Features zero-allocation JSON serialization, automated OpenAPI documentation with Swagger UI, Redis rate limiting, JWT token family rotation, and health monitoring out of the box.',
        199900, 349900,
        ARRAY['rust', 'axum', 'sqlx', 'redis', 'high-performance', 'docker'],
        'active',
        ARRAY['Rust', 'Axum', 'SQLx', 'PostgreSQL', 'Redis', 'Docker'],
        89, 1240, 5.00, 24, TRUE
    ) ON CONFLICT (slug) DO NOTHING;

    -- 3. AgentFlow Autonomous RAG Pipeline Kit
    INSERT INTO products (
        seller_id, category_id, title, slug, description, long_description,
        price_paise, original_price_paise, tags, status,
        tech_stack, sales_count, view_count, rating, review_count, is_featured
    ) VALUES (
        seller_uuid, cat_ai,
        'AgentFlow - Autonomous Multi-Agent RAG Pipeline',
        'agentflow-autonomous-multi-agent-rag-pipeline',
        'Production AI workflow kit with LangChain, semantic memory, OpenAI/Claude tool routing, and streaming web UI.',
        'AgentFlow gives you an end-to-end multi-agent system equipped with vector search indexing in ChromaDB/Pinecone, autonomous tool calling, fallback retry logic, and an interactive Next.js chat playground featuring token-by-token streaming responses.',
        399900, 699900,
        ARRAY['ai', 'rag', 'langchain', 'llm', 'agents', 'fastapi'],
        'active',
        ARRAY['Python', 'LangChain', 'FastAPI', 'OpenAI', 'ChromaDB', 'Next.js'],
        210, 2900, 4.85, 52, TRUE
    ) ON CONFLICT (slug) DO NOTHING;

    -- 4. PulseKit Flutter Cross-Platform Starter
    INSERT INTO products (
        seller_id, category_id, title, slug, description, long_description,
        price_paise, original_price_paise, tags, status,
        tech_stack, sales_count, view_count, rating, review_count, is_featured
    ) VALUES (
        seller_uuid, cat_mobile,
        'PulseKit - Flutter iOS & Android Production Suite',
        'pulsekit-flutter-ios-android-production-suite',
        '40+ high-polish mobile screens with Riverpod state management, Supabase backend, and biometrics.',
        'A comprehensive Flutter starter kit built according to Google Material 3 and Apple HIG design standards. Includes dark/light mode toggle, push notifications with FCM, offline local cache, biometric authentication, and in-app purchase hooks.',
        149900, 299900,
        ARRAY['flutter', 'mobile', 'ios', 'android', 'riverpod', 'supabase'],
        'active',
        ARRAY['Flutter', 'Dart', 'Riverpod', 'Supabase', 'Firebase'],
        75, 960, 4.75, 19, FALSE
    ) ON CONFLICT (slug) DO NOTHING;

    -- 5. KubeForge Production Kubernetes & Terraform Kit
    INSERT INTO products (
        seller_id, category_id, title, slug, description, long_description,
        price_paise, original_price_paise, tags, status,
        tech_stack, sales_count, view_count, rating, review_count, is_featured
    ) VALUES (
        seller_uuid, cat_devops,
        'KubeForge - HA Kubernetes & Terraform Infrastructure',
        'kubeforge-ha-kubernetes-terraform-infrastructure',
        'Battle-tested GitOps infrastructure with Terraform, Helm charts, automated SSL cert-manager, and zero-downtime CI/CD.',
        'Complete infrastructure-as-code repository designed to launch highly available multi-region Kubernetes clusters on AWS EKS or GCP GKE. Comes preconfigured with Prometheus/Grafana observability, Ingress NGINX, Cert-Manager for Let''s Encrypt SSL, and GitHub Actions CD pipelines.',
        449900, 799900,
        ARRAY['devops', 'kubernetes', 'terraform', 'aws', 'helm', 'ci-cd'],
        'active',
        ARRAY['Terraform', 'Kubernetes', 'Helm', 'GitHub Actions', 'AWS'],
        98, 1420, 4.95, 31, TRUE
    ) ON CONFLICT (slug) DO NOTHING;

    -- 6. Veloce Radix & Tailwind UI System
    INSERT INTO products (
        seller_id, category_id, title, slug, description, long_description,
        price_paise, original_price_paise, tags, status,
        tech_stack, sales_count, view_count, rating, review_count, is_featured
    ) VALUES (
        seller_uuid, cat_ui,
        'Veloce - Radix UI & Tailwind Modern Component Kit',
        'veloce-radix-ui-tailwind-modern-component-kit',
        '65+ copy-paste accessible React components with Framer Motion micro-interactions and dark mode tokens.',
        'Elevate your web apps with beautifully engineered, WAI-ARIA compliant interactive components. Features custom command palettes, animated modals, dropdowns, data tables with sorting, and sleek form elements built on Radix primitives and Tailwind CSS.',
        0, 129900,
        ARRAY['react', 'tailwind', 'radix-ui', 'design-system', 'free'],
        'active',
        ARRAY['React', 'Tailwind CSS', 'Radix UI', 'Framer Motion', 'Storybook'],
        430, 4100, 4.90, 86, FALSE
    ) ON CONFLICT (slug) DO NOTHING;

END;
$$;
