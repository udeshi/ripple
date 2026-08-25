import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.featureFlag.upsert({
    where: { key: 'chat' },
    update: {},
    create: { key: 'chat', enabled: false, rolloutPercentage: 0 },
  });

  // Bootstraps the first admin. Set ADMIN_EMAIL to an existing user's email
  // and re-run `npm run db:seed`; promoting further admins after that is a
  // normal update via Prisma Studio or the database directly.
  if (process.env.ADMIN_EMAIL) {
    const user = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    } else {
      console.warn(`ADMIN_EMAIL set but no user found with that email yet`);
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
