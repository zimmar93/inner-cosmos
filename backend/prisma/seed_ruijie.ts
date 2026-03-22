import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ruijieProducts = [
    {
        name: 'Ruijie RG-AP820-L(V2)',
        description: 'Wi-Fi 6 Indoor Access Point, AX1800 dual-band, built-in antenna',
        sku: 'RG-AP820-LV2',
        price: 150.00,
        imageUrl: 'https://images.unsplash.com/photo-1582269986566-bf31f50a30b4?auto=format&fit=crop&w=800&q=80',
        quantity: 50
    },
    {
        name: 'Ruijie RG-NBS3100-24GT4SFP',
        description: '24-Port Gigabit L2 Managed Switch with 4 SFP uplink ports',
        sku: 'RG-NBS3100-24GT4SFP',
        price: 280.00,
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
        quantity: 30
    },
    {
        name: 'Ruijie RG-EG105G V2',
        description: '5-Port Gigabit Cloud Managed Router, ideal for small businesses',
        sku: 'RG-EG105GV2',
        price: 80.00,
        imageUrl: 'https://images.unsplash.com/photo-1558236402-9ae1cceaccda?auto=format&fit=crop&w=800&q=80',
        quantity: 100
    },
    {
        name: 'Ruijie RG-EW1200G PRO',
        description: '1300M Dual-band Gigabit Wireless Router, home and SOHO Wi-Fi',
        sku: 'RG-EW1200G-PRO',
        price: 65.00,
        imageUrl: 'https://images.unsplash.com/photo-1520869562399-e772f042f422?auto=format&fit=crop&w=800&q=80',
        quantity: 200
    },
    {
        name: 'Ruijie RG-RAP2200(E)',
        description: 'Wi-Fi 5 1267Mbps Ceiling Access Point for enterprise networks',
        sku: 'RG-RAP2200E',
        price: 95.00,
        imageUrl: 'https://images.unsplash.com/photo-1582269986566-bf31f50a30b4?auto=format&fit=crop&w=800&q=80',
        quantity: 150
    },
    {
        name: 'Ruijie RG-ES205GC-P',
        description: '5-Port Gigabit Smart Cloud Managed PoE Switch (54W PoE budget)',
        sku: 'RG-ES205GC-P',
        price: 75.00,
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
        quantity: 120
    },
    {
        name: 'Ruijie RG-NBS3200-24SFP/8GT4XS',
        description: '24-Port SFP L2 Managed Switch with 8 Gigabit Combo and 4 10G SFP+',
        sku: 'RG-NBS3200-24SFP8GT4XS',
        price: 450.00,
        imageUrl: 'https://images.unsplash.com/photo-1558236402-9ae1cceaccda?auto=format&fit=crop&w=800&q=80',
        quantity: 20
    },
    {
        name: 'Ruijie RG-ES209GC-P',
        description: '9-Port Gigabit Smart Cloud Managed PoE Switch (120W PoE budget)',
        sku: 'RG-ES209GC-P',
        price: 110.00,
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
        quantity: 80
    },
    {
        name: 'Ruijie RG-RAP6260(G)',
        description: 'Wi-Fi 6 AX1800 Outdoor Access Point, IP68 rated, PoE+',
        sku: 'RG-RAP6260G',
        price: 320.00,
        imageUrl: 'https://images.unsplash.com/photo-1582269986566-bf31f50a30b4?auto=format&fit=crop&w=800&q=80',
        quantity: 40
    },
    {
        name: 'Ruijie RG-EG210G-E',
        description: '10-Port Gigabit Cloud Managed Router for enterprise edge',
        sku: 'RG-EG210GE',
        price: 180.00,
        imageUrl: 'https://images.unsplash.com/photo-1520869562399-e772f042f422?auto=format&fit=crop&w=800&q=80',
        quantity: 60
    }
];

async function main() {
    console.log('Seeding Ruijie Network products...');
    for (const p of ruijieProducts) {
        const { quantity, ...productData } = p;

        // Upsert product by SKU
        const product = await prisma.product.upsert({
            where: { sku: p.sku },
            update: productData,
            create: productData,
        });

        // Upsert inventory
        await prisma.inventory.upsert({
            where: { productId: product.id },
            update: { quantityAvailable: quantity },
            create: { productId: product.id, quantityAvailable: quantity, reservedQuantity: 0 }
        });

        console.log(`Created/Updated ${p.name}`);
    }
    console.log('Done seeding!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
