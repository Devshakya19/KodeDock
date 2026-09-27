import type http from "node:http";
import crypto from "node:crypto";
import { pgPool } from "@kodedock/backend";
import type { ApiResponse } from "@kodedock/types";

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
  // -------------------------------------------------------------
  // 1. Studio Key Stats (/api/studio/stats)
  // -------------------------------------------------------------
  if (pathname === "/api/studio/stats" && req.method === "GET") {
    try {
      // Aggregate real sales and listings from PostgreSQL
      const salesQuery = await pgPool.query(`
        SELECT 
          COALESCE(SUM(amount), 0)::bigint AS total_gross_paise,
          COUNT(*)::int AS total_sales_count
        FROM orders
        WHERE payment_status = 'COMPLETED';
      `);

      const productsQuery = await pgPool.query(`
        SELECT COUNT(*)::int AS active_listings_count
        FROM products
        WHERE status = 'PUBLISHED';
      `);

      const payoutsQuery = await pgPool.query(`
        SELECT 
          COALESCE(SUM(amount), 0)::bigint AS pending_payout_paise
        FROM seller_payouts
        WHERE status = 'PENDING';
      `);

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
        ORDER BY p.created_at DESC;
      `;
      const result = await pgPool.query(sql);

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

      // Ensure default verified creator exists in user table
      const sellerId = "usr_kodedock_creator";
      await pgPool.query(
        `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
         VALUES ($1, 'Verified Creator', 'creator@kodedock.local', 'SELLER', true, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [sellerId]
      );

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
        ORDER BY v.created_at DESC;
      `;
      const result = await pgPool.query(sql);

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
      const sql = `
        SELECT 
          id, amount, platform_fee, status, payout_account, processed_at, created_at
        FROM seller_payouts
        ORDER BY created_at DESC;
      `;
      const result = await pgPool.query(sql);

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
            upiId: "creator@okhdfcbank",
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
            upiId: "creator@okhdfcbank",
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
      const { amountPaise, payoutAccount = "UPI: creator@okhdfcbank" } = body;

      const sellerId = "usr_kodedock_creator";
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
        WHERE o.payment_status = 'COMPLETED'
        ORDER BY o.created_at DESC
        LIMIT 10;
      `;
      const result = await pgPool.query(sql);

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

  return false;
}
