import "dotenv/config";
import { ProviderType } from "@prisma/client";
import { prisma } from "./lib/prisma.js";

const providers = [
  {
    name: "Addis Recovery Spa",
    type: ProviderType.SPA,
    city: "Addis Ababa",
    phone: "+251911000001",
    offers: [
      {
        title: "Weekend stress relief session",
        description: "Massage, steam, and quiet recovery time for high-stress users.",
        price: 1200,
        pointsCost: 600,
      },
    ],
  },
  {
    name: "Bole Community Gym",
    type: ProviderType.GYM,
    city: "Addis Ababa",
    phone: "+251911000002",
    offers: [
      {
        title: "Starter fitness pass",
        description: "Three coached beginner sessions with wellness passport points.",
        price: 900,
        pointsCost: 450,
      },
    ],
  },
  {
    name: "Kuriftu Wellness Retreat",
    type: ProviderType.RETREAT,
    city: "Bishoftu",
    phone: "+251911000003",
    offers: [
      {
        title: "One-day lake recovery retreat",
        description: "Rest, guided movement, and recreation for sleep and stress recovery.",
        price: 2500,
        pointsCost: 1200,
      },
    ],
  },
  {
    name: "Youth Sports Circle",
    type: ProviderType.SPORTS,
    city: "Addis Ababa",
    offers: [
      {
        title: "Saturday social football",
        description: "Low-pressure weekly sports group for physical and social wellbeing.",
        price: 150,
        pointsCost: 100,
      },
    ],
  },
];

async function main() {
  for (const provider of providers) {
    const { offers, ...data } = provider;

    await prisma.provider.upsert({
      where: { name_city: { name: data.name, city: data.city } },
      update: {
        ...data,
        offers: {
          deleteMany: {},
          create: offers,
        },
      },
      create: {
        ...data,
        offers: { create: offers },
      },
    });
  }

  console.log(`Seeded ${providers.length} wellness providers.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
