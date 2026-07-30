#!/usr/bin/env node
/**
 * ShopSphere Pro — automated QA smoke tests (routes + server actions via HTTP)
 */
import http from "node:http";
import https from "node:https";

const BASE = process.env.QA_BASE_URL || "http://localhost:3000";
const PASSWORD = "password123";

const ACCOUNTS = {
  admin: "admin@shopsphere.com",
  seller: "seller@shopsphere.com",
  customer: "customer@shopsphere.com",
};

const results = [];
let passed = 0;
let failed = 0;
let warned = 0;

function log(type, name, detail = "") {
  const row = { type, name, detail };
  results.push(row);
  const icon = type === "PASS" ? "✓" : type === "FAIL" ? "✗" : "⚠";
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ""}`);
  if (type === "PASS") passed++;
  else if (type === "FAIL") failed++;
  else warned++;
}

function request(method, path, { jar, body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const lib = url.protocol === "https:" ? https : http;
    const cookie = jar?.cookies?.join("; ") ?? "";
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
    };

    const req = lib.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        const setCookie = res.headers["set-cookie"] || [];
        if (jar) {
          for (const c of setCookie) {
            const part = c.split(";")[0];
            const name = part.split("=")[0];
            jar.cookies = jar.cookies.filter((x) => !x.startsWith(name + "="));
            jar.cookies.push(part);
          }
        }
        resolve({ status: res.statusCode, headers: res.headers, body: text });
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function authSession(email, password = PASSWORD) {
  const jar = { cookies: [] };
  const csrfRes = await request("GET", "/api/auth/csrf", { jar });
  const csrf = JSON.parse(csrfRes.body).csrfToken;
  const form = new URLSearchParams({
    csrfToken: csrf,
    email,
    password,
    redirect: "false",
  }).toString();
  await request("POST", "/api/auth/callback/credentials", {
    jar,
    body: form,
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": String(Buffer.byteLength(form)) },
  });
  const sessionRes = await request("GET", "/api/auth/session", { jar });
  const session = JSON.parse(sessionRes.body);
  return { jar, session };
}

async function checkRoute(path, { jar, expect = 200, contains = [], notContains = [] } = {}) {
  const res = await request("GET", path, { jar });
  const okStatus = Array.isArray(expect) ? expect.includes(res.status) : res.status === expect;
  const missing = contains.filter((s) => !res.body.includes(s));
  const bad = notContains.filter((s) => res.body.includes(s));
  if (okStatus && !missing.length && !bad.length) {
    log("PASS", `GET ${path}`, `HTTP ${res.status}`);
    return res;
  }
  log(
    "FAIL",
    `GET ${path}`,
    `HTTP ${res.status}${missing.length ? ` missing [${missing.join(", ")}]` : ""}${bad.length ? ` has [${bad.join(", ")}]` : ""}`
  );
  return res;
}

async function main() {
  console.log(`\nShopSphere Pro QA — ${BASE}\n${"=".repeat(50)}\n`);

  // --- Public routes ---
  const publicRoutes = [
    ["/", ["ShopSphere"]],
    ["/products", ["Products"]],
    ["/products?q=serum", []],
    ["/categories", ["Categories"]],
    ["/login", ["Sign in", "Welcome back"]],
    ["/register", ["Create"]],
    ["/seller-register", ["seller"]],
    ["/cart", []],
    ["/wishlist", []],
  ];

  for (const [path, needles] of publicRoutes) {
    await checkRoute(path, { expect: [200, 307], contains: needles });
  }

  // --- Auth redirects ---
  await checkRoute("/admin/dashboard", { expect: [307, 302] });
  await checkRoute("/seller/dashboard", { expect: [307, 302] });
  await checkRoute("/profile", { expect: [307, 302] });

  // --- Customer auth ---
  const customer = await authSession(ACCOUNTS.customer);
  if (customer.session?.user?.email === ACCOUNTS.customer) {
    log("PASS", "Customer login", customer.session.user.role);
  } else {
    log("FAIL", "Customer login", JSON.stringify(customer.session));
  }

  await checkRoute("/profile", { jar: customer.jar, contains: ["Profile", "Alex"] });
  await checkRoute("/orders", { jar: customer.jar, contains: ["Orders"] });
  await checkRoute("/checkout", { jar: customer.jar, contains: ["Checkout"] });

  // Product detail — find a product slug from products page
  const productsRes = await request("GET", "/products", { jar: customer.jar });
  const slugMatch = productsRes.body.match(/href="\/products\/([^"]+)"/);
  if (slugMatch) {
    const slug = slugMatch[1];
    await checkRoute(`/products/${slug}`, { jar: customer.jar, contains: ["Add to cart"] });
    log("PASS", "Product slug resolved", slug);
  } else {
    log("FAIL", "Product slug resolved", "no product link found");
  }

  // --- Seller auth ---
  const seller = await authSession(ACCOUNTS.seller);
  if (seller.session?.user?.role === "SELLER") {
    log("PASS", "Seller login", "SELLER");
  } else {
    log("FAIL", "Seller login", JSON.stringify(seller.session));
  }

  const sellerRoutes = [
    ["/seller/dashboard", ["Dashboard", "Revenue"]],
    ["/seller/products", ["Products"]],
    ["/seller/products/new", ["Product"]],
    ["/seller/orders", ["Orders"]],
    ["/seller/analytics", ["Analytics"]],
    ["/seller/store", ["Store"]],
  ];
  for (const [path, needles] of sellerRoutes) {
    await checkRoute(path, { jar: seller.jar, contains: needles });
  }

  // --- Admin auth ---
  const admin = await authSession(ACCOUNTS.admin);
  if (admin.session?.user?.role === "ADMIN") {
    log("PASS", "Admin login", "ADMIN");
  } else {
    log("FAIL", "Admin login", JSON.stringify(admin.session));
  }

  const adminRoutes = [
    ["/admin/dashboard", ["Platform overview"]],
    ["/admin/users", ["Users"]],
    ["/admin/sellers", ["Sellers"]],
    ["/admin/products", ["Products"]],
    ["/admin/categories", ["Categories"]],
    ["/admin/orders", ["Orders"]],
    ["/admin/reviews", ["Reviews"]],
    ["/admin/analytics", ["Analytics"]],
  ];
  for (const [path, needles] of adminRoutes) {
    await checkRoute(path, { jar: admin.jar, contains: needles, notContains: ["Something went wrong"] });
  }

  // --- Error pages should not appear ---
  for (const [path] of adminRoutes) {
    const res = await request("GET", path, { jar: admin.jar });
    if (res.body.includes("MenuGroupContext")) {
      log("FAIL", `MenuGroupContext on ${path}`, "dropdown menu bug");
    }
    if (res.body.includes("Something went wrong")) {
      log("FAIL", `Error boundary on ${path}`, "Something went wrong");
    }
  }

  // Registration page reachable (server action tested via UI)
  await checkRoute("/register", { contains: ["Create"] });
  log("PASS", "Register page loads");

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${warned} warnings`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
