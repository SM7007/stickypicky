/**
 * ──────────────────────────────────────────────────
 *  stickypicky — Admin Management Script
 * ──────────────────────────────────────────────────
 * Usage:
 *   node scripts/manageAdmin.js add-admin
 *   node scripts/manageAdmin.js reset-password
 *   node scripts/manageAdmin.js list-admins
 * ──────────────────────────────────────────────────
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

// ── Add New Admin ────────────────────────────────────────────────
async function addAdmin() {
  console.log('\n👤  Add New Admin\n');

  const name     = await ask('Name:     ');
  const email    = await ask('Email:    ');
  const password = await ask('Password: ');
  const phone    = await ask('Phone (optional, press Enter to skip): ');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log('\n⚠️  This email is already an ADMIN account.');
    } else {
      // Upgrade existing customer to admin
      await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
      console.log('\n✅  Existing user upgraded to ADMIN:', email);
    }
    rl.close();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin  = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      phone:    phone || null,
      role:     'ADMIN',
    },
  });

  console.log('\n✅  Admin created successfully!');
  console.log('    Name:  ', admin.name);
  console.log('    Email: ', admin.email);
  console.log('    Role:  ', admin.role);
  rl.close();
}

// ── Reset Password ───────────────────────────────────────────────
async function resetPassword() {
  console.log('\n🔑  Reset Password\n');

  const email       = await ask('Email:            ');
  const newPassword = await ask('New Password:     ');
  const confirmPass = await ask('Confirm Password: ');

  if (newPassword !== confirmPass) {
    console.log('\n❌  Passwords do not match. Please try again.');
    rl.close();
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('\n❌  No account found with email:', email);
    rl.close();
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { password: hashed } });

  console.log('\n✅  Password reset successfully!');
  console.log('    Email:', email);
  console.log('    Role: ', user.role);
  rl.close();
}

// ── List All Admins ──────────────────────────────────────────────
async function listAdmins() {
  const admins = await prisma.user.findMany({
    where:  { role: 'ADMIN' },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });

  if (admins.length === 0) {
    console.log('\n⚠️  No admin accounts found.');
  } else {
    console.log('\n👥  Admin Accounts (' + admins.length + '):\n');
    admins.forEach((a, i) => {
      console.log('  ' + (i + 1) + '. ' + a.name + ' — ' + a.email);
    });
  }
  rl.close();
}

// ── Entry Point ──────────────────────────────────────────────────
async function main() {
  const command = process.argv[2];

  try {
    if (command === 'add-admin')           await addAdmin();
    else if (command === 'reset-password') await resetPassword();
    else if (command === 'list-admins')    await listAdmins();
    else {
      console.log('\n📋  stickypicky Admin Management\n');
      console.log('  node scripts/manageAdmin.js add-admin       — Create a new admin account');
      console.log('  node scripts/manageAdmin.js reset-password  — Reset a forgotten password');
      console.log('  node scripts/manageAdmin.js list-admins     — List all admin accounts\n');
    }
  } catch (err) {
    console.error('\n❌  Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
