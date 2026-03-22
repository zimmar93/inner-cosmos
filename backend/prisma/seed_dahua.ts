import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dahuaProducts = [
  {
    name: 'Dahua IPC-HFW2431S-S-S2',
    description: '4MP WDR IR Bullet Network Camera, 30m IR, IP67',
    sku: 'DH-IPC-HFW2431S',
    price: 85.00,
    imageUrl: 'https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=800&q=80',
    quantity: 45
  },
  {
    name: 'Dahua IPC-HDW2431T-AS-S2',
    description: '4MP WDR IR Eyeball Network Camera, Built-in Mic, IR 30m',
    sku: 'DH-IPC-HDW2431T',
    price: 90.00,
    imageUrl: 'https://images.unsplash.com/photo-1621570169389-13e0c0be6c25?auto=format&fit=crop&w=800&q=80',
    quantity: 60
  },
  {
    name: 'Dahua NVR4104HS-P-4KS2/L',
    description: '4 Channel Compact 1U 1HDD 4PoE Network Video Recorder',
    sku: 'DH-NVR4104HS-P',
    price: 130.00,
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    quantity: 25
  },
  {
    name: 'Dahua IPC-HDBW2431E-S-S2',
    description: '4MP WDR IR Dome Network Camera, IK10 Vandal-proof, IP67',
    sku: 'DH-IPC-HDBW2431E',
    price: 95.00,
    imageUrl: 'https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=800&q=80',
    quantity: 35
  },
  {
    name: 'Dahua NVR4208-8P-4KS2/L',
    description: '8 Channel 1U 2HDD 8PoE Network Video Recorder',
    sku: 'DH-NVR4208-8P',
    price: 210.00,
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    quantity: 15
  },
  {
    name: 'Dahua IPC-HFW5541E-ZE',
    description: '5MP Pro AI IR Vari-focal Bullet Network Camera',
    sku: 'DH-IPC-HFW5541E-ZE',
    price: 260.00,
    imageUrl: 'https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=800&q=80',
    quantity: 20
  },
  {
    name: 'Dahua SD49225T-HN',
    description: '2MP 25x Starlight IR PTZ Network Camera, 100m IR',
    sku: 'DH-SD49225T-HN',
    price: 450.00,
    imageUrl: 'https://images.unsplash.com/photo-1621570169389-13e0c0be6c25?auto=format&fit=crop&w=800&q=80',
    quantity: 10
  },
  {
    name: 'Dahua VTO2202F-P-S2',
    description: 'IP Villa Door Station, 2MP CMOS camera, Aluminum alloy',
    sku: 'DH-VTO2202F-P-S2',
    price: 140.00,
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    quantity: 30
  },
  {
    name: 'Dahua VTH2421FB-P',
    description: '7-inch IP Indoor Monitor, capacitive touch screen',
    sku: 'DH-VTH2421FB-P',
    price: 155.00,
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    quantity: 40
  },
  {
    name: 'Dahua PFS3005-4ET-60',
    description: '4-Port PoE Switch (Unmanaged), 60W PoE budget',
    sku: 'DH-PFS3005-4ET-60',
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    quantity: 80
  }
];

async function main() {
  console.log('Seeding Dahua IP products...');
  for (const p of dahuaProducts) {
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
