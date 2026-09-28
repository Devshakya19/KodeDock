import type http from "node:http";
import crypto from "node:crypto";
import { pgPool } from "@kodedock/backend";
import type { ApiResponse } from "@kodedock/types";
import { requireRole } from "../middlewares/auth.middleware";

function parseJsonBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Handles all Creator Studio endpoints (/api/studio/*)
 */
export async function handleStudioRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  searchParams: URLSearchParams
): Promise<boolean> {
  // Only handle /api/studio/* paths
  if (!pathname.startsWith("/api/studio")) {
    return false;
  }

  // Enforce SELLER role on all studio routes
  const authContext = await requireRole(req, res, ["SELLER"]);
  if (!authContext) return true; // Auth middleware handles the response
  const sellerId = authContext.user.id;

  // -------------------------------------------------------------
  // 1. Studio Key Stats (/api/studio/stats)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/stats" && req.method === "GET") {
    try {
      // Aggregate real sales and listings from PostgreSQL
      const salesQuery = await pgPool.query(`
        SELECT 
          COALESCE(SUM(o.amount), 0)::bigint AS total_gross_paise,
          COUNT(*)::int AS total_sales_count
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.payment_status = 'COMPLETED' AND p.seller_id = $1;
      `, [sellerId]);

      const productsQuery = await pgPool.query(`
        SELECT COUNT(*)::int AS active_listings_count
        FROM products
        WHERE status = 'PUBLISHED' AND seller_id = $1;
      `, [sellerId]);

      const payoutsQuery = await pgPool.query(`
        SELECT 
          COALESCE(SUM(amount), 0)::bigint AS pending_payout_paise
        FROM seller_payouts
        WHERE status = 'PENDING' AND seller_id = $1;
      `, [sellerId]);

      const totalGross = Number(salesQuery.rows[0]?.total_gross_paise || 0);
      const salesCount = Number(salesQuery.rows[0]?.total_sales_count || 0);
      const activeListings = Number(productsQuery.rows[0]?.active_listings_count || 0);
      const pendingPayout = Number(payoutsQuery.rows[0]?.pending_payout_paise || 0);

      res.writeHead(200, { "Content-Type": "application/json" });
      const response: ApiResponse = {
        success: true,
        data: {
          totalRevenuePaise: totalGross,
          formattedRevenue: `₹${(totalGross / 100).toLocaleString("en-IN")}`,
          totalSalesCount: salesCount,
          activeListingsCount: activeListings,
          pendingPayoutPaise: pendingPayout,
          formattedPendingPayout: `₹${(pendingPayout / 100).toLocaleString("en-IN")}`,
          viewsCount: 0,
        },
      };
      res.end(JSON.stringify(response));
      return true;
    } catch (err: any) {
      console.error("Failed to fetch studio stats:", err.message);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            totalRevenuePaise: 0,
            formattedRevenue: "₹0",
            totalSalesCount: 0,
            activeListingsCount: 0,
            pendingPayoutPaise: 0,
            formattedPendingPayout: "₹0",
            viewsCount: 0,
          },
        })
      );
      return true;
    }
  }

  // -------------------------------------------------------------
  // 2. Creator Products List (/api/studio/products)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/products" && req.method === "GET") {
    try {
      const sql = `
        SELECT 
          p.id,
          p.title,
          p.slug,
          p.tagline,
          p.category,
          p.tech_stack,
          p.status,
          p.standard_price,
          p.extended_price,
          p.total_sales,
          p.thumbnail_url,
          p.created_at,
          COALESCE(
            (SELECT version FROM product_versions WHERE product_id = p.id ORDER BY created_at DESC LIMIT 1),
            'v1.0.0'
          ) AS active_version
        FROM products p
        WHERE p.seller_id = $1
        ORDER BY p.created_at DESC;
      `;
      const result = await pgPool.query(sql, [sellerId]);

      const mapped = result.rows.map((r) => {
        const stdPrice = Number(r.standard_price || 0);
        const extPrice = r.extended_price ? Number(r.extended_price) : null;
        const totalSales = Number(r.total_sales || 0);
        const grossRevenue = totalSales * stdPrice;

        return {
          id: r.id,
          title: r.title,
          slug: r.slug,
          tagline: r.tagline,
          category: r.category,
          tech_stack: Array.isArray(r.tech_stack) ? r.tech_stack : [],
          status: r.status,
          standard_price: stdPrice,
          extended_price: extPrice,
          formatted_price: `₹${(stdPrice / 100).toLocaleString("en-IN")}`,
          formatted_extended_price: extPrice ? `₹${(extPrice / 100).toLocaleString("en-IN")}` : null,
          total_sales: totalSales,
          total_revenue_paise: grossRevenue,
          formatted_revenue: `₹${(grossRevenue / 100).toLocaleString("en-IN")}`,
          active_version: r.active_version,
          thumbnail_url: r.thumbnail_url,
          created_at: r.created_at,
        };
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: mapped }));
      return true;
    } catch (err: any) {
      console.error("Failed to fetch studio products:", err.message);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: [] }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 3. Publish New Product (/api/studio/products - POST)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/products" && req.method === "POST") {
    try {
      const body = await parseJsonBody<any>(req);
      const {
        title,
        slug,
        tagline,
        category,
        tech_stack = [],
        live_demo_url,
        github_repo_url,
        standard_price,
        extended_price,
        version = "v1.0.0",
        storage_key,
        checksum_sha256,
        changelog,
        thumbnail_url = "/kd.svg",
        description = "",
      } = body;

      if (!title || !slug || !tagline || !standard_price) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: { message: "Missing required product fields" } }));
        return true;
      }

      const productId = `prod_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;

      // 1. Insert product
      await pgPool.query(
        `INSERT INTO products (
          id, seller_id, title, slug, tagline, description, category,
          tech_stack, live_demo_url, thumbnail_url, preview_images, status,
          standard_price, extended_price, total_sales, avg_rating, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PUBLISHED', $12, $13, 0, 5.0, NOW(), NOW()
        ) ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          tagline = EXCLUDED.tagline,
          standard_price = EXCLUDED.standard_price,
          updated_at = NOW();`,
        [
          productId,
          sellerId,
          title,
          slug,
          tagline,
          description,
          category,
          JSON.stringify(tech_stack),
          live_demo_url,
          thumbnail_url,
          JSON.stringify([]),
          standard_price,
          extended_price || null,
        ]
      );

      // 2. Insert initial version
      if (storage_key && checksum_sha256) {
        const versionId = `ver_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;
        await pgPool.query(
          `INSERT INTO product_versions (
            id, product_id, version, changelog, storage_key, checksum_sha256, file_size_bytes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [versionId, productId, version, changelog, storage_key, checksum_sha256, 1024 * 1024 * 5]
        );
      }

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: { productId, slug } }));
      return true;
    } catch (err: any) {
      console.error("Failed to create studio product:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 4. Releases List (/api/studio/releases)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/releases" && req.method === "GET") {
    try {
      const sql = `
        SELECT 
          v.id,
          v.product_id,
          p.title AS product_title,
          v.version,
          v.changelog,
          v.checksum_sha256,
          v.file_size_bytes,
          v.created_at
        FROM product_versions v
        JOIN products p ON v.product_id = p.id
        WHERE p.seller_id = $1
        ORDER BY v.created_at DESC;
      `;
      const result = await pgPool.query(sql, [sellerId]);

      const mapped = result.rows.map((r) => ({
        id: r.id,
        productId: r.product_id,
        productTitle: r.product_title,
        version: r.version,
        changelog: r.changelog,
        checksumSha256: r.checksum_sha256,
        fileSizeBytes: Number(r.file_size_bytes || 0),
        createdAt: r.created_at,
      }));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: mapped }));
      return true;
    } catch (err: any) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: [] }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 5. Create Version Release (/api/studio/releases - POST)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/releases" && req.method === "POST") {
    try {
      const body = await parseJsonBody<any>(req);
      const { productId, version, storage_key, checksum_sha256, changelog } = body;

      if (!productId || !version || !storage_key || !checksum_sha256) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: { message: "Missing required release parameters" } }));
        return true;
      }

      // Verify the product belongs to this seller
      const productCheck = await pgPool.query(`SELECT id FROM products WHERE id = $1 AND seller_id = $2`, [productId, sellerId]);
      if (productCheck.rowCount === 0) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: { message: "Unauthorized to release version for this product" } }));
        return true;
      }

      const versionId = `ver_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;

      await pgPool.query(
        `INSERT INTO product_versions (
          id, product_id, version, changelog, storage_key, checksum_sha256, file_size_bytes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [versionId, productId, version, changelog, storage_key, checksum_sha256, 1024 * 1024 * 6]
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: { versionId, version } }));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 6. Creator Payouts (/api/studio/payouts)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/payouts" && req.method === "GET") {
    try {
      // Fetch payouts from PostgreSQL
      const sql = `
        SELECT 
          id, amount, platform_fee, status, payout_account, processed_at, created_at
        FROM seller_payouts
        WHERE seller_id = $1
        ORDER BY created_at DESC;
      `;
      const result = await pgPool.query(sql, [sellerId]);

      // Fetch stored UPI ID from user_settings JSONB
      const settingsRes = await pgPool.query(
        `SELECT creator_preferences FROM user_settings WHERE user_id = $1 LIMIT 1`,
        [sellerId]
      );
      const cp = settingsRes.rows[0]?.creator_preferences || {};
      const storedUpiId = cp.upi_id || "";

      let pendingPaise = 0;
      let totalDisbursedPaise = 0;

      const payouts = result.rows.map((r) => {
        const amt = Number(r.amount || 0);
        const fee = Number(r.platform_fee || 0);
        if (r.status === "PENDING") pendingPaise += amt;
        if (r.status === "COMPLETED") totalDisbursedPaise += amt;

        return {
          id: r.id,
          amountPaise: amt,
          platformFeePaise: fee,
          formattedAmount: `₹${(amt / 100).toLocaleString("en-IN")}`,
          status: r.status,
          payoutAccount: r.payout_account,
          processedAt: r.processed_at,
          createdAt: r.created_at,
        };
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            payouts,
            pendingBalancePaise: pendingPaise,
            totalWithdrawnPaise: totalDisbursedPaise,
            upiId: storedUpiId,
          },
        })
      );
      return true;
    } catch (err: any) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            payouts: [],
            pendingBalancePaise: 0,
            totalWithdrawnPaise: 0,
            upiId: "",
          },
        })
      );
      return true;
    }
  }

  // -------------------------------------------------------------
  // 7. Request Payout (/api/studio/payouts/request - POST)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/payouts/request" && req.method === "POST") {
    try {
      const body = await parseJsonBody<any>(req);
      const { amountPaise, payoutAccount = "" } = body;
      const payoutId = `pay_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;
      const fee = Math.round(Number(amountPaise) * 0.05);

      await pgPool.query(
        `INSERT INTO seller_payouts (
          id, seller_id, amount, platform_fee, status, payout_account, created_at
        ) VALUES ($1, $2, $3, $4, 'PROCESSING', $5, NOW())`,
        [payoutId, sellerId, amountPaise, fee, payoutAccount]
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: { payoutId, status: "PROCESSING" } }));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 8. Recent Sales (/api/studio/sales - GET)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/sales" && req.method === "GET") {
    try {
      const sql = `
        SELECT 
          o.id,
          p.title AS product_title,
          o.license_type,
          o.amount AS gross_paise,
          o.created_at
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.payment_status = 'COMPLETED' AND p.seller_id = $1
        ORDER BY o.created_at DESC
        LIMIT 10;
      `;
      const result = await pgPool.query(sql, [sellerId]);

      const sales = result.rows.map((r) => {
        const gross = Number(r.gross_paise || 0);
        const creatorShare = Math.round(gross * 0.95);
        return {
          id: r.id,
          orderNumber: `KD-${r.id.replace("ord_", "").toUpperCase().substring(0, 8)}`,
          productTitle: r.product_title,
          licenseType: r.license_type || "STANDARD",
          grossPaise: gross,
          creatorSharePaise: creatorShare,
          formattedCreatorShare: `₹${(creatorShare / 100).toLocaleString("en-IN")}`,
          createdAt: r.created_at,
        };
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: sales }));
      return true;
    } catch (err: any) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: [] }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 7. Creator Studio Settings Suite (/api/studio/settings)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/settings" && req.method === "GET") {
    try {
      // Ensure user_settings row exists
      await pgPool.query(
        `INSERT INTO user_settings (user_id, creator_preferences, updated_at)
         VALUES ($1, '{}'::jsonb, NOW())
         ON CONFLICT (user_id) DO NOTHING;`,
        [sellerId]
      );

      const userRes = await pgPool.query(
        `SELECT id, name, email, image, role, "createdAt" as created_at FROM "user" WHERE id = $1 LIMIT 1`,
        [sellerId]
      );
      const settingsRes = await pgPool.query(
        `SELECT gstin, pan, billing_address, city, state, notification_rules, creator_preferences, updated_at
         FROM user_settings WHERE user_id = $1 LIMIT 1`,
        [sellerId]
      );

      const u = userRes.rows[0] || {};
      const s = settingsRes.rows[0] || {};
      const cp = s.creator_preferences || {};
      const nr = s.notification_rules || {};

      const settingsData = {
        profile: {
          name: u.name || "Verified Creator",
          email: u.email || "creator@kodedock.local",
          image: u.image || "/kd.svg",
          bio: cp.bio || "",
          github_handle: cp.github_handle || "",
          twitter_handle: cp.twitter_handle || "",
          website_url: cp.website_url || "",
        },
        payouts: {
          payout_channel: cp.payout_channel || "UPI",
          upi_id: cp.upi_id || "",
          bank_name: cp.bank_name || "",
          bank_account_number: cp.bank_account_number || "",
          bank_ifsc: cp.bank_ifsc || "",
          bank_holder_name: cp.bank_holder_name || "",
          payout_threshold_inr: Number(cp.payout_threshold_inr) || 5000,
          revenue_split_percent: 95,
        },
        licensing: {
          algorithm: "Ed25519",
          default_standard_price_paise: Number(cp.default_standard_price_paise) || 499900,
          default_extended_price_paise: Number(cp.default_extended_price_paise) || 1499900,
          default_allowed_domains: Number(cp.default_allowed_domains) || 1,
          default_machine_seats: Number(cp.default_machine_seats) || 3,
        },
        storage: {
          provider: "Cloudflare R2",
          bucket_name: cp.bucket_name || "kodedock-private-vault",
          max_archive_mb: Number(cp.max_archive_mb) || 250,
          hmac_ttl_seconds: 60,
          checksum_algorithm: "SHA-256",
        },
        notifications: {
          notify_on_sale: nr["sale-instant"] !== false,
          notify_on_payout: nr["payout-confirm"] !== false,
          notify_on_release: nr["release-broadcast"] !== false,
          notify_on_review: nr["buyer-review"] !== false,
          webhook_url: cp.webhook_url || "",
        },
        tax: {
          legal_entity_type: cp.legal_entity_type || "INDIVIDUAL",
          gstin: s.gstin || "",
          pan: s.pan || "",
          billing_address: s.billing_address || "",
          city: s.city || "",
          state: s.state || "",
        },
        is_maintenance_mode: Boolean(cp.is_maintenance_mode),
        updated_at: s.updated_at || new Date().toISOString(),
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: settingsData }));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  if (pathname === "/api/studio/settings" && (req.method === "PATCH" || req.method === "PUT")) {
    try {
      const body = await parseJsonBody<any>(req);

      if (body.profile?.name || body.profile?.image) {
        const updates: string[] = [];
        const params: any[] = [];
        let pIdx = 1;

        if (body.profile.name) {
          updates.push(`name = $${pIdx++}`);
          params.push(body.profile.name.trim());
        }
        if (body.profile.image) {
          updates.push(`image = $${pIdx++}`);
          params.push(body.profile.image.trim());
        }
        updates.push(`"updatedAt" = NOW()`);
        params.push(sellerId);

        await pgPool.query(
          `UPDATE "user" SET ${updates.join(", ")} WHERE id = $${pIdx}`,
          params
        );
      }

      const currentRes = await pgPool.query(
        `SELECT gstin, pan, billing_address, city, state, notification_rules, creator_preferences
         FROM user_settings WHERE user_id = $1 LIMIT 1`,
        [sellerId]
      );
      const currentCp = currentRes.rows[0]?.creator_preferences || {};
      const currentNr = currentRes.rows[0]?.notification_rules || {};

      const newCp = {
        ...currentCp,
        ...(body.profile?.bio !== undefined && { bio: body.profile.bio.trim() }),
        ...(body.profile?.github_handle !== undefined && { github_handle: body.profile.github_handle.trim() }),
        ...(body.profile?.twitter_handle !== undefined && { twitter_handle: body.profile.twitter_handle.trim() }),
        ...(body.profile?.website_url !== undefined && { website_url: body.profile.website_url.trim() }),
        ...(body.payouts?.payout_channel !== undefined && { payout_channel: body.payouts.payout_channel }),
        ...(body.payouts?.upi_id !== undefined && { upi_id: body.payouts.upi_id.trim() }),
        ...(body.payouts?.bank_name !== undefined && { bank_name: body.payouts.bank_name.trim() }),
        ...(body.payouts?.bank_account_number !== undefined && { bank_account_number: body.payouts.bank_account_number.trim() }),
        ...(body.payouts?.bank_ifsc !== undefined && { bank_ifsc: body.payouts.bank_ifsc.trim() }),
        ...(body.payouts?.bank_holder_name !== undefined && { bank_holder_name: body.payouts.bank_holder_name.trim() }),
        ...(body.payouts?.payout_threshold_inr !== undefined && { payout_threshold_inr: Number(body.payouts.payout_threshold_inr) }),
        ...(body.licensing?.default_standard_price_paise !== undefined && { default_standard_price_paise: Number(body.licensing.default_standard_price_paise) }),
        ...(body.licensing?.default_extended_price_paise !== undefined && { default_extended_price_paise: Number(body.licensing.default_extended_price_paise) }),
        ...(body.licensing?.default_allowed_domains !== undefined && { default_allowed_domains: Number(body.licensing.default_allowed_domains) }),
        ...(body.licensing?.default_machine_seats !== undefined && { default_machine_seats: Number(body.licensing.default_machine_seats) }),
        ...(body.storage?.bucket_name !== undefined && { bucket_name: body.storage.bucket_name.trim() }),
        ...(body.storage?.max_archive_mb !== undefined && { max_archive_mb: Number(body.storage.max_archive_mb) }),
        ...(body.notifications?.webhook_url !== undefined && { webhook_url: body.notifications.webhook_url.trim() }),
        ...(body.tax?.legal_entity_type !== undefined && { legal_entity_type: body.tax.legal_entity_type }),
        ...(body.is_maintenance_mode !== undefined && { is_maintenance_mode: Boolean(body.is_maintenance_mode) }),
      };

      const newNr = {
        ...currentNr,
        ...(body.notifications?.notify_on_sale !== undefined && { "sale-instant": Boolean(body.notifications.notify_on_sale) }),
        ...(body.notifications?.notify_on_payout !== undefined && { "payout-confirm": Boolean(body.notifications.notify_on_payout) }),
        ...(body.notifications?.notify_on_release !== undefined && { "release-broadcast": Boolean(body.notifications.notify_on_release) }),
        ...(body.notifications?.notify_on_review !== undefined && { "buyer-review": Boolean(body.notifications.notify_on_review) }),
      };

      const gstin = body.tax?.gstin !== undefined ? body.tax.gstin.trim() : (currentRes.rows[0]?.gstin || null);
      const pan = body.tax?.pan !== undefined ? body.tax.pan.trim() : (currentRes.rows[0]?.pan || null);
      const billingAddress = body.tax?.billing_address !== undefined ? body.tax.billing_address.trim() : (currentRes.rows[0]?.billing_address || null);
      const city = body.tax?.city !== undefined ? body.tax.city.trim() : (currentRes.rows[0]?.city || null);
      const state = body.tax?.state !== undefined ? body.tax.state.trim() : (currentRes.rows[0]?.state || null);

      await pgPool.query(
        `INSERT INTO user_settings (
          user_id, gstin, pan, billing_address, city, state,
          notification_rules, creator_preferences, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          gstin = EXCLUDED.gstin,
          pan = EXCLUDED.pan,
          billing_address = EXCLUDED.billing_address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          notification_rules = EXCLUDED.notification_rules,
          creator_preferences = EXCLUDED.creator_preferences,
          updated_at = NOW();`,
        [sellerId, gstin, pan, billingAddress, city, state, JSON.stringify(newNr), JSON.stringify(newCp)]
      );

      const updatedData = {
        payouts: {
          payout_channel: newCp.payout_channel || "UPI",
          upi_id: newCp.upi_id || "",
          bank_name: newCp.bank_name || "",
          bank_account_number: newCp.bank_account_number || "",
          bank_ifsc: newCp.bank_ifsc || "",
          bank_holder_name: newCp.bank_holder_name || "",
          payout_threshold_inr: Number(newCp.payout_threshold_inr) || 5000,
          revenue_split_percent: 95,
        },
        licensing: {
          algorithm: newCp.licensing_algorithm || "Ed25519",
          default_standard_price_paise: Number(newCp.default_standard_price_paise) || 499900,
          default_extended_price_paise: Number(newCp.default_extended_price_paise) || 1499900,
          default_allowed_domains: Number(newCp.default_allowed_domains) || 1,
          default_machine_seats: Number(newCp.default_machine_seats) || 3,
        },
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Studio preferences persisted successfully", data: updatedData }));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 8. Studio CLI Deployment Tokens (/api/studio/api-keys)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/api-keys" && req.method === "GET") {
    try {
      const sql = `
        SELECT id, name, key_hint, permissions, expires_at, last_used_at, created_at
        FROM api_keys
        WHERE user_id = $1 AND role = 'SELLER'
        ORDER BY created_at DESC;
      `;
      const result = await pgPool.query(sql, [sellerId]);

      const tokens = result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        tokenMasked: `kd_studio_sec_${r.key_hint}••••••••`,
        createdAt: r.created_at,
        expiresIn: r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "Never",
        scopes: Array.isArray(r.permissions) ? r.permissions : ["packages:write", "releases:publish"],
        lastUsed: r.last_used_at ? new Date(r.last_used_at).toLocaleTimeString() : "Never",
        status: r.expires_at && new Date(r.expires_at) < new Date() ? "REVOKED" : "ACTIVE",
      }));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: tokens }));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  if (pathname === "/api/studio/api-keys" && req.method === "POST") {
    try {
      const body = await parseJsonBody<any>(req);
      const name = (body.name || "Studio CLI Deploy Key").trim();

      const hex = crypto.randomBytes(18).toString("hex");
      const fullToken = `kd_studio_sec_${hex}`;
      const keyHash = crypto.createHash("sha256").update(fullToken).digest("hex");
      const keyHint = hex.slice(0, 6);
      const id = `cli_${Date.now()}`;
      const expiryDays = Number(body.expiryDays) || 180;
      const expiresAt = body.expiryDays === "never" ? null : new Date(Date.now() + expiryDays * 86400 * 1000);
      const scopes = Array.isArray(body.scopes) && body.scopes.length > 0
        ? body.scopes
        : ["packages:write", "releases:publish", "telemetry:read"];

      await pgPool.query(
        `INSERT INTO api_keys (id, user_id, key_hash, key_hint, name, role, permissions, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, 'SELLER', $6::jsonb, $7, NOW());`,
        [id, sellerId, keyHash, keyHint, name, JSON.stringify(scopes), expiresAt]
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            id,
            name,
            token: fullToken,
            fullToken,
            tokenMasked: `kd_studio_sec_${keyHint}••••••••`,
            scopes,
            expiresAt,
            status: "ACTIVE",
          },
        })
      );
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  if (pathname === "/api/studio/api-keys" && req.method === "DELETE") {
    try {
      const body = await parseJsonBody<any>(req);
      const keyId = body.id || searchParams.get("id");

      if (!keyId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: { message: "Key ID required for revocation" } }));
        return true;
      }

      await pgPool.query(`DELETE FROM api_keys WHERE id = $1 AND user_id = $2`, [keyId, sellerId]);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Studio API token revoked successfully", data: { revokedId: keyId } }));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  return false;
}
