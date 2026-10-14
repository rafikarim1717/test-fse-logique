import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { createCipheriv, randomBytes } from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const key = Buffer.from(process.env.ENCRYPTION_KEY ?? '', 'hex');
const encrypt = (text: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((p) => p.toString('hex')).join(':');
};

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const existing = await prisma.credentialCategory.count({ where: { userId: user.id } });
  if (existing > 0) {
    console.log('Seed data already exists, skipping.');
    return;
  }

  const [email, banking, server] = await Promise.all(
    ['Email', 'Banking', 'Server'].map((name) =>
      prisma.credentialCategory.create({ data: { name, userId: user.id } }),
    ),
  );

  const office = await prisma.credentialGroup.create({ data: { name: 'Office', userId: user.id } });
  const projectA = await prisma.credentialGroup.create({
    data: { name: 'Project A', parentId: office.id, userId: user.id },
  });
  const personal = await prisma.credentialGroup.create({ data: { name: 'Personal', userId: user.id } });

  await prisma.credential.createMany({
    data: [
      { title: 'Office Email', username: 'demo@office.com', password: encrypt('office-pass-1'), categoryId: email.id, groupId: office.id, userId: user.id },
      { title: 'Staging Server', username: 'root', password: encrypt('staging-pass-2'), url: 'https://staging.example.com', categoryId: server.id, groupId: projectA.id, userId: user.id },
      { title: 'Personal Bank', username: 'demo123', password: encrypt('bank-pass-3'), categoryId: banking.id, groupId: personal.id, userId: user.id },
    ],
  });

  console.log('Seed completed. Login: demo@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());