// prisma/seed.ts
import { PrismaClient, Role, JobStatus, Timeline, BudgetType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // CATEGORIES
  // ============================================
  const categories = [
    { name: 'Schilderwerk', slug: 'painting', icon: 'Paintbrush', description: 'Binnen- en buitenschilderwerk', order: 1 },
    { name: 'Loodgieter', slug: 'plumbing', icon: 'Wrench', description: 'Sanitair en leidingwerk', order: 2 },
    { name: 'Elektricien', slug: 'electrical', icon: 'Zap', description: 'Elektrische installaties', order: 3 },
    { name: 'Timmerman', slug: 'carpentry', icon: 'Hammer', description: 'Houtwerk en meubels', order: 4 },
    { name: 'Vloeren', slug: 'flooring', icon: 'Grid3X3', description: 'Vloeren leggen en renoveren', order: 5 },
    { name: 'Dakdekker', slug: 'roofing', icon: 'Warehouse', description: 'Dakwerk en reparaties', order: 6 },
    { name: 'Metselaar', slug: 'masonry', icon: 'Blocks', description: 'Metselwerk en voegwerk', order: 7 },
    { name: 'Stukadoor', slug: 'plastering', icon: 'PaintRoller', description: 'Stucwerk en wanden', order: 8 },
    { name: 'Tuinman', slug: 'gardening', icon: 'TreeDeciduous', description: 'Tuinonderhoud en aanleg', order: 9 },
    { name: 'Schoonmaak', slug: 'cleaning', icon: 'Sparkles', description: 'Professionele schoonmaak', order: 10 },
    { name: 'Verhuizen', slug: 'moving', icon: 'Truck', description: 'Verhuisservices', order: 11 },
    { name: 'Kozijnen & Glas', slug: 'windows', icon: 'LayoutGrid', description: 'Ramen, deuren en glas', order: 12 },
    { name: 'CV & Verwarming', slug: 'heating', icon: 'Flame', description: 'Verwarmingsinstallaties', order: 13 },
    { name: 'Airco & Ventilatie', slug: 'hvac', icon: 'Wind', description: 'Klimaatbeheersing', order: 14 },
    { name: 'Overig', slug: 'other', icon: 'HelpCircle', description: 'Andere klussen', order: 99 },
  ];

  console.log('📦 Creating categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // ============================================
  // TEST USERS (only in development)
  // ============================================
  if (process.env.NODE_ENV !== 'production') {
    console.log('👤 Creating test users...');

    // Admin user
    const adminPassword = await hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@vakspot.nl' },
      update: {},
      create: {
        email: 'admin@vakspot.nl',
        name: 'Admin User',
        passwordHash: adminPassword,
        role: Role.ADMIN,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Admin: ${admin.email}`);

    // Client user
    const clientPassword = await hash('client123', 12);
    const client = await prisma.user.upsert({
      where: { email: 'klant@test.nl' },
      update: {},
      create: {
        email: 'klant@test.nl',
        name: 'Jan de Vries',
        passwordHash: clientPassword,
        role: Role.CLIENT,
        emailVerified: new Date(),
        clientProfile: {
          create: {
            phone: '06-12345678',
            city: 'Amsterdam',
            postcode: '1012AB',
          },
        },
      },
    });
    console.log(`✅ Client: ${client.email}`);

    // Pro users
    const proPassword = await hash('pro123', 12);
    
    const paintingCategory = await prisma.category.findUnique({ where: { slug: 'painting' } });
    const plumbingCategory = await prisma.category.findUnique({ where: { slug: 'plumbing' } });
    const electricalCategory = await prisma.category.findUnique({ where: { slug: 'electrical' } });

    const pro1 = await prisma.user.upsert({
      where: { email: 'schilder@test.nl' },
      update: {},
      create: {
        email: 'schilder@test.nl',
        name: 'Pieter Bakker',
        passwordHash: proPassword,
        role: Role.PRO,
        emailVerified: new Date(),
        proProfile: {
          create: {
            companyName: 'Bakker Schilderwerken',
            kvkNumber: '12345678',
            description: 'Vakkundig schilderwerk met 15 jaar ervaring. Gespecialiseerd in binnen- en buitenschilderwerk.',
            phone: '06-87654321',
            serviceRadius: 30,
            locationCity: 'Amsterdam',
            locationLat: 52.3676,
            locationLng: 4.9041,
            avgRating: 4.7,
            totalReviews: 23,
            responseRate: 95,
            verified: true,
            categories: {
              create: paintingCategory ? [{ categoryId: paintingCategory.id, yearsExp: 15 }] : [],
            },
          },
        },
      },
    });
    console.log(`✅ Pro: ${pro1.email}`);

    const pro2 = await prisma.user.upsert({
      where: { email: 'loodgieter@test.nl' },
      update: {},
      create: {
        email: 'loodgieter@test.nl',
        name: 'Klaas Jansen',
        passwordHash: proPassword,
        role: Role.PRO,
        emailVerified: new Date(),
        proProfile: {
          create: {
            companyName: 'Jansen Loodgieters',
            kvkNumber: '87654321',
            description: 'Betrouwbare loodgieter voor al uw sanitair problemen. 24/7 beschikbaar voor noodgevallen.',
            phone: '06-11223344',
            serviceRadius: 25,
            locationCity: 'Utrecht',
            locationLat: 52.0907,
            locationLng: 5.1214,
            avgRating: 4.9,
            totalReviews: 45,
            responseRate: 98,
            verified: true,
            categories: {
              create: plumbingCategory ? [{ categoryId: plumbingCategory.id, yearsExp: 20 }] : [],
            },
          },
        },
      },
    });
    console.log(`✅ Pro: ${pro2.email}`);

    const pro3 = await prisma.user.upsert({
      where: { email: 'elektricien@test.nl' },
      update: {},
      create: {
        email: 'elektricien@test.nl',
        name: 'Tom Visser',
        passwordHash: proPassword,
        role: Role.PRO,
        emailVerified: new Date(),
        proProfile: {
          create: {
            companyName: 'Visser Elektra',
            kvkNumber: '55667788',
            description: 'Gecertificeerd elektricien. NEN 1010, NEN 3140. Installaties, storingen en inspecties.',
            phone: '06-55667788',
            serviceRadius: 40,
            locationCity: 'Rotterdam',
            locationLat: 51.9244,
            locationLng: 4.4777,
            avgRating: 4.5,
            totalReviews: 12,
            responseRate: 88,
            verified: false,
            categories: {
              create: electricalCategory ? [{ categoryId: electricalCategory.id, yearsExp: 8 }] : [],
            },
          },
        },
      },
    });
    console.log(`✅ Pro: ${pro3.email}`);

    // Sample job
    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: client.id } });
    
    if (clientProfile && paintingCategory) {
      const job = await prisma.job.upsert({
        where: { id: 'sample-job-1' },
        update: {},
        create: {
          id: 'sample-job-1',
          title: 'Woonkamer schilderen',
          description: 'Ik zoek een schilder om mijn woonkamer (30m²) te schilderen. De muren zijn in goede staat en hoeven alleen geschilderd te worden. Kleur: gebroken wit. Plafond mag ook.',
          categoryId: paintingCategory.id,
          clientId: clientProfile.id,
          status: JobStatus.PUBLISHED,
          budgetMin: 50000, // €500
          budgetMax: 100000, // €1000
          budgetType: BudgetType.ESTIMATE,
          locationCity: 'Amsterdam',
          locationPostcode: '1012AB',
          locationLat: 52.3702,
          locationLng: 4.8952,
          timeline: Timeline.THIS_MONTH,
          publishedAt: new Date(),
        },
      });
      console.log(`✅ Sample job: ${job.title}`);
    }
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
