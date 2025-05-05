// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const users = [
//     {
//         id: '3e2fa881-20b2-4b7d-b456-abcde0000001',
//         name:'aryabagus',
//         username: 'arya',
//         preferredTimezone: 'Asia/Jakarta',
//       },
//       {
//         id: '3e2fa881-20b2-4b7d-b456-abcde0000002',
//         name:'aryabagusa',
//         username: 'raka',
//         preferredTimezone: 'Asia/Jayapura',
//       },
//       {
//         id: '3e2fa881-20b2-4b7d-b456-abcde0000003',
//         name:'aryabagusaa',
//         username: 'dian',
//         preferredTimezone: 'Asia/Makassar',
//       },
//   ];

//   for (const user of users) {
//     await prisma.user.upsert({
//       where: { username: user.username },
//       update: {},
//       create: user
//     });
//   }

//   console.log("✅ Seed selesai: user ditambahkan.");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(() => prisma.$disconnect());
