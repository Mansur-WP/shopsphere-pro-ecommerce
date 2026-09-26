import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Africhina Connect...");

  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Platform Owner",
      email: "admin@shopsphere.com",
      password,
      role: "SUPER_ADMIN",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Chidi Okonkwo",
      email: "customer@shopsphere.com",
      password,
      role: "CUSTOMER",
      phone: "+234 801 234 5678",
      address: "14 Admiralty Way",
      city: "Lagos",
      country: "Nigeria",
      postalCode: "101233",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      name: "Amara Nwosu",
      email: "seller@shopsphere.com",
      password,
      role: "STAFF",
      cart: { create: {} },
      wishlist: { create: {} },
      sellerProfile: {
        create: {
          storeName: "Africhina Warehouse",
          storeSlug: "africhina-warehouse",
          description:
            "Primary operations hub for Africhina Connect — managing electronics, lifestyle, and industrial product lines.",
          businessEmail: "ops@africhina.com",
          phone: "+234 802 000 1000",
          status: "APPROVED",
        },
      },
    },
    include: { sellerProfile: true },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: "Emeka Eze",
      email: "merchant@shopsphere.com",
      password,
      role: "STAFF",
      cart: { create: {} },
      wishlist: { create: {} },
      sellerProfile: {
        create: {
          storeName: "Africhina Tech Hub",
          storeSlug: "africhina-tech-hub",
          description:
            "Africhina Connect technology division — smartphones, accessories, and smart devices.",
          businessEmail: "tech@africhina.com",
          status: "APPROVED",
        },
      },
    },
    include: { sellerProfile: true },
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Electronics",
        slug: "electronics",
        description: "Smartphones, accessories, and smart devices",
        image:
          "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Home & Kitchen",
        slug: "home-kitchen",
        description: "Appliances and essentials for modern Nigerian homes",
        image:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Fashion",
        slug: "fashion",
        description: "Clothing, footwear, and apparel",
        image:
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Bags & Accessories",
        slug: "bags-accessories",
        description: "Bags, watches, and everyday carry accessories",
        image:
          "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Beauty & Personal Care",
        slug: "beauty-personal-care",
        description: "Skincare, grooming, and personal care products",
        image:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Industrial & Tools",
        slug: "industrial-tools",
        description: "Power tools, equipment, and industrial supplies",
        image:
          "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop",
      },
    }),
  ]);

  const [electronics, homeKitchen, fashion, bagsAcc, beauty, industrial] =
    categories;
  const sellerId = sellerUser.sellerProfile!.id;
  const merchantId = seller2.sellerProfile!.id;

  const catalog = [
    // Electronics
    {
      name: "Wireless Bluetooth Earbuds",
      slug: "wireless-bluetooth-earbuds",
      description:
        "True wireless earbuds with active noise cancellation, 30-hour total battery life (6hr buds + 24hr case), IPX4 water resistance, and fast pairing across Android and iOS.",
      price: 18500,
      compareAt: 24000,
      stock: 120,
      sku: "AFC-EAR-001",
      featured: true,
      categoryId: electronics.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.6,
      ratingCount: 3,
    },
    {
      name: "Android Smart Watch",
      slug: "android-smart-watch",
      description:
        "Full-touch smartwatch with health monitoring (heart rate, SpO2, sleep tracking), 7-day battery, and compatibility with Android and iOS notifications.",
      price: 22000,
      compareAt: 29500,
      stock: 85,
      sku: "AFC-SW-002",
      featured: true,
      categoryId: electronics.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.4,
      ratingCount: 2,
    },
    {
      name: "Mechanical Gaming Keyboard",
      slug: "mechanical-gaming-keyboard",
      description:
        "87-key tenkeyless mechanical keyboard with RGB backlight, blue tactile switches, aluminium body, and USB-C detachable cable.",
      price: 16800,
      stock: 60,
      sku: "AFC-KB-003",
      featured: false,
      categoryId: electronics.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.3,
      ratingCount: 1,
    },
    {
      name: "65W USB-C GaN Charger",
      slug: "usb-c-gan-charger-65w",
      description:
        "Compact GaN fast charger with three ports (2x USB-C, 1x USB-A). Supports 65W PD for laptops, 30W for phones, and charges three devices simultaneously.",
      price: 9500,
      compareAt: 12000,
      stock: 200,
      sku: "AFC-CHG-004",
      featured: false,
      categoryId: electronics.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.7,
      ratingCount: 2,
    },
    // Home & Kitchen
    {
      name: "Rechargeable LED Desk Fan",
      slug: "rechargeable-led-desk-fan",
      description:
        "Portable 3-speed desk fan with a 4000mAh rechargeable battery, 8-hour runtime, built-in LED night light, and ultra-quiet operation ideal for offices and bedrooms.",
      price: 12500,
      compareAt: 15000,
      stock: 95,
      sku: "AFC-FAN-005",
      featured: true,
      categoryId: homeKitchen.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.5,
      ratingCount: 2,
    },
    {
      name: "Stainless Steel Water Bottle 1L",
      slug: "stainless-steel-water-bottle-1l",
      description:
        "Double-wall vacuum-insulated 1-litre bottle. Keeps drinks cold for 24 hours and hot for 12 hours. Leak-proof lid and BPA-free.",
      price: 5800,
      stock: 300,
      sku: "AFC-BTL-006",
      featured: false,
      categoryId: homeKitchen.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.8,
      ratingCount: 1,
    },
    {
      name: "Electric Pressure Cooker 6L",
      slug: "electric-pressure-cooker-6l",
      description:
        "6-litre multi-function electric pressure cooker with 12 cooking presets, delayed start, keep-warm, and a stainless-steel inner pot designed for Nigerian staple dishes.",
      price: 38000,
      compareAt: 45000,
      stock: 40,
      sku: "AFC-POT-007",
      featured: true,
      categoryId: homeKitchen.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.6,
      ratingCount: 2,
    },
    // Fashion
    {
      name: "Men's Casual Polo Shirt",
      slug: "mens-casual-polo-shirt",
      description:
        "Breathable pique cotton polo shirt available in multiple colours. Slim fit, reinforced collar, and UV protective fabric designed for warm climates.",
      price: 7500,
      compareAt: 9500,
      stock: 250,
      sku: "AFC-POLO-008",
      featured: false,
      categoryId: fashion.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.2,
      ratingCount: 1,
    },
    {
      name: "Women's Ankara Print Dress",
      slug: "womens-ankara-print-dress",
      description:
        "Bold Ankara-print midi dress with a fitted bodice, A-line skirt, and side pockets. Machine washable and wrinkle-resistant for everyday elegance.",
      price: 14000,
      compareAt: 18000,
      stock: 80,
      sku: "AFC-DRESS-009",
      featured: true,
      categoryId: fashion.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.9,
      ratingCount: 2,
    },
    // Bags & Accessories
    {
      name: "Waterproof Backpack 30L",
      slug: "waterproof-backpack-30l",
      description:
        "30-litre waterproof backpack with a padded 15.6in laptop compartment, USB charging port, anti-theft rear pocket, and ergonomic straps.",
      price: 19500,
      compareAt: 25000,
      stock: 110,
      sku: "AFC-BAG-010",
      featured: true,
      categoryId: bagsAcc.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.7,
      ratingCount: 2,
    },
    {
      name: "Polarized Aviator Sunglasses",
      slug: "polarized-aviator-sunglasses",
      description:
        "UV400 polarized aviator sunglasses with lightweight alloy frames, anti-glare lenses, and a microfibre cleaning pouch included.",
      price: 8200,
      stock: 150,
      sku: "AFC-SUN-011",
      featured: false,
      categoryId: bagsAcc.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=800&fit=crop",
      ],
      ratingAvg: 0,
      ratingCount: 0,
    },
    // Beauty & Personal Care
    {
      name: "Vitamin C Face Serum 30ml",
      slug: "vitamin-c-face-serum-30ml",
      description:
        "Brightening daily serum with 15% stabilised Vitamin C, hyaluronic acid, and niacinamide. Lightweight, fast-absorbing, and suitable for all skin tones.",
      price: 11000,
      compareAt: 14500,
      stock: 180,
      sku: "AFC-SER-012",
      featured: true,
      categoryId: beauty.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.6,
      ratingCount: 2,
    },
    {
      name: "Hair Growth Oil 100ml",
      slug: "hair-growth-oil-100ml",
      description:
        "Nourishing hair growth oil with castor oil, rosemary extract, and biotin. Reduces breakage, promotes thickness, and suitable for natural and relaxed hair.",
      price: 6500,
      stock: 220,
      sku: "AFC-HAIR-013",
      featured: false,
      categoryId: beauty.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.5,
      ratingCount: 1,
    },
    // Industrial & Tools
    {
      name: "Cordless Power Drill 18V",
      slug: "cordless-power-drill-18v",
      description:
        "18V cordless drill/driver with 2-speed gearbox, 20 torque settings, LED work light, and two 2Ah Li-ion batteries with rapid charger. Suitable for wood, metal, and masonry.",
      price: 45000,
      compareAt: 56000,
      stock: 35,
      sku: "AFC-DRILL-014",
      featured: true,
      categoryId: industrial.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.8,
      ratingCount: 1,
    },
    {
      name: "Digital Multimeter",
      slug: "digital-multimeter",
      description:
        "Auto-ranging digital multimeter with AC/DC voltage, current, resistance, continuity, and diode testing. Includes test leads and a protective holster.",
      price: 8800,
      stock: 90,
      sku: "AFC-MULTI-015",
      featured: false,
      categoryId: industrial.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.4,
      ratingCount: 1,
    },
  ];
  const products = await Promise.all(
    catalog.map((item) =>
      prisma.product.create({
        data: {
          ...item,
          published: true,
          compareAt: item.compareAt ?? null,
        },
      })
    )
  );

  await prisma.review.createMany({
    data: [
      {
        userId: customer.id,
        productId: products[0].id,
        rating: 5,
        title: "Crystal clear sound",
        comment:
          "Noise cancellation works great on Lagos traffic. Battery lasts all day.",
      },
      {
        userId: admin.id,
        productId: products[0].id,
        rating: 4,
        title: "Solid value",
        comment: "Great for the price. Case charges quickly.",
      },
      {
        userId: sellerUser.id,
        productId: products[0].id,
        rating: 5,
        title: "Best earbuds I have owned",
        comment: "Fit is comfortable even for long listening sessions.",
      },
      {
        userId: customer.id,
        productId: products[1].id,
        rating: 5,
        title: "Battery life is impressive",
        comment: "7 days on a single charge — exactly as advertised.",
      },
      {
        userId: admin.id,
        productId: products[1].id,
        rating: 4,
        title: "Great daily companion",
        comment: "Health tracking is accurate and notifications are reliable.",
      },
      {
        userId: customer.id,
        productId: products[2].id,
        rating: 4,
        title: "Great typing feel",
        comment: "Tactile feedback is satisfying. RGB is a bonus.",
      },
      {
        userId: customer.id,
        productId: products[3].id,
        rating: 5,
        title: "Charges my laptop and phone at once",
        comment: "Compact and powerful. No more carrying a bulky adapter.",
      },
      {
        userId: admin.id,
        productId: products[3].id,
        rating: 5,
        title: "A must-have accessory",
        comment: "Fast charging is legit. Works with MacBook and Samsung.",
      },
      {
        userId: customer.id,
        productId: products[4].id,
        rating: 5,
        title: "Perfect for NEPA situations",
        comment:
          "Runs for 8 hours on a charge. Very quiet. LED nightlight is a bonus.",
      },
      {
        userId: admin.id,
        productId: products[4].id,
        rating: 4,
        title: "Good airflow",
        comment: "Strong on highest setting. Battery charges fast.",
      },
      {
        userId: customer.id,
        productId: products[5].id,
        rating: 5,
        title: "Keeps water cold all day",
        comment: "Still cold after 6 hours under Lagos sun. Very impressed.",
      },
      {
        userId: customer.id,
        productId: products[6].id,
        rating: 5,
        title: "Cooks jollof rice perfectly",
        comment: "Rice preset is well calibrated. Pot is easy to clean.",
      },
      {
        userId: admin.id,
        productId: products[6].id,
        rating: 4,
        title: "Reliable kitchen appliance",
        comment: "Beans in 25 minutes. No more soaking overnight.",
      },
      {
        userId: customer.id,
        productId: products[8].id,
        rating: 5,
        title: "Beautiful fabric and cut",
        comment: "The print quality is vibrant. Received so many compliments.",
      },
      {
        userId: admin.id,
        productId: products[8].id,
        rating: 5,
        title: "Quality stitching",
        comment: "Washed twice and colour is still as bold. Great value.",
      },
      {
        userId: customer.id,
        productId: products[9].id,
        rating: 5,
        title: "Fits everything I need",
        comment:
          "Laptop, charger, files — all fits. The USB port is super handy.",
      },
      {
        userId: admin.id,
        productId: products[9].id,
        rating: 4,
        title: "Sturdy and practical",
        comment: "Waterproofing actually works. Survived a downpour.",
      },
      {
        userId: customer.id,
        productId: products[11].id,
        rating: 5,
        title: "Skin visibly brighter in 2 weeks",
        comment: "No irritation, absorbs quickly. Already on my second bottle.",
      },
      {
        userId: admin.id,
        productId: products[11].id,
        rating: 4,
        title: "Good formulation",
        comment: "Layers well under sunscreen. No sticky residue.",
      },
      {
        userId: customer.id,
        productId: products[13].id,
        rating: 5,
        title: "More power than expected",
        comment: "Drills through concrete easily. Battery lasts a full session.",
      },
      {
        userId: customer.id,
        productId: products[14].id,
        rating: 4,
        title: "Accurate readings",
        comment: "Used it to diagnose a wiring fault. Very reliable.",
      },
    ],
  });

  console.log("✅ Seed complete");
  console.log(
    `  ${categories.length} categories · ${products.length} products · 21 reviews`
  );
  console.log("Accounts (password: password123):");
  console.log("  admin@shopsphere.com    → SUPER_ADMIN");
  console.log("  seller@shopsphere.com   → STAFF (Africhina Warehouse)");
  console.log("  merchant@shopsphere.com → STAFF (Africhina Tech Hub)");
  console.log("  customer@shopsphere.com → CUSTOMER (Chidi Okonkwo, Lagos)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
