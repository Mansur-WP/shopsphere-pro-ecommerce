import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding ShopSphere Pro...");

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
      name: "Alex Customer",
      email: "customer@shopsphere.com",
      password,
      role: "CUSTOMER",
      phone: "+1 555 0100",
      address: "120 Market Street",
      city: "San Francisco",
      country: "US",
      postalCode: "94105",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      name: "Sam Staff",
      email: "seller@shopsphere.com",
      password,
      role: "STAFF",
      cart: { create: {} },
      wishlist: { create: {} },
      sellerProfile: {
        create: {
          storeName: "Nordic Atelier",
          storeSlug: "nordic-atelier",
          description:
            "Thoughtfully crafted home goods and everyday essentials with a clean Scandinavian sensibility.",
          businessEmail: "hello@nordicatelier.test",
          phone: "+1 555 0200",
          status: "APPROVED",
          logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop",
        },
      },
    },
    include: { sellerProfile: true },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: "Jordan Merchant",
      email: "merchant@shopsphere.com",
      password,
      role: "STAFF",
      cart: { create: {} },
      wishlist: { create: {} },
      sellerProfile: {
        create: {
          storeName: "Pulse Gear",
          storeSlug: "pulse-gear",
          description:
            "Performance-driven tech accessories built for modern work and travel.",
          businessEmail: "sales@pulsegear.test",
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
        description: "Devices and accessories for work and play",
        image:
          "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Home & Living",
        slug: "home-living",
        description: "Elevated essentials for modern spaces",
        image:
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Clothing",
        slug: "clothing",
        description: "Timeless wardrobe staples with everyday comfort",
        image:
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
        description: "Bags, watches, and finishing touches",
        image:
          "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Beauty",
        slug: "beauty",
        description: "Clean formulas and considered rituals",
        image:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
      },
    }),
  ]);

  const [electronics, home, clothing, accessories, beauty] = categories;
  const sellerId = sellerUser.sellerProfile!.id;
  const merchantId = seller2.sellerProfile!.id;

  const catalog = [
    {
      name: "Aura Wireless Headphones",
      slug: "aura-wireless-headphones",
      description:
        "Over-ear wireless headphones with adaptive noise control, 40-hour battery life, and a balanced sound profile tuned for long listening sessions.",
      price: 249,
      compareAt: 299,
      stock: 48,
      sku: "AURA-WH-01",
      featured: true,
      categoryId: electronics.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.7,
      ratingCount: 2,
    },
    {
      name: "Orbit Compact Keyboard",
      slug: "orbit-compact-keyboard",
      description:
        "Low-profile mechanical keyboard with hot-swappable switches, aluminum top plate, and multi-device Bluetooth for desk and travel setups.",
      price: 179,
      stock: 55,
      sku: "ORB-KB-05",
      featured: false,
      categoryId: electronics.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.4,
      ratingCount: 1,
    },
    {
      name: "Nimbus Smart Watch",
      slug: "nimbus-smart-watch",
      description:
        "Lightweight smart watch with bright always-on display, multi-day battery, heart-rate tracking, and seamless phone notifications.",
      price: 299,
      compareAt: 349,
      stock: 36,
      sku: "NIM-SW-07",
      featured: true,
      categoryId: electronics.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.5,
      ratingCount: 1,
    },
    {
      name: "Lumen Desk Lamp",
      slug: "lumen-desk-lamp",
      description:
        "A sculptural LED desk lamp with warm-to-cool temperature control, USB-C charging, and a matte aluminum finish that disappears into any workspace.",
      price: 129,
      compareAt: 159,
      stock: 72,
      sku: "LUM-DL-02",
      featured: true,
      categoryId: home.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.5,
      ratingCount: 1,
    },
    {
      name: "Ceramic Pour-Over Set",
      slug: "ceramic-pour-over-set",
      description:
        "Hand-glazed ceramic pour-over dripper and mug set. Thermal-stable clay body keeps your brew at the right temperature from first pour to last sip.",
      price: 68,
      compareAt: 82,
      stock: 110,
      sku: "CER-PO-04",
      featured: true,
      categoryId: home.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.8,
      ratingCount: 1,
    },
    {
      name: "Nordic Linen Throw",
      slug: "nordic-linen-throw",
      description:
        "Stonewashed European linen throw with soft drape and breathable warmth — made for sofas, beds, and cool evenings.",
      price: 89,
      stock: 64,
      sku: "NOR-LT-08",
      featured: false,
      categoryId: home.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=800&fit=crop",
      ],
      ratingAvg: 0,
      ratingCount: 0,
    },
    {
      name: "Meridian Wool Coat",
      slug: "meridian-wool-coat",
      description:
        "A tailored wool-blend coat with a clean silhouette, hidden buttons, and a soft brushed lining designed for all-day wear through cooler seasons.",
      price: 320,
      stock: 24,
      sku: "MER-WC-03",
      featured: true,
      categoryId: clothing.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop",
      ],
      ratingAvg: 5,
      ratingCount: 1,
    },
    {
      name: "Atlas Organic Tee",
      slug: "atlas-organic-tee",
      description:
        "Heavyweight organic cotton tee with a relaxed fit, reinforced seams, and a soft hand-feel that gets better with every wash.",
      price: 42,
      compareAt: 52,
      stock: 180,
      sku: "ATL-OT-09",
      featured: true,
      categoryId: clothing.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.3,
      ratingCount: 1,
    },
    {
      name: "Harbor Chino Pants",
      slug: "harbor-chino-pants",
      description:
        "Stretch chino pants with a tapered leg, deep pockets, and a mid-rise waist — polished enough for the office, easy enough for weekends.",
      price: 98,
      stock: 90,
      sku: "HAR-CP-10",
      featured: false,
      categoryId: clothing.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop",
      ],
      ratingAvg: 0,
      ratingCount: 0,
    },
    {
      name: "Field Leather Belt",
      slug: "field-leather-belt",
      description:
        "Full-grain leather belt with a brushed brass buckle. Ages beautifully and holds its shape season after season.",
      price: 58,
      stock: 140,
      sku: "FLD-LB-11",
      featured: false,
      categoryId: accessories.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.6,
      ratingCount: 1,
    },
    {
      name: "Cascade Canvas Tote",
      slug: "cascade-canvas-tote",
      description:
        "Structured canvas tote with leather handles, interior laptop sleeve, and a magnetic closure — your everyday carry, elevated.",
      price: 75,
      compareAt: 95,
      stock: 88,
      sku: "CAS-CT-12",
      featured: true,
      categoryId: accessories.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.9,
      ratingCount: 1,
    },
    {
      name: "Horizon Aviator Sunglasses",
      slug: "horizon-aviator-sunglasses",
      description:
        "Polarized aviator sunglasses with lightweight metal frames, UV400 lenses, and a soft-touch case included.",
      price: 120,
      stock: 70,
      sku: "HOR-AS-13",
      featured: false,
      categoryId: accessories.id,
      sellerId: merchantId,
      images: [
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=800&fit=crop",
      ],
      ratingAvg: 0,
      ratingCount: 0,
    },
    {
      name: "Solstice Face Serum",
      slug: "solstice-face-serum",
      description:
        "Lightweight daily serum with niacinamide and squalane. Absorbs quickly, layers well under moisturizer, and supports a calm, even-looking complexion.",
      price: 48,
      stock: 200,
      sku: "SOL-FS-06",
      featured: true,
      categoryId: beauty.id,
      sellerId,
      images: [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop",
      ],
      ratingAvg: 4.6,
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
        title: "Studio-ready clarity",
        comment:
          "Comfortable for long sessions and the noise control is genuinely useful on flights.",
      },
      {
        userId: admin.id,
        productId: products[0].id,
        rating: 4,
        title: "Great daily driver",
        comment: "Battery life is excellent. Wish the case was a bit slimmer.",
      },
      {
        userId: customer.id,
        productId: products[1].id,
        rating: 4,
        title: "Solid travel board",
        comment: "Quiet enough for the office and packs easily.",
      },
      {
        userId: customer.id,
        productId: products[2].id,
        rating: 5,
        title: "Battery lasts days",
        comment: "Display is crisp outdoors. Tracking feels accurate.",
      },
      {
        userId: customer.id,
        productId: products[3].id,
        rating: 5,
        title: "Perfect task light",
        comment: "The temperature range is spot on for evening writing.",
      },
      {
        userId: customer.id,
        productId: products[4].id,
        rating: 5,
        title: "Morning ritual upgrade",
        comment: "Beautiful glaze and consistent pour. Highly recommend.",
      },
      {
        userId: customer.id,
        productId: products[6].id,
        rating: 5,
        title: "Impeccable fit",
        comment: "Structure without stiffness. Looks expensive because it is.",
      },
      {
        userId: customer.id,
        productId: products[7].id,
        rating: 4,
        title: "Great everyday tee",
        comment: "Thick fabric that still breathes. True to size.",
      },
      {
        userId: customer.id,
        productId: products[9].id,
        rating: 5,
        title: "Quality leather",
        comment: "Stitching is clean and the buckle feels substantial.",
      },
      {
        userId: customer.id,
        productId: products[10].id,
        rating: 5,
        title: "Carry everything",
        comment: "Laptop sleeve is perfect. Holds its shape all day.",
      },
      {
        userId: customer.id,
        productId: products[12].id,
        rating: 5,
        title: "Clean formula",
        comment: "No stickiness, plays well with sunscreen.",
      },
    ],
  });

  console.log("✅ Seed complete");
  console.log(`  ${categories.length} categories · ${products.length} products`);
  console.log("Accounts (password: password123):");
  console.log("  admin@shopsphere.com");
  console.log("  seller@shopsphere.com");
  console.log("  merchant@shopsphere.com");
  console.log("  customer@shopsphere.com");
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
