/**
 * Panduan Migrasi dari Prisma ke mysql2
 * 
 * File ini berisi panduan cara mengganti kode Prisma dengan mysql2
 */

// CONTOH PENGGUNAAN PRISMA:
// import { prisma } from '@/lib/prisma';
// const user = await prisma.user.findUnique({ where: { id: 1 } });

// GANTI DENGAN MYSQL2:
// import { User } from '@/lib/models';
// const user = await User.findById(1);

// ===== PANDUAN PENGGANTIAN UMUM =====

// 1. Import
// DARI: import { prisma } from '@/lib/prisma';
// KE: import { User, Transaction, Settings, Banner, Admin, News, RobuxStock, Discount, RobuxTheme } from '@/lib/models';
// (Import hanya model yang dibutuhkan)

// 2. Operasi Find
// DARI: const user = await prisma.user.findUnique({ where: { id: 1 } });
// KE: const user = await User.findById(1);

// DARI: const user = await prisma.user.findUnique({ where: { email: 'email@example.com' } });
// KE: const user = await User.findByEmail('email@example.com');

// DARI: const users = await prisma.user.findMany();
// KE: const users = await User.getAll();

// 3. Operasi Create
// DARI: const newUser = await prisma.user.create({ data: userData });
// KE: const newUser = await User.create(userData);

// 4. Operasi Update
// DARI: const updatedUser = await prisma.user.update({ where: { id: 1 }, data: userData });
// KE: const updatedUser = await User.update(1, userData);

// 5. Operasi Delete
// DARI: await prisma.user.delete({ where: { id: 1 } });
// KE: await User.delete(1); // Perlu ditambahkan di models.js

// 6. Operasi Relasi
// DARI: const userWithTransactions = await prisma.user.findUnique({ where: { id: 1 }, include: { transactions: true } });
// KE: 
// const user = await User.findById(1);
// const transactions = await Transaction.findByUserId(1);
// const userWithTransactions = { ...user, transactions };

// 7. Operasi Kondisional
// DARI: const pendingTransactions = await prisma.transaction.findMany({ where: { status: 'pending' } });
// KE: const pendingTransactions = await Transaction.getByStatus('pending');

// 8. Operasi Count
// DARI: const count = await prisma.transaction.count({ where: { status: 'pending' } });
// KE: const transactions = await Transaction.getByStatus('pending');
//     const count = transactions.length;