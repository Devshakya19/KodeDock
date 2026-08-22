# Graph Report - KodeDock  (2026-08-22)

## Corpus Check
- 332 files · ~861,029 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1825 nodes · 3080 edges · 163 communities (100 shown, 63 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `34400ef1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- StorageClient
- verifyToken
- services/auth.rs
- search
- app-navbar.tsx
- fontSize
- slide_search_core.py
- extract_user_id
- api/client.ts
- seller/page.tsx
- models/mod.rs
- spacing
- main.py
- card.tsx
- TestTailwindConfigGenerator
- orders.rs
- button.tsx
- compilerOptions
- html-token-validator.py
- handlers/auth.rs
- cn
- developer/page.tsx
- BM25
- sellers/[id]/page.tsx
- TailwindConfigGenerator
- apiPost
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
- static-layout.tsx
- icon/generate.py
- gray
- create_review
- TestShadcnInstaller
- extract-colors.cjs
- validate-asset.cjs
- _sync_all.py
- 16
- validate-tokens.cjs
- button
- 1
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
- useProfile
- logo/generate.py
- generate-tokens.cjs
- 5
- ._base_config
- ApiResponse
- sync-brand-to-tokens.cjs
- _run
- 6
- BM25
- web/package.json
- proxy/[...path]/route.ts
- notifications.tsx
- main.go
- app/layout.tsx
- appearance.tsx
- PayoutSettings
- ProductDetailPage
- LoginPage
- ConnectionsSettings
- components/settings/layout.tsx
- RegisterPage
- radius
- .test_init_dry_run
- _generate_intelligent_overrides
- .test_add_components_no_components
- next
- health_check
- fix-new-components-theme.js
- fix-seller-theme.js
- fix-ultimate-theme.js
- test_sync_brand_to_tokens.py
- main
- shadow
- Bytes
- Data
- lg
- HttpRequest
- HttpResponse
- Json
- .__init__
- .temp_project
- setup.sh
- callback/route.ts
- login/route.ts
- register/route.ts
- .test_add_components_no_config
- .test_list_installed_with_components
- .test_init_default_project_root
- Option
- .test_check_shadcn_config_not_exists
- .test_get_installed_components_empty
- Path
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
- PgPool
- jose
- lucide-react
- react
- react-use
- sonner
- tailwindcss-animate
- test-docker.sh
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- github.com/kodedock/infra-worker
- kodedock-core
- xl
- md
- Query
- Result
- String
- Uuid

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
10. `apiPost()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `create_order()` --calls--> `extract_user_id()`  [INFERRED]
  services/core-engine/src/handlers/orders.rs → services/core-engine/src/middleware/mod.rs
- `verify_order()` --calls--> `extract_user_id()`  [INFERRED]
  services/core-engine/src/handlers/orders.rs → services/core-engine/src/middleware/mod.rs
- `list_orders()` --calls--> `extract_user_id()`  [INFERRED]
  services/core-engine/src/handlers/orders.rs → services/core-engine/src/middleware/mod.rs
- `get_order()` --calls--> `extract_user_id()`  [INFERRED]
  services/core-engine/src/handlers/orders.rs → services/core-engine/src/middleware/mod.rs
- `TestTailwindConfigGenerator` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .agents/skills/ui-styling/scripts/tailwind_config_gen.py

## Import Cycles
- None detected.

## Communities (163 total, 63 thin omitted)

### Community 0 - "StorageClient"
Cohesion: 0.09
Nodes (26): Client, Clone, get_profile(), Data, HttpRequest, HttpResponse, Json, Path (+18 more)

### Community 1 - "verifyToken"
Cohesion: 0.05
Nodes (39): SellerLayout(), fetchNotifications(), NotificationsPage(), EditProductPage(), handleDelete(), handleImageSelect(), handleSubmit(), BrowseFilters() (+31 more)

### Community 2 - "services/auth.rs"
Cohesion: 0.09
Nodes (47): dotenv, ioredis, jsonwebtoken, Key, KeyExtractionError, KeyExtractor, ServiceRequest, ForwardedIpKeyExtractor (+39 more)

### Community 3 - "search"
Cohesion: 0.07
Nodes (42): BM25, detect_domain(), get_cip_brief(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection (+34 more)

### Community 4 - "app-navbar.tsx"
Cohesion: 0.11
Nodes (19): CartItem, CartPopup(), getCart(), Props, saveCart(), getIcon(), Notification, NotificationPopup() (+11 more)

### Community 5 - "fontSize"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 6 - "slide_search_core.py"
Cohesion: 0.08
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 7 - "extract_user_id"
Cohesion: 0.07
Nodes (71): Display, Formatter, get_preferences(), list_notifications(), mark_all_read(), mark_read(), Data, HttpRequest (+63 more)

### Community 8 - "api/client.ts"
Cohesion: 0.06
Nodes (37): DeveloperRegisterPage(), handleRegister(), SellerHeader(), SellerHeaderProps, SellerEarningsPage(), Transaction, WalletData, OrderItem (+29 more)

### Community 9 - "seller/page.tsx"
Cohesion: 0.07
Nodes (24): Order, SalesChart(), SalesChartProps, SellerStatsDeck(), SellerStatsDeckProps, dynamic, Order, revalidate (+16 more)

### Community 10 - "models/mod.rs"
Cohesion: 0.13
Nodes (42): Decimal, From, create_or_update_payout_account(), delete_payout_account(), get_payout_account(), Data, HttpRequest, HttpResponse (+34 more)

### Community 11 - "spacing"
Cohesion: 0.09
Nodes (22): $type, $value, $type, $value, $type, $value, $type, $value (+14 more)

### Community 12 - "main.py"
Cohesion: 0.07
Nodes (28): exempt, middleware, post, health_check(), limit_body_size(), get, Request, AnalyticsResponse (+20 more)

### Community 13 - "card.tsx"
Cohesion: 0.11
Nodes (15): TODO: Implement email verification via backend, BLOG_POSTS, OPENINGS, CategoryPage(), formatSlug(), getCategoryProducts(), Product, Order (+7 more)

### Community 14 - "TestTailwindConfigGenerator"
Cohesion: 0.06
Nodes (16): Test adding colors multiple times., Test adding full color palette., Test adding custom spacing., Test adding custom breakpoints., Test TailwindConfigGenerator class., Test generating TypeScript configuration., Test validating config with empty theme extensions., Test writing configuration to file. (+8 more)

### Community 15 - "orders.rs"
Cohesion: 0.13
Nodes (33): Box, Bytes, CreateOrderRequest, Data, Error, HashMap, HttpRequest, HttpResponse (+25 more)

### Community 16 - "button.tsx"
Cohesion: 0.11
Nodes (24): PASSWORD_REQUIREMENTS, PASSWORD_REQUIREMENTS, PayoutAccountData, Transaction, WalletData, Product, Review, SearchPage() (+16 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 18 - "html-token-validator.py"
Cohesion: 0.13
Nodes (24): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+16 more)

### Community 19 - "handlers/auth.rs"
Cohesion: 0.21
Nodes (27): AuthResponse, change_password(), ChangePasswordRequest, delete_account(), forgot_password(), ForgotPasswordRequest, github_link(), github_oauth() (+19 more)

### Community 20 - "cn"
Cohesion: 0.14
Nodes (16): LandingNavbar(), cn(), CardAction(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), Label() (+8 more)

### Community 21 - "developer/page.tsx"
Cohesion: 0.19
Nodes (9): BENEFITS, DevBenefits(), COMPARISON, DevCommission(), DevCTA(), DevHero(), FEATURES, STATS (+1 more)

### Community 22 - "BM25"
Cohesion: 0.11
Nodes (19): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+11 more)

### Community 23 - "sellers/[id]/page.tsx"
Cohesion: 0.47
Nodes (5): getSellerProducts(), getSellerProfile(), Product, SellerProfile, SellerPublicPage()

### Community 24 - "TailwindConfigGenerator"
Cohesion: 0.10
Nodes (12): main(), Add custom font families. Args: fonts: Dict of font_type: [font_names] e.g.,…, Add custom spacing values. Args: spacing: Dict of name: value e.g., {'18':…, Add custom breakpoints. Args: breakpoints: Dict of name: width e.g., {'3xl':…, Add plugin requirements. Args: plugins: List of plugin names e.g.,…, Get plugin recommendations based on configuration. Returns: List of recommended…, Generate Tailwind CSS configuration files., Validate configuration. Returns: Tuple of (valid, message) (+4 more)

### Community 25 - "apiPost"
Cohesion: 0.07
Nodes (21): ForgotPasswordPage(), handleSubmit(), ResetPasswordForm(), handleSubmit(), NewProductPage(), handleSubmit(), SellerWalletPage(), handleWithdraw() (+13 more)

### Community 26 - "generate-slide.py"
Cohesion: 0.15
Nodes (19): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+11 more)

### Community 27 - "design_system.py"
Cohesion: 0.15
Nodes (18): ansi_ljust(), format_ascii_box(), format_markdown(), format_master_md(), generate_design_system(), hex_to_ansi(), persist_design_system(), Convert hex color to ANSI True Color swatch (██) with fallback. (+10 more)

### Community 28 - "color"
Cohesion: 0.04
Nodes (46): $type, $value, background, destructive, destructive-foreground, foreground, muted, muted-foreground (+38 more)

### Community 29 - "DesignSystemGenerator"
Cohesion: 0.14
Nodes (11): DesignSystemGenerator, Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation. variance/motion/density are…, Bucket a 1-10 dial value into its tier config. Returns None if value is None., Generates design system recommendations from aggregated searches. (+3 more)

### Community 30 - "(main)/page.tsx"
Cohesion: 0.11
Nodes (14): Categories(), FinalCTA(), GithubShowcase(), fadeInUp, Hero(), staggerContainer, HowItWorks(), SellerSection() (+6 more)

### Community 31 - "fetch-background.py"
Cohesion: 0.17
Nodes (17): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+9 more)

### Community 32 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 33 - "dependencies"
Cohesion: 0.12
Nodes (17): class-variance-authority, clsx, framer-motion, next-themes, radix-ui, react-dom, recharts, tailwind-merge (+9 more)

### Community 34 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+9 more)

### Community 35 - "index.js"
Cohesion: 0.12
Nodes (13): clients, heartbeatInterval, http, ipConnections, jwt, MAX_CONNECTIONS_PER_IP, pub, Redis (+5 more)

### Community 37 - "icon/generate.py"
Cohesion: 0.20
Nodes (15): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main() (+7 more)

### Community 38 - "gray"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 39 - "create_review"
Cohesion: 0.19
Nodes (15): create_review(), list_reviews(), notify_seller_on_review(), ReviewWithUser, Data, DateTime, HttpRequest, HttpResponse (+7 more)

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

### Community 44 - "16"
Cohesion: 0.67
Nodes (3): $type, $value, 16

### Community 45 - "validate-tokens.cjs"
Cohesion: 0.24
Nodes (11): extensions, formatReport(), fs, getFiles(), main(), parseArgs(), path, patterns (+3 more)

### Community 46 - "button"
Cohesion: 0.06
Nodes (45): $type, $value, $type, $value, bg, fg, font-size, hover-bg (+37 more)

### Community 47 - "1"
Cohesion: 0.67
Nodes (3): $type, $value, 1

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
Cohesion: 0.14
Nodes (13): dark, fast, normal, slow, $type, $value, $type, $value (+5 more)

### Community 55 - "patch"
Cohesion: 0.18
Nodes (6): Test adding components with overwrite flag., Test successful component addition., Test component addition with subprocess error., Test component addition when npx is not found., Test successful addition of all components., patch

### Community 56 - "test_tailwind_config_gen.py"
Cohesion: 0.22
Nodes (8): Tests for tailwind_config_gen.py, Reduce a generated TS/JS config to a bare assignable object so it can be handed…, Regression guard for the missing-comma bug between the ``theme`` block and…, The property preceding ``plugins`` must end with a comma (pure-Python check, so…, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs, parametrize

### Community 57 - "search"
Cohesion: 0.25
Nodes (10): detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search stack-specific guidelines, search() (+2 more)

### Community 58 - "useProfile"
Cohesion: 0.24
Nodes (6): ProfileSettings(), useProfile(), handleAutoFetchLocation(), handleAvatarUpload(), handleSubmit(), updateField()

### Community 59 - "logo/generate.py"
Cohesion: 0.29
Nodes (9): enhance_prompt(), generate_batch(), generate_logo(), load_env(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation Args: aspect_ratio:…, Generate multiple logo variants with different styles (+1 more)

### Community 60 - "generate-tokens.cjs"
Cohesion: 0.36
Nodes (9): flattenTokens(), fs, generateCSS(), generateTailwind(), main(), parseArgs(), path, resolveReference() (+1 more)

### Community 61 - "5"
Cohesion: 0.67
Nodes (3): $type, $value, 5

### Community 62 - "._base_config"
Cohesion: 0.22
Nodes (6): Path, Initialize generator. Args: typescript: If True, generate .ts config, else .js…, Determine default output path., Create base configuration structure., Get default content paths for framework., Any

### Community 63 - "ApiResponse"
Cohesion: 0.24
Nodes (6): ApiResponse, ApiResponse<T>, Option, Self, String, T

### Community 64 - "sync-brand-to-tokens.cjs"
Cohesion: 0.33
Nodes (8): adjustBrightness(), { execFileSync }, extractColorsFromMarkdown(), fs, generateColorScale(), main(), path, updateDesignTokens()

### Community 65 - "_run"
Cohesion: 0.28
Nodes (8): Path, Regression tests for validate-tokens.cjs. The validator used to skip any line…, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation(), CompletedProcess

### Community 66 - "6"
Cohesion: 0.67
Nodes (3): $type, $value, 6

### Community 67 - "BM25"
Cohesion: 0.28
Nodes (5): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query

### Community 68 - "web/package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

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

### Community 80 - "radius"
Cohesion: 0.29
Nodes (8): $type, $value, $type, $value, radius, full, none, none

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

### Community 91 - "shadow"
Cohesion: 0.27
Nodes (10): $type, $value, sm, shadow, default, sm, default, sm (+2 more)

### Community 94 - "lg"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 157 - "xl"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 158 - "md"
Cohesion: 0.67
Nodes (4): $type, $value, md, md

## Knowledge Gaps
- **317 isolated node(s):** `kodedock-core`, `BrowseFiltersProps`, `ProductCardProps`, `Product`, `ProductGridProps` (+312 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `extract_user_id()` connect `extract_user_id` to `StorageClient`, `get_product`, `create_review`, `orders.rs`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `primitive` connect `primitive` to `fontSize`, `gray`, `spacing`, `radius`, `shadow`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TailwindConfigGenerator` (e.g. with `TestGeneratedConfigIsValidJs` and `TestTailwindConfigGenerator`) actually correct?**
  _`TailwindConfigGenerator` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `kodedock-core`, `BrowseFiltersProps`, `ProductCardProps` to the rest of the system?**
  _317 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StorageClient` be split into smaller, more focused modules?**
  _Cohesion score 0.08571428571428572 - nodes in this community are weakly interconnected._
- **Should `verifyToken` be split into smaller, more focused modules?**
  _Cohesion score 0.05310734463276836 - nodes in this community are weakly interconnected._
- **Should `services/auth.rs` be split into smaller, more focused modules?**
  _Cohesion score 0.08784313725490196 - nodes in this community are weakly interconnected._