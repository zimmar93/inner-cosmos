const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log('Creating...');
    const created = await prisma.category.create({ data: { name: 'DirectTest ' + Date.now() } });
    console.log('Created:', created);
    const cats = await prisma.category.findMany();
    console.log('Cats:', cats);
}
main().catch(console.error).finally(() => prisma.$disconnect());
