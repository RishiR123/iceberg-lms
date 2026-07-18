/**
 * Bootstraps an administrator account.
 *
 * Needed once per database: signup is closed and an empty database has no admin,
 * so there's no way to log in until one exists. After this, create everyone else
 * through the admin People panel.
 *
 * Usage (reads DATABASE_URL from the environment):
 *   DATABASE_URL="<your-url>" node --env-file=.env --experimental-strip-types \
 *     scripts/create-admin.ts "Full Name" "email@example.com" "password"
 *
 * If a user with that email already exists, it is promoted to ADMIN and its
 * password is reset to the one given — never silently duplicated.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error('Usage: create-admin.ts "Full Name" "email@example.com" "password"');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("That doesn't look like a valid email.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const hash = await bcrypt.hash(password, 10);
  const normalized = email.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: normalized },
    create: { name: name.trim(), email: normalized, password: hash, role: "ADMIN" },
    update: { role: "ADMIN", password: hash },
  });

  console.log(`Admin ready: ${user.name} <${user.email}>`);
  console.log("Sign in at /adminlogin with the password you provided.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
