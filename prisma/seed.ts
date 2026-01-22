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

    const password = await hash('test123', 12);

    // Admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@vakspot.nl' },
      update: {},
      create: {
        email: 'admin@vakspot.nl',
        name: 'Admin',
        passwordHash: password,
        role: Role.ADMIN,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Admin: ${admin.email} (wachtwoord: test123)`);

    // Client user
    const client = await prisma.user.upsert({
      where: { email: 'klant@test.nl' },
      update: {},
      create: {
        email: 'klant@test.nl',
        name: 'Jan de Vries',
        passwordHash: password,
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
    console.log(`✅ Client: ${client.email} (wachtwoord: test123)`);

    // PRO user
    const paintingCategory = await prisma.category.findUnique({ where: { slug: 'painting' } });
    const plumbingCategory = await prisma.category.findUnique({ where: { slug: 'plumbing' } });

    const pro = await prisma.user.upsert({
      where: { email: 'vakman@test.nl' },
      update: {},
      create: {
        email: 'vakman@test.nl',
        name: 'Pieter Bakker',
        passwordHash: password,
        role: Role.PRO,
        emailVerified: new Date(),
        proProfile: {
          create: {
            companyName: 'Bakker & Zonen',
            description: 'Vakkundig schilderwerk en loodgieterswerk. Meer dan 15 jaar ervaring.',
            phone: '06-87654321',
            serviceRadius: 30,
            locationCity: 'Amsterdam',
            locationLat: 52.3676,
            locationLng: 4.9041,
            avgRating: 4.8,
            totalReviews: 12,
            verified: true,
            categories: {
              create: [
                ...(paintingCategory ? [{ categoryId: paintingCategory.id, yearsExp: 15 }] : []),
                ...(plumbingCategory ? [{ categoryId: plumbingCategory.id, yearsExp: 10 }] : []),
              ],
            },
          },
        },
      },
    });
    console.log(`✅ PRO: ${pro.email} (wachtwoord: test123)`);

    // Sample job (simplified - no budget, timeline flexible)
    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: client.id } });
    
    if (clientProfile && paintingCategory) {
      const job = await prisma.job.upsert({
        where: { id: 'sample-job-1' },
        update: {},
        create: {
          id: 'sample-job-1',
          title: 'Woonkamer schilderen',
          description: 'Ik zoek een schilder om mijn woonkamer te schilderen. De muren zijn in goede staat en hoeven alleen geschilderd te worden. Kleur: gebroken wit.',
          categoryId: paintingCategory.id,
          clientId: clientProfile.id,
          status: JobStatus.PUBLISHED,
          budgetType: BudgetType.TO_DISCUSS,
          locationCity: 'Amsterdam',
          locationPostcode: '1012AB',
          locationLat: 52.3702,
          locationLng: 4.8952,
          timeline: Timeline.FLEXIBLE,
          publishedAt: new Date(),
        },
      });
      console.log(`✅ Sample job: ${job.title}`);
    }

    console.log('\n📋 Test accounts:');
    console.log('   Klant: klant@test.nl / test123');
    console.log('   Vakman: vakman@test.nl / test123');
    console.log('   Admin: admin@vakspot.nl / test123');
  }

  console.log('\n✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
