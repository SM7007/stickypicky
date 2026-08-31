require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin User ──────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stickypicky.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@stickypicky.com',
      password: adminPassword,
      phone: '9999999999',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // ── Categories ───────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'anime' }, update: {}, create: { name: 'Anime', slug: 'anime' } }),
    prisma.category.upsert({ where: { slug: 'bollywood' }, update: {}, create: { name: 'Bollywood', slug: 'bollywood' } }),
    prisma.category.upsert({ where: { slug: 'aesthetic' }, update: {}, create: { name: 'Aesthetic', slug: 'aesthetic' } }),
    prisma.category.upsert({ where: { slug: 'sports' }, update: {}, create: { name: 'Sports', slug: 'sports' } }),
    prisma.category.upsert({ where: { slug: 'minimal' }, update: {}, create: { name: 'Minimal', slug: 'minimal' } }),
    prisma.category.upsert({ where: { slug: 'stickers' }, update: {}, create: { name: 'Stickers', slug: 'stickers' } }),
    prisma.category.upsert({ where: { slug: 'anime-stickers' }, update: {}, create: { name: 'Anime Stickers', slug: 'anime-stickers' } }),
  ]);
  console.log('✅ Categories created');

  const [anime, bollywood, aesthetic, sports, minimal, stickers, animeStickers] = categories;

  // ── Sample Products ──────────────────────────────────────
  const products = [
    {
      name: 'Gojo Satoru — Infinity Poster',
      slug: 'gojo-satoru-infinity-poster',
      description: 'Premium high-quality Gojo Satoru art poster. Perfect for fans of Jujutsu Kaisen. Matte finish, fade-resistant inks.',
      price: 349,
      originalPrice: 599,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
      categoryId: anime.id,
      featured: true,
      active: true,
    },
    {
      name: 'Naruto Uzumaki — Hokage Poster',
      slug: 'naruto-uzumaki-hokage-poster',
      description: 'Stunning Naruto Hokage illustration. High-res digital art print on premium matte paper.',
      price: 299,
      originalPrice: 499,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800',
      categoryId: anime.id,
      featured: true,
      active: true,
    },
    {
      name: 'Attack on Titan — Survey Corps',
      slug: 'attack-on-titan-survey-corps',
      description: 'Epic AOT Survey Corps group poster. A must-have for every Attack on Titan fan.',
      price: 349,
      originalPrice: null,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
      categoryId: anime.id,
      featured: false,
      active: true,
    },
    {
      name: 'Pathaan — Official Poster',
      slug: 'pathaan-official-poster',
      description: 'Shah Rukh Khan in Pathaan. Bold action-style poster. Premium matte print.',
      price: 249,
      originalPrice: 399,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
      categoryId: bollywood.id,
      featured: true,
      active: true,
    },
    {
      name: 'Sholay — Retro Classic',
      slug: 'sholay-retro-classic',
      description: 'Vintage retro-style Sholay poster. A tribute to the greatest Bollywood film.',
      price: 299,
      originalPrice: 499,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
      categoryId: bollywood.id,
      featured: false,
      active: true,
    },
    {
      name: 'Sunset Mountains — Aesthetic Art',
      slug: 'sunset-mountains-aesthetic',
      description: 'Dreamy pastel sunset mountain landscape. Minimal aesthetic wall art for your room.',
      price: 199,
      originalPrice: 349,
      stock: 60,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      categoryId: aesthetic.id,
      featured: true,
      active: true,
    },
    {
      name: 'Lo-Fi Study Vibes Poster',
      slug: 'lofi-study-vibes-poster',
      description: 'Chill lo-fi aesthetic poster. Perfect for your study room or workspace.',
      price: 249,
      originalPrice: null,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
      categoryId: aesthetic.id,
      featured: false,
      active: true,
    },
    {
      name: 'Cristiano Ronaldo — CR7 Poster',
      slug: 'cristiano-ronaldo-cr7-poster',
      description: 'Iconic Cristiano Ronaldo celebration poster. High contrast black and white art.',
      price: 299,
      originalPrice: 499,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
      categoryId: sports.id,
      featured: true,
      active: true,
    },
    {
      name: 'MS Dhoni — Helicopter Shot',
      slug: 'ms-dhoni-helicopter-shot',
      description: 'MS Dhoni iconic helicopter shot moment. Tribute poster for the legend of cricket.',
      price: 349,
      originalPrice: 599,
      stock: 28,
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
      categoryId: sports.id,
      featured: false,
      active: true,
    },
    {
      name: 'Breathe — Minimal Typography',
      slug: 'breathe-minimal-typography',
      description: 'Simple minimalist typography poster. Clean design for a modern living space.',
      price: 149,
      originalPrice: 249,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
      categoryId: minimal.id,
      featured: false,
      active: true,
    },
    {
      name: 'Stay Focused — Dark Minimal',
      slug: 'stay-focused-dark-minimal',
      description: 'Dark background motivational minimal poster. Ideal for study rooms and offices.',
      price: 199,
      originalPrice: null,
      stock: 55,
      image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800',
      categoryId: minimal.id,
      featured: false,
      active: true,
    },
    {
      name: 'One Piece — Straw Hat Crew',
      slug: 'one-piece-straw-hat-crew',
      description: 'The iconic Straw Hat Pirates crew poster. Epic composition for One Piece fans.',
      price: 399,
      originalPrice: 649,
      stock: 22,
      image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800',
      categoryId: anime.id,
      featured: true,
      active: true,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        sizes: {
          create: [
            { size: 'A4', price: product.price, stock: Math.floor(product.stock * 0.5) },
            { size: 'A3', price: product.price + 100, stock: Math.floor(product.stock * 0.3) },
            { size: 'A2', price: product.price + 250, stock: Math.floor(product.stock * 0.15) },
            { size: 'A1', price: product.price + 450, stock: Math.floor(product.stock * 0.05) },
          ],
        },
      },
    });
    console.log('✅ Product:', created.name);
  }

  console.log('\n🎉 Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin email:    admin@stickypicky.com');
  console.log('Admin password: Admin@123');
  console.log('⚠️  Change these credentials before going to production!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
