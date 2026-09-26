#!/usr/bin/env node
/**
 * ShopSphere Pro — database-level QA for cart, orders, wishlist, admin/seller ops
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

let passed = 0;
let failed = 0;

function ok(name, detail = "") {
  passed++;
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  failed++;
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function getUser(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function main() {
  console.log("\nShopSphere Pro DB QA\n" + "=".repeat(50));

  const customer = await getUser("customer@shopsphere.com");
  const seller = await getUser("seller@shopsphere.com");
  const admin = await getUser("admin@shopsphere.com");

  if (!customer || !seller || !admin) {
    fail("Seed users exist");
    process.exit(1);
  }
  ok("Seed users exist");

  // Products
  const productCount = await prisma.product.count({ where: { published: true } });
  if (productCount > 0) {
    ok("Published products", String(productCount));
  } else {
    fail("Published products");
  }

  const product = await prisma.product.findFirst({ where: { published: true } });
  if (!product) {
    fail("Sample product");
    process.exit(1);
  }
  ok("Sample product", product.slug);

  // Cart ops
  let cart = await prisma.cart.findUnique({ where: { userId: customer.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: customer.id } });
  }
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cartItem.create({
    data: { cartId: cart.id, productId: product.id, quantity: 2 },
  });
  const cartItems = await prisma.cartItem.count({ where: { cartId: cart.id } });
  if (cartItems === 1) {
    ok("Cart add item");
  } else {
    fail("Cart add item", `count=${cartItems}`);
  }

  await prisma.cartItem.updateMany({
    where: { cartId: cart.id },
    data: { quantity: 3 },
  });
  const updated = await prisma.cartItem.findFirst({ where: { cartId: cart.id } });
  if (updated?.quantity === 3) {
    ok("Cart update quantity");
  } else {
    fail("Cart update quantity");
  }

  // Wishlist
  let wishlist = await prisma.wishlist.findUnique({ where: { userId: customer.id } });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({ data: { userId: customer.id } });
  }
  await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });
  await prisma.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId: product.id },
  });
  const wlCount = await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } });
  if (wlCount === 1) {
    ok("Wishlist add");
  } else {
    fail("Wishlist add");
  }

  // Order creation (demo path without Stripe)
  const orderNumber = `SSP-${Date.now()}`;
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: customer.id,
      status: "PENDING",
      paymentStatus: "PAID",
      subtotal: product.price,
      shippingCost: 0,
      tax: 0,
      total: product.price,
      shippingName: customer.name ?? "Test",
      shippingEmail: customer.email,
      shippingAddress: "120 Market Street",
      shippingCity: "San Francisco",
      shippingCountry: "US",
      shippingPostal: "94105",
      items: {
        create: {
          productId: product.id,
          sellerId: product.sellerId,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.images[0] ?? null,
        },
      },
    },
    include: { items: true },
  });
  if (order.items.length === 1) {
    ok("Order create", order.orderNumber);
  } else {
    fail("Order create");
  }

  // Review eligibility path — paid order exists
  const existingReview = await prisma.review.findUnique({
    where: { userId_productId: { userId: customer.id, productId: product.id } },
  });
  if (!existingReview) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: product.id,
        rating: 5,
        title: "QA test review",
        comment: "Automated QA review — great product.",
      },
    });
    ok("Review create");
  } else {
    ok("Review exists", "skipped duplicate");
  }

  // Seller profile
  const profile = await prisma.sellerProfile.findUnique({ where: { userId: seller.id } });
  if (profile?.status === "APPROVED") {
    ok("Seller approved");
  } else {
    fail("Seller approved", profile?.status);
  }

  // Pending seller for admin approval test
  const pendingEmail = `pending-seller-qa@test.local`;
  await prisma.user.deleteMany({ where: { email: pendingEmail } });
  const pwd = await bcrypt.hash("password123", 12);
  const pendingUser = await prisma.user.create({
    data: {
      name: "Pending QA Seller",
      email: pendingEmail,
      password: pwd,
      role: "STAFF",
      sellerProfile: {
        create: {
          storeName: "QA Pending Store",
          storeSlug: `qa-pending-${Date.now()}`,
          description: "QA test store",
          businessEmail: pendingEmail,
          status: "PENDING",
        },
      },
    },
    include: { sellerProfile: true },
  });
  const pendingId = pendingUser.sellerProfile?.id;
  if (!pendingId) {
    fail("Pending seller profile created");
    process.exit(1);
  }
  await prisma.sellerProfile.update({
    where: { id: pendingId },
    data: { status: "APPROVED" },
  });
  const approved = await prisma.sellerProfile.findUnique({ where: { id: pendingId } });
  if (approved?.status === "APPROVED") {
    ok("Seller approve/reject flow");
  } else {
    fail("Seller approve");
  }

  // Category CRUD
  const catSlug = `qa-cat-${Date.now()}`;
  const cat = await prisma.category.create({
    data: { name: "QA Category", slug: catSlug, description: "Test" },
  });
  await prisma.category.update({ where: { id: cat.id }, data: { name: "QA Category Updated" } });
  await prisma.category.delete({ where: { id: cat.id } });
  ok("Category CRUD");

  // Cleanup QA data
  await prisma.review.deleteMany({ where: { title: "QA test review" } });
  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.order.delete({ where: { id: order.id } });
  await prisma.user.delete({ where: { id: pendingUser.id } });

  // Broken images check
  const products = await prisma.product.findMany({ select: { slug: true, images: true } });
  let brokenImages = 0;
  for (const p of products) {
    for (const url of p.images) {
      let okImage = false;
      for (let attempt = 0; attempt < 2 && !okImage; attempt++) {
        try {
          const res = await fetch(url, {
            method: "HEAD",
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(12000),
          });
          if (res.ok) {
            okImage = true;
          } else if (attempt === 1) {
            brokenImages++;
            console.log(`⚠ Broken image (${p.slug}): HTTP ${res.status} ${url}`);
          }
        } catch (err) {
          if (attempt === 1) {
            brokenImages++;
            console.log(`⚠ Broken image (${p.slug}): fetch failed ${url} - ${err.message || err}`);
          }
        }
      }
    }
  }
  if (brokenImages === 0) {
    ok("Product images reachable");
  } else {
    fail("Product images", `${brokenImages} broken`);
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  await prisma.$disconnect();
  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
