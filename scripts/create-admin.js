const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Rezzynezz1!', 12);
    
    const admin = await prisma.admin.create({
      data: {
        username: 'rezzynezz',
        email: 'admin@zeeboost.com',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
      },
    });

    console.log('Admin berhasil dibuat:', admin);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();