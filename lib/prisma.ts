import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  // Test de connexion
  prisma.$connect()
    .then(() => {
      console.log('Successfully connected to the database');
    })
    .catch((error) => {
      console.error('Failed to connect to the database:', error);
    });

  return prisma;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export { prisma };
export default prisma;