# Graph Report - KodeDock  (2026-08-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1810 nodes · 3081 edges · 163 communities (114 shown, 49 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `43d7305d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 150
- Community 151
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162

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
- `TestTailwindConfigGenerator` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .agents/skills/ui-styling/scripts/tailwind_config_gen.py
- `TestGeneratedConfigIsValidJs` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .agents/skills/ui-styling/scripts/tailwind_config_gen.py
- `TestShadcnInstaller` --uses--> `ShadcnInstaller`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_shadcn_add.py → .agents/skills/ui-styling/scripts/shadcn_add.py
- `handleDelete()` --calls--> `apiDelete()`  [EXTRACTED]
  web/src/app/(seller)/seller/products/[id]/edit/page.tsx → web/src/shared/lib/api/client.ts
- `handleImageSelect()` --calls--> `uploadFile()`  [EXTRACTED]
  web/src/app/(seller)/seller/products/[id]/edit/page.tsx → web/src/shared/lib/api/upload.ts

## Import Cycles
- None detected.

## Communities (163 total, 49 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (68): Client, Clone, get_preferences(), list_notifications(), mark_all_read(), mark_read(), Data, HttpRequest (+60 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (10): BrowseFilters(), BrowseFiltersProps, CATEGORIES, ProductCard(), ProductCardProps, Product, ProductGrid(), ProductGridProps (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (47): dotenv, ioredis, jsonwebtoken, Key, KeyExtractionError, KeyExtractor, ServiceRequest, ForwardedIpKeyExtractor (+39 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (42): BM25, detect_domain(), get_cip_brief(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection (+34 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (35): CartItem, CartPopup(), getCart(), Props, saveCart(), getIcon(), Notification, NotificationPopup() (+27 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (37): Display, Formatter, complete_topup_atomic(), create_topup(), get_balance(), list_transactions(), release_escrow(), Bytes (+29 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (27): SellerHeader(), SellerHeaderProps, SellerEarningsPage(), Transaction, WalletData, OrderItem, OrderProduct, SellerOrdersPage() (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (26): Order, SalesChart(), SalesChartProps, SellerStatsDeck(), SellerStatsDeckProps, dynamic, Order, revalidate (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (34): Decimal, From, CheckoutOrderResponse, CreateOrderRequest, CreatePayoutAccountRequest, CreateProductRequest, CreateReviewRequest, ListTransactionsQuery (+26 more)

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (34): $type, $value, $type, $value, $type, $value, $type, $value (+26 more)

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (28): exempt, middleware, post, health_check(), limit_body_size(), get, Request, AnalyticsResponse (+20 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (12): LoginPage(), PASSWORD_REQUIREMENTS, RegisterPage(), TODO: Implement email verification via backend, BLOG_POSTS, OPENINGS, SearchPage(), SearchPageProps (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (16): Test adding colors multiple times., Test adding full color palette., Test adding custom spacing., Test adding custom breakpoints., Test TailwindConfigGenerator class., Test generating TypeScript configuration., Test validating config with empty theme extensions., Test writing configuration to file. (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (29): HashMap, Order, Product, complete_order_atomic(), create_order(), enqueue_repo_transfer(), get_order(), list_orders() (+21 more)

### Community 16 - "Community 16"
Cohesion: 0.11
Nodes (20): DeveloperRegisterPage(), handleRegister(), PASSWORD_REQUIREMENTS, Product, Review, getSellerProducts(), getSellerProfile(), Product (+12 more)

### Community 17 - "Community 17"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (24): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+16 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (27): AuthResponse, change_password(), ChangePasswordRequest, delete_account(), forgot_password(), ForgotPasswordRequest, github_link(), github_oauth() (+19 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (14): Transaction, Wallet, fadeInUp, staggerContainer, AddMoneyModal(), handleAddMoney(), AddMoneyModalProps, loadRazorpayScript() (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (13): BENEFITS, DevBenefits(), COMPARISON, DevCommission(), DevCTA(), DevHero(), FEATURES, COMPARISON (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (19): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (13): CategoryPage(), formatSlug(), getCategoryProducts(), Product, fetchOrder(), Order, OrderDetailPage(), SecuritySettings() (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.10
Nodes (12): main(), Add custom font families. Args: fonts: Dict of font_type: [font_names] e.g.,…, Add custom spacing values. Args: spacing: Dict of name: value e.g., {'18':…, Add custom breakpoints. Args: breakpoints: Dict of name: width e.g., {'3xl':…, Add plugin requirements. Args: plugins: List of plugin names e.g.,…, Get plugin recommendations based on configuration. Returns: List of recommended…, Generate Tailwind CSS configuration files., Validate configuration. Returns: Tuple of (valid, message) (+4 more)

### Community 25 - "Community 25"
Cohesion: 0.11
Nodes (17): ForgotPasswordPage(), handleSubmit(), ResetPasswordForm(), handleSubmit(), NewProductPage(), handleSubmit(), CheckoutContent(), handleRazorpayPayment() (+9 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (19): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+11 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (18): ansi_ljust(), format_ascii_box(), format_markdown(), format_master_md(), generate_design_system(), hex_to_ansi(), persist_design_system(), Convert hex color to ANSI True Color swatch (██) with fallback. (+10 more)

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (19): $type, $value, background, foreground, muted-foreground, primary, primary-hover, secondary (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (11): DesignSystemGenerator, Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation. variance/motion/density are…, Bucket a 1-10 dial value into its tier config. Returns None if value is None., Generates design system recommendations from aggregated searches. (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (11): Categories(), FinalCTA(), GH_STEPS, GithubShowcase(), Hero(), HowItWorks(), SellerSection(), TESTIMONIALS (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (17): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+9 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, next, next-themes, radix-ui, react-dom, recharts, tailwind-merge (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+9 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (13): clients, heartbeatInterval, http, ipConnections, jwt, MAX_CONNECTIONS_PER_IP, pub, Redis (+5 more)

### Community 37 - "Community 37"
Cohesion: 0.20
Nodes (15): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main() (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 39 - "Community 39"
Cohesion: 0.19
Nodes (15): create_review(), list_reviews(), notify_seller_on_review(), ReviewWithUser, Data, DateTime, HttpRequest, HttpResponse (+7 more)

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (8): Test adding components in dry run mode., Test ShadcnInstaller class., Test listing installed components without config., Test listing installed components when none exist., Test initialization with custom project root., Test checking for existing shadcn config., Test getting installed components when files exist., TestShadcnInstaller

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (11): calculateCompliance(), colorDistance(), displayPalette(), extractHexColors(), findNearestBrandColor(), fs, generateImageMagickCommand(), hexToRgb() (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.25
Nodes (13): checkManifest(), formatBytes(), formatOutput(), fs, main(), parseFilename(), path, RULES (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (13): blend(), derive_row(), derive_ui_reasoning(), h2r(), is_dark(), lum(), on_color(), r2h() (+5 more)

### Community 44 - "Community 44"
Cohesion: 0.15
Nodes (12): component, $type, $value, dark, semantic, $schema, $type, $value (+4 more)

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (11): extensions, formatReport(), fs, getFiles(), main(), parseArgs(), path, patterns (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (12): $type, $value, bg, bg, padding, shadow, card, bg (+4 more)

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (8): padding-x, input, $type, $value, focus-ring, padding-x, $type, $value

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (7): main(), Handle shadcn/ui component installation., ShadcnInstaller, Tests for shadcn_add.py, Test initialization with dry run mode., Test getting installed components without config., Test adding components with empty list.

### Community 49 - "Community 49"
Cohesion: 0.21
Nodes (6): Add all available shadcn/ui components. Args: overwrite: If True, overwrite…, List installed components. Returns: Tuple of (success, message with component…, Check if shadcn is initialized in project. Returns: True if components.json…, Get list of already installed components. Returns: List of installed component…, Read shadcn version from project package.json; fall back to a pinned default., Add shadcn/ui components. Args: components: List of component names to add…

### Community 50 - "Community 50"
Cohesion: 0.20
Nodes (6): Generate configuration file content. Returns: Configuration file as string, Generate TypeScript configuration., Generate JavaScript configuration., Format plugins array for config. Validates each plugin name against a strict…, Add indentation to JSON string., Write configuration to file. Returns: Tuple of (success, message)

### Community 51 - "Community 51"
Cohesion: 0.26
Nodes (11): get_product(), list_products(), ListProductsQuery, Data, HttpRequest, HttpResponse, Option, Path (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.31
Nodes (10): extractColorsFromTable(), extractCoreAttributes(), extractHexColors(), extractImageStyle(), extractTypography(), extractVoice(), fs, generatePromptAddition() (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.18
Nodes (8): args, fs, minimal, MINIMAL_TOKENS, path, projectRoot, tokensPath, wrapStyle

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (11): fast, normal, slow, $type, $value, $type, $value, primitive (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (6): Test adding components with overwrite flag., Test successful component addition., Test component addition with subprocess error., Test component addition when npx is not found., Test successful addition of all components., patch

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (8): Tests for tailwind_config_gen.py, Reduce a generated TS/JS config to a bare assignable object so it can be handed…, Regression guard for the missing-comma bug between the ``theme`` block and…, The property preceding ``plugins`` must end with a comma (pure-Python check, so…, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs, parametrize

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (10): detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search stack-specific guidelines, search() (+2 more)

### Community 58 - "Community 58"
Cohesion: 0.27
Nodes (5): ProfileSettings(), useProfile(), handleAutoFetchLocation(), handleAvatarUpload(), updateField()

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (9): enhance_prompt(), generate_batch(), generate_logo(), load_env(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation Args: aspect_ratio:…, Generate multiple logo variants with different styles (+1 more)

### Community 60 - "Community 60"
Cohesion: 0.36
Nodes (9): flattenTokens(), fs, generateCSS(), generateTailwind(), main(), parseArgs(), path, resolveReference() (+1 more)

### Community 61 - "Community 61"
Cohesion: 0.20
Nodes (10): fg, font-size, hover-bg, button, $type, $value, $type, $value (+2 more)

### Community 62 - "Community 62"
Cohesion: 0.22
Nodes (6): Path, Initialize generator. Args: typescript: If True, generate .ts config, else .js…, Determine default output path., Create base configuration structure., Get default content paths for framework., Any

### Community 63 - "Community 63"
Cohesion: 0.24
Nodes (6): ApiResponse, ApiResponse<T>, Option, Self, String, T

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (8): adjustBrightness(), { execFileSync }, extractColorsFromMarkdown(), fs, generateColorScale(), main(), path, updateDesignTokens()

### Community 65 - "Community 65"
Cohesion: 0.28
Nodes (8): Path, Regression tests for validate-tokens.cjs. The validator used to skip any line…, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation(), CompletedProcess

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (7): SellerLayout(), ShopLayout(), DashboardLayout(), Navbar(), NavbarProps, getSigningKey(), verifyToken()

### Community 67 - "Community 67"
Cohesion: 0.28
Nodes (5): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query

### Community 68 - "Community 68"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 69 - "Community 69"
Cohesion: 0.39
Nodes (8): ALLOWED_PREFIXES, DELETE(), GET(), isAllowedPath(), PATCH(), POST(), proxyRequest(), PUT()

### Community 71 - "Community 71"
Cohesion: 0.43
Nodes (7): context.Context, redis.Client, redis.Options, main(), parseRedisURL(), processEmailJobs(), processRepoTransferJobs()

### Community 72 - "Community 72"
Cohesion: 0.29
Nodes (5): geistMono, geistSans, metadata, sora, ThemeProvider()

### Community 74 - "Community 74"
Cohesion: 0.29
Nodes (3): PayoutSettings(), handleSave(), validate()

### Community 75 - "Community 75"
Cohesion: 0.39
Nodes (7): getCart(), ProductDetailPage(), handleAddToCart(), handleBuy(), handleRemoveFromCart(), handleReviewSubmit(), saveCart()

### Community 76 - "Community 76"
Cohesion: 0.29
Nodes (9): fetchNotifications(), NotificationsPage(), handleSubmit(), formatRelativeTime(), getNotificationConfig(), Notification, NotificationsList(), handleSubmit() (+1 more)

### Community 79 - "Community 79"
Cohesion: 0.36
Nodes (6): config, proxy(), ROLES, updateSession(), TokenClaims, verifyRequest()

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (8): $type, $value, $type, $value, radius, default, full, default

### Community 81 - "Community 81"
Cohesion: 0.36
Nodes (3): LinkedinIcon(), TwitterIcon(), Footer()

### Community 82 - "Community 82"
Cohesion: 0.33
Nodes (6): _detect_page_type(), format_page_override_md(), _generate_intelligent_overrides(), Format a page-specific override file with intelligent AI-generated content., Generate intelligent overrides based on page type using layered search. Uses…, Detect page type from context and search results.

### Community 83 - "Community 83"
Cohesion: 0.60
Nodes (5): $type, $value, border, border, border

### Community 84 - "Community 84"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 85 - "Community 85"
Cohesion: 0.60
Nodes (4): health_check(), Data, HttpResponse, PgPool

### Community 86 - "Community 86"
Cohesion: 0.40
Nodes (3): fs, path, replacements

### Community 87 - "Community 87"
Cohesion: 0.40
Nodes (3): fs, path, replacements

### Community 88 - "Community 88"
Cohesion: 0.40
Nodes (3): fs, path, replacements

### Community 91 - "Community 91"
Cohesion: 0.47
Nodes (6): sm, shadow, sm, sm, $type, $value

### Community 92 - "Community 92"
Cohesion: 0.67
Nodes (3): destructive-foreground, $type, $value

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 94 - "Community 94"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 95 - "Community 95"
Cohesion: 0.67
Nodes (3): primary-foreground, $type, $value

### Community 96 - "Community 96"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 97 - "Community 97"
Cohesion: 0.67
Nodes (3): secondary-foreground, $type, $value

### Community 107 - "Community 107"
Cohesion: 0.40
Nodes (3): EditProductPage(), handleDelete(), handleImageSelect()

### Community 110 - "Community 110"
Cohesion: 0.67
Nodes (4): padding-y, padding-y, $type, $value

### Community 157 - "Community 157"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 158 - "Community 158"
Cohesion: 0.67
Nodes (4): $type, $value, md, md

### Community 159 - "Community 159"
Cohesion: 0.67
Nodes (4): $type, $value, none, none

### Community 160 - "Community 160"
Cohesion: 0.67
Nodes (3): destructive, $type, $value

## Knowledge Gaps
- **317 isolated node(s):** `BrowseFiltersProps`, `ProductCardProps`, `Product`, `ProductGridProps`, `BrowsePageProps` (+312 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `primitive` connect `Community 54` to `Community 5`, `Community 38`, `Community 11`, `Community 44`, `Community 80`, `Community 91`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `extract_user_id()` connect `Community 0` to `Community 51`, `Community 7`, `Community 39`, `Community 15`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `color` connect `Community 38` to `Community 54`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TailwindConfigGenerator` (e.g. with `TestGeneratedConfigIsValidJs` and `TestTailwindConfigGenerator`) actually correct?**
  _`TailwindConfigGenerator` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BrowseFiltersProps`, `ProductCardProps`, `Product` to the rest of the system?**
  _317 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.052160493827160495 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08784313725490196 - nodes in this community are weakly interconnected._