// prisma/update-icons.ts
// Run with: npx tsx prisma/update-icons.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map by name, slug, or description (all lowercase for matching)
const iconMappings: Record<string, string> = {
  // By slug
  'painting': 'Paintbrush',
  'plumbing': 'Wrench',
  'electrical': 'Zap',
  'carpentry': 'Hammer',
  'flooring': 'Grid3X3',
  'roofing': 'Warehouse',
  'masonry': 'Blocks',
  'plastering': 'PaintRoller',
  'gardening': 'TreeDeciduous',
  'cleaning': 'Sparkles',
  'moving': 'Truck',
  'windows': 'LayoutGrid',
  'heating': 'Flame',
  'hvac': 'Wind',
  'other': 'HelpCircle',
  
  // By name (Dutch)
  'schilderwerk': 'Paintbrush',
  'loodgieter': 'Wrench',
  'elektricien': 'Zap',
  'timmerman': 'Hammer',
  'vloeren': 'Grid3X3',
  'dakdekker': 'Warehouse',
  'metselaar': 'Blocks',
  'stukadoor': 'PaintRoller',
  'tuinman': 'TreeDeciduous',
  'schoonmaak': 'Sparkles',
  'verhuizen': 'Truck',
  'kozijnen & glas': 'LayoutGrid',
  'cv & verwarming': 'Flame',
  'airco & ventilatie': 'Wind',
  'overig': 'HelpCircle',
  
  // By description (the ones user listed)
  'vloeren leggen en renoveren': 'Grid3X3',
  'dakwerk en reparaties': 'Warehouse',
  'metselwerk en voegwerk': 'Blocks',
  'stucwerk en wanden': 'PaintRoller',
  'binnen- en buitenschilderwerk': 'Paintbrush',
  'sanitair en leidingwerk': 'Wrench',
  'elektrische installaties': 'Zap',
  'houtwerk en meubels': 'Hammer',
  'tuinonderhoud en aanleg': 'TreeDeciduous',
  'professionele schoonmaak': 'Sparkles',
  'verhuisservices': 'Truck',
  'ramen, deuren en glas': 'LayoutGrid',
  'verwarmingsinstallaties': 'Flame',
  'klimaatbeheersing': 'Wind',
  'andere klussen': 'HelpCircle',
};

function findIcon(category: { name: string; slug: string; description: string | null }): string | null {
  // Try slug first
  if (iconMappings[category.slug]) {
    return iconMappings[category.slug];
  }
  
  // Try name (lowercase)
  if (iconMappings[category.name.toLowerCase()]) {
    return iconMappings[category.name.toLowerCase()];
  }
  
  // Try description (lowercase)
  if (category.description && iconMappings[category.description.toLowerCase()]) {
    return iconMappings[category.description.toLowerCase()];
  }
  
  return null;
}

async function main() {
  console.log('🔄 Updating category icons...\n');

  const categories = await prisma.category.findMany();
  
  let updated = 0;
  
  for (const category of categories) {
    const newIcon = findIcon(category);
    
    if (newIcon && category.icon !== newIcon) {
      await prisma.category.update({
        where: { id: category.id },
        data: { icon: newIcon },
      });
      console.log(`✅ ${category.name}: ${category.icon || '(none)'} → ${newIcon}`);
      updated++;
    } else if (!newIcon) {
      console.log(`⚠️  ${category.name}: No icon mapping found (slug: ${category.slug}, desc: ${category.description})`);
    } else {
      console.log(`⏭️  ${category.name}: Already correct (${category.icon})`);
    }
  }

  console.log(`\n✨ Updated ${updated} categories`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
