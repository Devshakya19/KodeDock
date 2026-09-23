import type http from "node:http";
import { pgPool } from "@kodedock/backend";
import type { ApiResponse } from "@kodedock/types";

/**
 * Handles all product catalog & marketplace routes
 */
export async function handleProductRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  searchParams: URLSearchParams
): Promise<boolean> {
  // -------------------------------------------------------------
  // 1. Dynamic Category Aggregation (/api/categories)
  // -------------------------------------------------------------
  if (pathname === "/api/categories" && req.method === "GET") {
    try {
      const sql = `
        SELECT category, COUNT(*)::int AS count
        FROM products
        WHERE status = 'PUBLISHED'
        GROUP BY category
        ORDER BY count DESC;
      `;
      const result = await pgPool.query(sql);

      res.writeHead(200, { "Content-Type": "application/json" });
      const response: ApiResponse<Array<{ category: string; count: number }>> = {
        success: true,
        data: result.rows,
      };
      res.end(JSON.stringify(response));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 2. Product Detail by Slug (/api/products/:slug)
  // -------------------------------------------------------------
  if (pathname.startsWith("/api/products/") && req.method === "GET") {
    const slug = pathname.replace("/api/products/", "").trim();
    if (!slug) return false;

    try {
      // Fetch product with seller info
      const productSql = `
        SELECT 
          p.id, p.title, p.slug, p.tagline, p.description, p.category,
          p.tech_stack, p.live_demo_url, p.thumbnail_url, p.preview_images,
          p.status, p.standard_price, p.extended_price, p.total_sales, p.avg_rating,
          p.created_at, p.updated_at,
          u.id AS seller_id, u.name AS seller_name, u.image AS seller_image, u.email AS seller_email
        FROM products p
        JOIN "user" u ON p.seller_id = u.id
        WHERE p.slug = $1 AND p.status = 'PUBLISHED'
        LIMIT 1;
      `;
      const productRes = await pgPool.query(productSql, [slug]);

      if (productRes.rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: { code: "NOT_FOUND", message: `Product "${slug}" not found.` },
          })
        );
        return true;
      }

      const product = productRes.rows[0];

      // Fetch version releases
      const versionsSql = `
        SELECT id, version, changelog, file_size_bytes, checksum_sha256, created_at
        FROM product_versions
        WHERE product_id = $1
        ORDER BY created_at DESC;
      `;
      const versionsRes = await pgPool.query(versionsSql, [product.id]);

      res.writeHead(200, { "Content-Type": "application/json" });
      const response: ApiResponse<any> = {
        success: true,
        data: {
          ...product,
          versions: versionsRes.rows,
          pricing: {
            standard: {
              paise: product.standard_price,
              formatted: `₹${(product.standard_price / 100).toLocaleString("en-IN")}`,
            },
            extended: product.extended_price
              ? {
                  paise: product.extended_price,
                  formatted: `₹${(product.extended_price / 100).toLocaleString("en-IN")}`,
                }
              : null,
          },
        },
      };
      res.end(JSON.stringify(response));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  // -------------------------------------------------------------
  // 3. Product Catalog List with Filters & Search (/api/products)
  // -------------------------------------------------------------
  if (pathname === "/api/products" && req.method === "GET") {
    try {
      const category = searchParams.get("category");
      const search = searchParams.get("search");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const sort = searchParams.get("sort") || "popular";

      const whereConditions: string[] = ["p.status = 'PUBLISHED'"];
      const queryParams: any[] = [];

      if (category && category !== "all") {
        queryParams.push(category);
        whereConditions.push(`p.category = $${queryParams.length}`);
      }

      if (search && search.trim()) {
        queryParams.push(`%${search.trim()}%`);
        const idx = queryParams.length;
        whereConditions.push(`(p.title ILIKE $${idx} OR p.tagline ILIKE $${idx} OR p.description ILIKE $${idx})`);
      }

      if (minPrice && !isNaN(Number(minPrice))) {
        queryParams.push(Number(minPrice) * 100); // convert INR to paise
        whereConditions.push(`p.standard_price >= $${queryParams.length}`);
      }

      if (maxPrice && !isNaN(Number(maxPrice))) {
        queryParams.push(Number(maxPrice) * 100); // convert INR to paise
        whereConditions.push(`p.standard_price <= $${queryParams.length}`);
      }

      let orderByClause = "ORDER BY p.total_sales DESC";
      if (sort === "newest") {
        orderByClause = "ORDER BY p.created_at DESC";
      } else if (sort === "price-low") {
        orderByClause = "ORDER BY p.standard_price ASC";
      } else if (sort === "price-high") {
        orderByClause = "ORDER BY p.standard_price DESC";
      } else if (sort === "rating") {
        orderByClause = "ORDER BY p.avg_rating DESC";
      }

      const sql = `
        SELECT 
          p.id, p.title, p.slug, p.tagline, p.category,
          p.tech_stack, p.live_demo_url, p.thumbnail_url,
          p.standard_price, p.extended_price, p.total_sales, p.avg_rating,
          p.created_at,
          u.id AS seller_id, u.name AS seller_name, u.image AS seller_image
        FROM products p
        JOIN "user" u ON p.seller_id = u.id
        WHERE ${whereConditions.join(" AND ")}
        ${orderByClause};
      `;

      const result = await pgPool.query(sql, queryParams);

      const formattedProducts = result.rows.map((row) => ({
        ...row,
        formatted_price: `₹${(row.standard_price / 100).toLocaleString("en-IN")}`,
        formatted_extended_price: row.extended_price
          ? `₹${(row.extended_price / 100).toLocaleString("en-IN")}`
          : null,
      }));

      res.writeHead(200, { "Content-Type": "application/json" });
      const response: ApiResponse<typeof formattedProducts> = {
        success: true,
        data: formattedProducts,
      };
      res.end(JSON.stringify(response));
      return true;
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: err.message } }));
      return true;
    }
  }

  return false;
}
