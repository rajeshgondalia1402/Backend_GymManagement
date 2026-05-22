import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class BiometricTestService {
  async create(memberId: string) {
    return prisma.biometricTest.create({
      data: { memberId },
      select: {
        id: true,
        memberId: true,
        createdDate: true,
      },
    });
  }

  async getAll() {
    return prisma.biometricTest.findMany({
      orderBy: { createdDate: 'desc' },
      select: {
        id: true,
        memberId: true,
        createdDate: true,
      },
    });
  }
}

export default new BiometricTestService();
