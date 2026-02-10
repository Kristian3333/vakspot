// src/app/api/admin/dev-tools/create-test-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { hash } from 'bcryptjs';

const createTestDataSchema = z.object({
  scenario: z.enum(['basic', 'complete', 'multi-pro']),
});

export async function POST(request: NextRequest) {
  try {
    // Check if in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Dev tools only available in development mode' },
        { status: 403 }
      );
    }

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    const body = await request.json();
    const validation = createTestDataSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ongeldige scenario type', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { scenario } = validation.data;

    // Create test data based on scenario
    if (scenario === 'basic') {
      return await createBasicScenario();
    } else if (scenario === 'complete') {
      return await createCompleteScenario();
    } else if (scenario === 'multi-pro') {
      return await createMultiProScenario();
    }

    return NextResponse.json({ error: 'Onbekend scenario' }, { status: 400 });
  } catch (error) {
    console.error('Create test data error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan bij het aanmaken van testdata' },
      { status: 500 }
    );
  }
}

async function createBasicScenario() {
  const timestamp = Date.now();
  const passwordHash = await hash('password123', 10);

  // Create client user
  const client = await prisma.user.create({
    data: {
      email: `client-${timestamp}@test.nl`,
      name: `Test Client ${timestamp}`,
      passwordHash,
      role: 'CLIENT',
      emailVerified: new Date(),
    },
  });

  // Create client profile
  const clientProfile = await prisma.clientProfile.create({
    data: {
      userId: client.id,
      phone: '0612345678',
      postcode: '1012AB',
      city: 'Amsterdam',
    },
  });

  // Create PRO user
  const pro = await prisma.user.create({
    data: {
      email: `pro-${timestamp}@test.nl`,
      name: `Test PRO ${timestamp}`,
      passwordHash,
      role: 'PRO',
      emailVerified: new Date(),
    },
  });

  // Create PRO profile
  const proProfile = await prisma.proProfile.create({
    data: {
      userId: pro.id,
      companyName: `Test Bedrijf ${timestamp}`,
      phone: '0698765432',
      entityType: 'INDIVIDUAL',
      serviceRadius: 25,
      locationCity: 'Amsterdam',
      locationPostcode: '1012AB',
    },
  });

  // Get a category
  const category = await prisma.category.findFirst({
    where: { active: true },
  });

  if (!category) {
    return NextResponse.json(
      { error: 'Geen categorieën gevonden. Voeg eerst categorieën toe.' },
      { status: 400 }
    );
  }

  // Create a job
  const job = await prisma.job.create({
    data: {
      title: 'Test klus - lekkende kraan',
      description: 'Dit is een test klus voor ontwikkeling. De kraan lekt en moet gerepareerd worden.',
      categoryId: category.id,
      clientId: clientProfile.id,
      status: 'CREATED',
      locationCity: 'Amsterdam',
      locationPostcode: '1012AB',
      budgetType: 'ESTIMATE',
      timeline: 'FLEXIBLE',
    },
  });

  return NextResponse.json({
    scenario: 'basic',
    clientId: client.id,
    clientEmail: client.email,
    proId: pro.id,
    proEmail: pro.email,
    jobId: job.id,
    password: 'password123',
  });
}

async function createCompleteScenario() {
  const timestamp = Date.now();
  const passwordHash = await hash('password123', 10);

  // Create client
  const client = await prisma.user.create({
    data: {
      email: `client-complete-${timestamp}@test.nl`,
      name: `Complete Client ${timestamp}`,
      passwordHash,
      role: 'CLIENT',
      emailVerified: new Date(),
    },
  });

  const clientProfile = await prisma.clientProfile.create({
    data: {
      userId: client.id,
      phone: '0612345678',
      postcode: '1012AB',
      city: 'Amsterdam',
    },
  });

  // Create PRO
  const pro = await prisma.user.create({
    data: {
      email: `pro-complete-${timestamp}@test.nl`,
      name: `Complete PRO ${timestamp}`,
      passwordHash,
      role: 'PRO',
      emailVerified: new Date(),
    },
  });

  const proProfile = await prisma.proProfile.create({
    data: {
      userId: pro.id,
      companyName: `Complete Bedrijf ${timestamp}`,
      phone: '0698765432',
      entityType: 'INDIVIDUAL',
      serviceRadius: 25,
      locationCity: 'Amsterdam',
      locationPostcode: '1012AB',
      verified: true,
    },
  });

  // Get category
  const category = await prisma.category.findFirst({
    where: { active: true },
  });

  if (!category) {
    return NextResponse.json(
      { error: 'Geen categorieën gevonden. Voeg eerst categorieën toe.' },
      { status: 400 }
    );
  }

  // Create job
  const job = await prisma.job.create({
    data: {
      title: 'Complete test klus',
      description: 'Dit is een complete test klus met alle statussen doorlopen.',
      categoryId: category.id,
      clientId: clientProfile.id,
      status: 'REVIEWED',
      locationCity: 'Amsterdam',
      locationPostcode: '1012AB',
      budgetType: 'FIXED',
      budgetMin: 10000,
      budgetMax: 15000,
      timeline: 'THIS_WEEK',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAtByCons: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Create bid
  const bid = await prisma.bid.create({
    data: {
      jobId: job.id,
      proId: proProfile.id,
      amount: 12500,
      amountType: 'FIXED',
      message: 'Ik kan dit voor u doen!',
      status: 'ACCEPTED',
    },
  });

  // Update job with accepted bid
  await prisma.job.update({
    where: { id: job.id },
    data: { acceptedBidId: bid.id },
  });

  // Create conversation
  const conversation = await prisma.conversation.create({
    data: {
      bidId: bid.id,
    },
  });

  // Create messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: client.id,
        content: 'Hallo, wanneer kunt u beginnen?',
        read: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation.id,
        senderId: pro.id,
        content: 'Ik kan morgen langskomen!',
        read: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 60000),
      },
    ],
  });

  // Create review
  await prisma.review.create({
    data: {
      jobId: job.id,
      proId: proProfile.id,
      rating: 5,
      title: 'Uitstekend werk!',
      content: 'Zeer tevreden met het resultaat. Aanrader!',
      verified: true,
    },
  });

  return NextResponse.json({
    scenario: 'complete',
    clientId: client.id,
    clientEmail: client.email,
    proId: pro.id,
    proEmail: pro.email,
    jobId: job.id,
    bidId: bid.id,
    conversationId: conversation.id,
    password: 'password123',
  });
}

async function createMultiProScenario() {
  const timestamp = Date.now();
  const passwordHash = await hash('password123', 10);

  // Create client
  const client = await prisma.user.create({
    data: {
      email: `client-multi-${timestamp}@test.nl`,
      name: `Multi Client ${timestamp}`,
      passwordHash,
      role: 'CLIENT',
      emailVerified: new Date(),
    },
  });

  const clientProfile = await prisma.clientProfile.create({
    data: {
      userId: client.id,
      phone: '0612345678',
      postcode: '1012AB',
      city: 'Amsterdam',
    },
  });

  // Get category
  const category = await prisma.category.findFirst({
    where: { active: true },
  });

  if (!category) {
    return NextResponse.json(
      { error: 'Geen categorieën gevonden. Voeg eerst categorieën toe.' },
      { status: 400 }
    );
  }

  // Create job
  const job = await prisma.job.create({
    data: {
      title: 'Multi-PRO test klus',
      description: 'Test klus met meerdere PROs geïnteresseerd.',
      categoryId: category.id,
      clientId: clientProfile.id,
      status: 'RESPONSES_RECEIVED',
      locationCity: 'Amsterdam',
      locationPostcode: '1012AB',
      budgetType: 'ESTIMATE',
      timeline: 'FLEXIBLE',
    },
  });

  // Create 3 PROs with bids
  const proIds = [];
  const proEmails = [];

  for (let i = 1; i <= 3; i++) {
    const pro = await prisma.user.create({
      data: {
        email: `pro-multi-${i}-${timestamp}@test.nl`,
        name: `Multi PRO ${i} ${timestamp}`,
        passwordHash,
        role: 'PRO',
        emailVerified: new Date(),
      },
    });

    const proProfile = await prisma.proProfile.create({
      data: {
        userId: pro.id,
        companyName: `Multi Bedrijf ${i} ${timestamp}`,
        phone: `069876543${i}`,
        entityType: 'INDIVIDUAL',
        serviceRadius: 25,
        locationCity: 'Amsterdam',
        locationPostcode: '1012AB',
      },
    });

    await prisma.bid.create({
      data: {
        jobId: job.id,
        proId: proProfile.id,
        amount: 10000 + i * 1000,
        amountType: 'ESTIMATE',
        message: `Ik ben PRO ${i} en kan dit voor u doen!`,
        status: 'PENDING',
      },
    });

    proIds.push(pro.id);
    proEmails.push(pro.email);
  }

  return NextResponse.json({
    scenario: 'multi-pro',
    clientId: client.id,
    clientEmail: client.email,
    proIds,
    proEmails,
    jobId: job.id,
    password: 'password123',
  });
}
