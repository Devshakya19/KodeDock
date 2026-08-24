# Graph Report - KodeDock  (2026-08-24)

## Corpus Check
- 360 files · ~882,986 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2114 nodes · 3608 edges · 193 communities (130 shown, 63 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ae9f0ae2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Changelog
- verifyToken
- services/auth.rs
- search
- cn
- fontSize
- slide_search_core.py
- StorageClient
- button.tsx
- seller/page.tsx
- models/mod.rs
- spacing
- main.py
- notifications.tsx
- TestTailwindConfigGenerator
- PgPool
- apiPost
- compilerOptions
- html-token-validator.py
- handlers/auth.rs
- wallet.rs
- require_developer
- BM25
- wallet-popup.tsx
- TailwindConfigGenerator
- checkout/page.tsx
- generate-slide.py
- design_system.py
- color
- DesignSystemGenerator
- (main)/page.tsx
- fetch-background.py
- components.json
- dependencies
- devDependencies
- index.js
- radius
- icon/generate.py
- gray
- input
- TestShadcnInstaller
- extract-colors.cjs
- validate-asset.cjs
- _sync_all.py
- design-tokens-starter.json
- validate-tokens.cjs
- card
- button
- ShadcnInstaller
- .check_shadcn_config
- .generate_config_string
- get_product
- inject-brand-context.cjs
- embed-tokens.cjs
- primitive
- patch
- test_tailwind_config_gen.py
- search
- compilerOptions
- logo/generate.py
- generate-tokens.cjs
- auth/client.ts
- ._base_config
- Self
- sync-brand-to-tokens.cjs
- _run
- Bytes
- BM25
- web/package.json
- proxy/[...path]/route.ts
- Data
- main.go
- app/layout.tsx
- appearance.tsx
- PayoutSettings
- ProductDetailPage
- HttpRequest
- devDependencies
- components/settings/layout.tsx
- sm
- compilerOptions
- .test_init_dry_run
- _generate_intelligent_overrides
- .test_add_components_no_components
- HttpResponse
- health_check
- fix-new-components-theme.js
- fix-seller-theme.js
- fix-ultimate-theme.js
- test_sync_brand_to_tokens.py
- main
- Json
- mark_read
- Option
- lg
- dependencies
- static-layout.tsx
- react
- .__init__
- .temp_project
- setup.sh
- callback/route.ts
- login/route.ts
- register/route.ts
- .test_add_components_no_config
- .test_list_installed_with_components
- .test_init_default_project_root
- Path
- .test_check_shadcn_config_not_exists
- .test_get_installed_components_empty
- PgPool
- .test_add_fonts
- .test_recommend_plugins
- .test_recommend_plugins_nextjs
- .test_init_default_typescript
- .test_generate_javascript_config
- .test_generate_config_with_colors
- .test_generate_config_with_plugins
- .test_validate_config_valid
- .test_validate_config_no_content
- .test_write_config_creates_content
- .test_write_config_invalid_path
- .test_full_configuration_typescript
- .test_default_output_path_typescript
- .test_base_config_structure
- .test_default_content_paths_react
- .test_default_content_paths_vue
- Query
- Result
- String
- Uuid
- $type
- kodedock-hq/package.json
- radius
- realtime-service/package.json
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- github.com/kodedock/infra-worker
- kodedock-core
- xl
- destructive-foreground
- muted
- primary
- primary-foreground
- ring
- secondary-foreground
- include
- 2. Core Archetypes
- Result
- lib
- KodeDock HQ - System Architecture Blueprint
- Security, Audit Logs, and Workflows
- hq.rs
- create_review
- api/client.ts
- React + TypeScript + Vite
- none
- profile.tsx
- tailwindcss-animate
- Self
- kodedock-hq/tsconfig.json
- tsconfig.app.json
- HttpRequest
- HttpResponse
- Result
- String
- types
- ConnectionsSettings
- LoginPage
- RegisterPage

## God Nodes (most connected - your core abstractions)
1. `TailwindConfigGenerator` - 58 edges
2. `Button()` - 38 edges
3. `TestTailwindConfigGenerator` - 35 edges
4. `ShadcnInstaller` - 34 edges
5. `cn()` - 28 edges
6. `TestShadcnInstaller` - 26 edges
7. `apiGet()` - 26 edges
8. `Card()` - 23 edges
9. `CardContent()` - 22 edges
10. `extract_user_id()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `TestTailwindConfigGenerator` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .agents/skills/ui-styling/scripts/tailwind_config_gen.py
- `TestGeneratedConfigIsValidJs` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .agents/skills/ui-styling/scripts/tailwind_config_gen.py
- `TestShadcnInstaller` --uses--> `ShadcnInstaller`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_shadcn_add.py → .agents/skills/ui-styling/scripts/shadcn_add.py
- `handleWithdraw()` --calls--> `apiPost()`  [EXTRACTED]
  web/src/app/(seller)/seller/wallet/page.tsx → web/src/shared/lib/api/client.ts
- `handleReviewSubmit()` --calls--> `apiPost()`  [EXTRACTED]
  web/src/app/(shop)/products/[id]/page.tsx → web/src/shared/lib/api/client.ts

## Import Cycles
- None detected.

## Communities (193 total, 63 thin omitted)

### Community 0 - "Changelog"
Cohesion: 0.05
Nodes (43): [2026-08-11 / 2026-08-12] - Core Engine Initial Fixes & Rate Limiting, [2026-08-13] - Core Engine Security & Deep Audit Fixes, [2026-08-14] - Core Engine Final Deep Scan & Refinements, [2026-08-15] - Deferred Uploads, Schema Synchronization & UI Fixes, [2026-08-17] - Buyer Dashboard UI/UX Redesign & Navbar Updates, 🌓 Advanced Theming & Dark Mode Perfection, 🤖 Agent Guidelines & Open Source Workflows, 🛠️ Architecture & Build Verification (+35 more)

### Community 1 - "verifyToken"
Cohesion: 0.07
Nodes (31): SellerLayout(), fetchNotifications(), NotificationsPage(), BrowseFilters(), BrowseFiltersProps, CATEGORIES, ProductCard(), Product (+23 more)

### Community 2 - "services/auth.rs"
Cohesion: 0.28
Nodes (24): Claims, create_github_user(), create_user(), encrypt_github_token(), exchange_github_code(), fetch_github_user(), generate_token(), get_user_by_email() (+16 more)

### Community 3 - "search"
Cohesion: 0.07
Nodes (42): BM25, detect_domain(), get_cip_brief(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection (+34 more)

### Community 4 - "cn"
Cohesion: 0.09
Nodes (24): AppNavbar(), BUYER_NAV_PILLS, getCartCount(), getShortName(), NavbarProps, SELLER_NAV_ITEMS, LandingNavbar(), cn() (+16 more)

### Community 5 - "fontSize"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 6 - "slide_search_core.py"
Cohesion: 0.08
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 7 - "StorageClient"
Cohesion: 0.09
Nodes (26): Client, Clone, get_profile(), Data, HttpRequest, HttpResponse, Json, Path (+18 more)

### Community 8 - "button.tsx"
Cohesion: 0.13
Nodes (12): PASSWORD_REQUIREMENTS, PASSWORD_REQUIREMENTS, TODO: Implement email verification via backend, OPENINGS, fetchOrder(), Order, OrderDetailPage(), auth (+4 more)

### Community 9 - "seller/page.tsx"
Cohesion: 0.07
Nodes (25): GET(), Order, SalesChart(), SalesChartProps, SellerStatsDeck(), SellerStatsDeckProps, dynamic, Order (+17 more)

### Community 10 - "models/mod.rs"
Cohesion: 0.13
Nodes (38): Decimal, From, Self, CheckoutOrderResponse, CreateOrderRequest, CreatePayoutAccountRequest, CreateProductRequest, CreateReviewRequest (+30 more)

### Community 11 - "spacing"
Cohesion: 0.06
Nodes (34): $type, $value, $type, $value, $type, $value, $type, $value (+26 more)

### Community 12 - "main.py"
Cohesion: 0.07
Nodes (28): exempt, middleware, post, health_check(), limit_body_size(), get, Request, AnalyticsResponse (+20 more)

### Community 14 - "TestTailwindConfigGenerator"
Cohesion: 0.06
Nodes (16): Test adding colors multiple times., Test adding full color palette., Test adding custom spacing., Test adding custom breakpoints., Test TailwindConfigGenerator class., Test generating TypeScript configuration., Test validating config with empty theme extensions., Test writing configuration to file. (+8 more)

### Community 15 - "PgPool"
Cohesion: 0.07
Nodes (98): Box, Bytes, CreateOrderRequest, Data, Error, HashMap, HqDashboardStats, HqDispute (+90 more)

### Community 16 - "apiPost"
Cohesion: 0.11
Nodes (18): ForgotPasswordPage(), handleSubmit(), ResetPasswordForm(), handleSubmit(), handleDelete(), PayoutAccountData, SecuritySettings(), handleDeleteAccount() (+10 more)

### Community 17 - "compilerOptions"
Cohesion: 0.13
Nodes (15): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, module, moduleResolution (+7 more)

### Community 18 - "html-token-validator.py"
Cohesion: 0.13
Nodes (24): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+16 more)

### Community 19 - "handlers/auth.rs"
Cohesion: 0.21
Nodes (27): AuthResponse, change_password(), ChangePasswordRequest, delete_account(), forgot_password(), ForgotPasswordRequest, github_link(), github_oauth() (+19 more)

### Community 20 - "wallet.rs"
Cohesion: 0.12
Nodes (37): Display, Formatter, complete_topup_atomic(), create_topup(), get_balance(), list_transactions(), release_escrow(), Bytes (+29 more)

### Community 21 - "require_developer"
Cohesion: 0.23
Nodes (22): create_or_update_payout_account(), delete_payout_account(), get_payout_account(), Data, HttpRequest, HttpResponse, Json, PgPool (+14 more)

### Community 22 - "BM25"
Cohesion: 0.11
Nodes (19): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+11 more)

### Community 23 - "wallet-popup.tsx"
Cohesion: 0.13
Nodes (16): CartItem, CartPopup(), getCart(), Props, saveCart(), getIcon(), Notification, NotificationPopup() (+8 more)

### Community 24 - "TailwindConfigGenerator"
Cohesion: 0.10
Nodes (12): main(), Add custom font families. Args: fonts: Dict of font_type: [font_names] e.g.,…, Add custom spacing values. Args: spacing: Dict of name: value e.g., {'18':…, Add custom breakpoints. Args: breakpoints: Dict of name: width e.g., {'3xl':…, Add plugin requirements. Args: plugins: List of plugin names e.g.,…, Get plugin recommendations based on configuration. Returns: List of recommended…, Generate Tailwind CSS configuration files., Validate configuration. Returns: Tuple of (valid, message) (+4 more)

### Community 25 - "checkout/page.tsx"
Cohesion: 0.17
Nodes (10): CheckoutContent(), handleRazorpayPayment(), CheckoutOrderResponse, loadRazorpayScript(), Product, RazorpayCallbackResponse, RazorpayInstance, RazorpayOptions (+2 more)

### Community 26 - "generate-slide.py"
Cohesion: 0.15
Nodes (19): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+11 more)

### Community 27 - "design_system.py"
Cohesion: 0.15
Nodes (18): ansi_ljust(), format_ascii_box(), format_markdown(), format_master_md(), generate_design_system(), hex_to_ansi(), persist_design_system(), Convert hex color to ANSI True Color swatch (██) with fallback. (+10 more)

### Community 28 - "color"
Cohesion: 0.11
Nodes (19): $type, $value, background, destructive, foreground, muted-foreground, primary-hover, secondary (+11 more)

### Community 29 - "DesignSystemGenerator"
Cohesion: 0.14
Nodes (11): DesignSystemGenerator, Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation. variance/motion/density are…, Bucket a 1-10 dial value into its tier config. Returns None if value is None., Generates design system recommendations from aggregated searches. (+3 more)

### Community 30 - "(main)/page.tsx"
Cohesion: 0.07
Nodes (32): BENEFITS, DevBenefits(), COMPARISON, DevCommission(), DevCTA(), DevHero(), ProductCardProps, Product (+24 more)

### Community 31 - "fetch-background.py"
Cohesion: 0.17
Nodes (17): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+9 more)

### Community 32 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 33 - "dependencies"
Cohesion: 0.09
Nodes (23): framer-motion, jose, jspdf, jspdf-autotable, next, next-themes, radix-ui, react-use (+15 more)

### Community 34 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, eslint-config-prettier, eslint-plugin-prettier, @types/node, @types/react, prettier, @tailwindcss/postcss (+11 more)

### Community 35 - "index.js"
Cohesion: 0.12
Nodes (13): clients, heartbeatInterval, http, ipConnections, jwt, MAX_CONNECTIONS_PER_IP, pub, Redis (+5 more)

### Community 36 - "radius"
Cohesion: 0.19
Nodes (13): $type, $value, $type, $value, $type, $value, radius, shadow (+5 more)

### Community 37 - "icon/generate.py"
Cohesion: 0.20
Nodes (15): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main() (+7 more)

### Community 38 - "gray"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 39 - "input"
Cohesion: 0.20
Nodes (12): padding-x, padding-y, input, $type, $value, focus-ring, padding-x, padding-y (+4 more)

### Community 40 - "TestShadcnInstaller"
Cohesion: 0.14
Nodes (8): Test adding components in dry run mode., Test ShadcnInstaller class., Test adding all components without config., Test listing installed components without config., Test listing installed components when none exist., Test checking for existing shadcn config., Test getting installed components without config., TestShadcnInstaller

### Community 41 - "extract-colors.cjs"
Cohesion: 0.22
Nodes (11): calculateCompliance(), colorDistance(), displayPalette(), extractHexColors(), findNearestBrandColor(), fs, generateImageMagickCommand(), hexToRgb() (+3 more)

### Community 42 - "validate-asset.cjs"
Cohesion: 0.25
Nodes (13): checkManifest(), formatBytes(), formatOutput(), fs, main(), parseFilename(), path, RULES (+5 more)

### Community 43 - "_sync_all.py"
Cohesion: 0.29
Nodes (13): blend(), derive_row(), derive_ui_reasoning(), h2r(), is_dark(), lum(), on_color(), r2h() (+5 more)

### Community 44 - "design-tokens-starter.json"
Cohesion: 0.15
Nodes (12): component, $type, $value, dark, semantic, $schema, $type, $value (+4 more)

### Community 45 - "validate-tokens.cjs"
Cohesion: 0.24
Nodes (11): extensions, formatReport(), fs, getFiles(), main(), parseArgs(), path, patterns (+3 more)

### Community 46 - "card"
Cohesion: 0.20
Nodes (12): $type, $value, bg, bg, padding, shadow, card, bg (+4 more)

### Community 47 - "button"
Cohesion: 0.20
Nodes (10): fg, font-size, hover-bg, button, $type, $value, $type, $value (+2 more)

### Community 48 - "ShadcnInstaller"
Cohesion: 0.20
Nodes (7): main(), Handle shadcn/ui component installation., ShadcnInstaller, Tests for shadcn_add.py, Test adding components that are already installed., Test initialization with custom project root., Test getting installed components when files exist.

### Community 49 - ".check_shadcn_config"
Cohesion: 0.21
Nodes (6): Add all available shadcn/ui components. Args: overwrite: If True, overwrite…, List installed components. Returns: Tuple of (success, message with component…, Check if shadcn is initialized in project. Returns: True if components.json…, Get list of already installed components. Returns: List of installed component…, Read shadcn version from project package.json; fall back to a pinned default., Add shadcn/ui components. Args: components: List of component names to add…

### Community 50 - ".generate_config_string"
Cohesion: 0.20
Nodes (6): Generate configuration file content. Returns: Configuration file as string, Generate TypeScript configuration., Generate JavaScript configuration., Format plugins array for config. Validates each plugin name against a strict…, Add indentation to JSON string., Write configuration to file. Returns: Tuple of (success, message)

### Community 51 - "get_product"
Cohesion: 0.26
Nodes (11): get_product(), list_products(), ListProductsQuery, Data, HttpRequest, HttpResponse, Option, Path (+3 more)

### Community 52 - "inject-brand-context.cjs"
Cohesion: 0.31
Nodes (10): extractColorsFromTable(), extractCoreAttributes(), extractHexColors(), extractImageStyle(), extractTypography(), extractVoice(), fs, generatePromptAddition() (+2 more)

### Community 53 - "embed-tokens.cjs"
Cohesion: 0.18
Nodes (8): args, fs, minimal, MINIMAL_TOKENS, path, projectRoot, tokensPath, wrapStyle

### Community 54 - "primitive"
Cohesion: 0.18
Nodes (11): fast, normal, slow, $type, $value, $type, $value, primitive (+3 more)

### Community 55 - "patch"
Cohesion: 0.18
Nodes (6): Test adding components with overwrite flag., Test successful component addition., Test component addition with subprocess error., Test component addition when npx is not found., Test successful addition of all components., patch

### Community 56 - "test_tailwind_config_gen.py"
Cohesion: 0.22
Nodes (8): Tests for tailwind_config_gen.py, Reduce a generated TS/JS config to a bare assignable object so it can be handed…, Regression guard for the missing-comma bug between the ``theme`` block and…, The property preceding ``plugins`` must end with a comma (pure-Python check, so…, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs, parametrize

### Community 57 - "search"
Cohesion: 0.25
Nodes (10): detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search stack-specific guidelines, search() (+2 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 59 - "logo/generate.py"
Cohesion: 0.29
Nodes (9): enhance_prompt(), generate_batch(), generate_logo(), load_env(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation Args: aspect_ratio:…, Generate multiple logo variants with different styles (+1 more)

### Community 60 - "generate-tokens.cjs"
Cohesion: 0.36
Nodes (9): flattenTokens(), fs, generateCSS(), generateTailwind(), main(), parseArgs(), path, resolveReference() (+1 more)

### Community 61 - "auth/client.ts"
Cohesion: 0.13
Nodes (19): CategoryPage(), formatSlug(), getCategoryProducts(), Product, SearchPage(), SearchPageProps, searchProducts(), getSellerProducts() (+11 more)

### Community 62 - "._base_config"
Cohesion: 0.22
Nodes (6): Path, Initialize generator. Args: typescript: If True, generate .ts config, else .js…, Determine default output path., Create base configuration structure., Get default content paths for framework., Any

### Community 64 - "sync-brand-to-tokens.cjs"
Cohesion: 0.33
Nodes (8): adjustBrightness(), { execFileSync }, extractColorsFromMarkdown(), fs, generateColorScale(), main(), path, updateDesignTokens()

### Community 65 - "_run"
Cohesion: 0.28
Nodes (8): Path, Regression tests for validate-tokens.cjs. The validator used to skip any line…, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation(), CompletedProcess

### Community 67 - "BM25"
Cohesion: 0.28
Nodes (5): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query

### Community 68 - "web/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, format:check, lint, start (+1 more)

### Community 69 - "proxy/[...path]/route.ts"
Cohesion: 0.39
Nodes (8): ALLOWED_PREFIXES, DELETE(), GET(), isAllowedPath(), PATCH(), POST(), proxyRequest(), PUT()

### Community 71 - "main.go"
Cohesion: 0.43
Nodes (7): context.Context, redis.Client, redis.Options, main(), parseRedisURL(), processEmailJobs(), processRepoTransferJobs()

### Community 72 - "app/layout.tsx"
Cohesion: 0.29
Nodes (5): geistMono, geistSans, metadata, sora, ThemeProvider()

### Community 74 - "PayoutSettings"
Cohesion: 0.29
Nodes (3): PayoutSettings(), handleSave(), validate()

### Community 75 - "ProductDetailPage"
Cohesion: 0.39
Nodes (7): getCart(), ProductDetailPage(), handleAddToCart(), handleBuy(), handleRemoveFromCart(), handleReviewSubmit(), saveCart()

### Community 77 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/react-dom, typescript, vite, @vitejs/plugin-react (+10 more)

### Community 79 - "sm"
Cohesion: 0.60
Nodes (5): sm, sm, sm, $type, $value

### Community 80 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, jsx, module, moduleDetection (+10 more)

### Community 82 - "_generate_intelligent_overrides"
Cohesion: 0.33
Nodes (6): _detect_page_type(), format_page_override_md(), _generate_intelligent_overrides(), Format a page-specific override file with intelligent AI-generated content., Generate intelligent overrides based on page type using layered search. Uses…, Detect page type from context and search results.

### Community 85 - "health_check"
Cohesion: 0.60
Nodes (4): health_check(), Data, HttpResponse, PgPool

### Community 86 - "fix-new-components-theme.js"
Cohesion: 0.40
Nodes (3): fs, path, replacements

### Community 87 - "fix-seller-theme.js"
Cohesion: 0.40
Nodes (3): fs, path, replacements

### Community 88 - "fix-ultimate-theme.js"
Cohesion: 0.40
Nodes (3): fs, path, replacements

### Community 92 - "mark_read"
Cohesion: 0.33
Nodes (13): get_preferences(), list_notifications(), mark_all_read(), mark_read(), Data, HttpRequest, HttpResponse, Json (+5 more)

### Community 94 - "lg"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 95 - "dependencies"
Cohesion: 0.10
Nodes (21): class-variance-authority, clsx, dependencies, class-variance-authority, clsx, lucide-react, react, react-dom (+13 more)

### Community 96 - "static-layout.tsx"
Cohesion: 0.16
Nodes (3): BLOG_POSTS, StaticPageLayout(), StaticPageLayoutProps

### Community 97 - "react"
Cohesion: 0.05
Nodes (22): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, AuthContext, AuthContextType, Staff (+14 more)

### Community 131 - "$type"
Cohesion: 0.60
Nodes (5): $type, $value, border, border, border

### Community 132 - "kodedock-hq/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 133 - "radius"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 134 - "realtime-service/package.json"
Cohesion: 0.12
Nodes (15): dotenv, ioredis, dependencies, dotenv, ioredis, jsonwebtoken, ws, description (+7 more)

### Community 157 - "xl"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 158 - "destructive-foreground"
Cohesion: 0.67
Nodes (3): destructive-foreground, $type, $value

### Community 159 - "muted"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 160 - "primary"
Cohesion: 0.67
Nodes (3): primary, $type, $value

### Community 161 - "primary-foreground"
Cohesion: 0.67
Nodes (3): primary-foreground, $type, $value

### Community 162 - "ring"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 163 - "secondary-foreground"
Cohesion: 0.67
Nodes (3): secondary-foreground, $type, $value

### Community 164 - "include"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 165 - "2. Core Archetypes"
Cohesion: 0.22
Nodes (8): 1. The Paradigm Shift, 2. Core Archetypes, 3. Dynamic Role Creation System, A. OWNER (God Mode / Break-Glass), B. ADMIN (Operational Second-in-Command), C. SUB-ADMIN (Department Heads), D. STAFF (Granular Workers), Role-Based Access Control (RBAC) Matrix

### Community 167 - "lib"
Cohesion: 0.33
Nodes (6): lib, ES2023, DOM, dom.iterable, esnext, lib

### Community 168 - "KodeDock HQ - System Architecture Blueprint"
Cohesion: 0.40
Nodes (4): 1. Core Philosophy, 2. Infrastructure, 3. High-Level Modules (The Dynamic Sidebar), KodeDock HQ - System Architecture Blueprint

### Community 169 - "Security, Audit Logs, and Workflows"
Cohesion: 0.40
Nodes (4): 1. Immutable Audit Logging, 2. Sensitive Action Approvals (Maker-Checker Workflow), 3. Recommended Security Upgrades (For Future), Security, Audit Logs, and Workflows

### Community 170 - "hq.rs"
Cohesion: 0.38
Nodes (16): HqAuditLog, HqDashboardStats, HqDispute, HqFinanceStats, HqProduct, HqRole, HqStaff, HqSupportTicket (+8 more)

### Community 171 - "create_review"
Cohesion: 0.19
Nodes (15): create_review(), list_reviews(), notify_seller_on_review(), ReviewWithUser, Data, DateTime, HttpRequest, HttpResponse (+7 more)

### Community 172 - "api/client.ts"
Cohesion: 0.09
Nodes (26): DeveloperRegisterPage(), handleRegister(), SellerHeader(), SellerHeaderProps, SellerEarningsPage(), Transaction, WalletData, OrderItem (+18 more)

### Community 173 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 174 - "none"
Cohesion: 0.67
Nodes (4): $type, $value, none, none

### Community 176 - "profile.tsx"
Cohesion: 0.10
Nodes (16): EditProductPage(), handleImageSelect(), handleSubmit(), NewProductPage(), handleSubmit(), ProfileSettings(), ProfileData, useProfile() (+8 more)

### Community 178 - "tailwindcss-animate"
Cohesion: 0.67
Nodes (3): tailwindcss-animate, tailwindcss-animate, tailwindcss-animate

### Community 186 - "types"
Cohesion: 0.67
Nodes (3): types, node, vite/client

## Knowledge Gaps
- **421 isolated node(s):** `FinanceStats`, `Withdrawal`, `Product`, `Dispute`, `SupportTicket` (+416 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `extract_user_id()` connect `PgPool` to `StorageClient`, `create_review`, `get_product`, `wallet.rs`, `mark_read`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `primitive` connect `primitive` to `radius`, `fontSize`, `gray`, `spacing`, `design-tokens-starter.json`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `require_developer()` connect `require_developer` to `wallet.rs`, `PgPool`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TailwindConfigGenerator` (e.g. with `TestGeneratedConfigIsValidJs` and `TestTailwindConfigGenerator`) actually correct?**
  _`TailwindConfigGenerator` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `FinanceStats`, `Withdrawal`, `Product` to the rest of the system?**
  _421 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `verifyToken` be split into smaller, more focused modules?**
  _Cohesion score 0.06887755102040816 - nodes in this community are weakly interconnected._