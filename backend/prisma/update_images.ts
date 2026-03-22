import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getImageUrl(query: string): Promise<string> {
    try {
        const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iax=images&ia=images`);
        const text = await res.text();
        const vqdMatch = text.match(/vqd=([a-zA-Z0-9_\-]+)/);
        if (!vqdMatch) return '';

        const vqd = vqdMatch[1];
        const imageRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`, {
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Referer': 'https://duckduckgo.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const data = await imageRes.json();
        return data.results && data.results.length > 0 ? data.results[0].image : '';
    } catch (err) {
        console.error(`Error fetching for ${query}`, err);
        return '';
    }
}

async function main() {
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products to update`);

    for (const product of products) {
        console.log(`Fetching image for: ${product.name}`);
        const imageUrl = await getImageUrl(product.name);

        if (imageUrl) {
            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl }
            });
            console.log(`Updated ${product.name} with image: ${imageUrl}`);
        } else {
            console.log(`Failed to find image for ${product.name}`);

            // Fallbacks based on typical product names
            let fallback = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80';
            if (product.name.toLowerCase().includes('camera') || product.name.toLowerCase().includes('dh-')) {
                fallback = 'https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=800&q=80'; // Camera
            } else if (product.name.toLowerCase().includes('router') || product.name.toLowerCase().includes('ap820') || product.name.toLowerCase().includes('ew1200')) {
                fallback = 'https://images.unsplash.com/photo-1520869562399-e772f042f422?auto=format&fit=crop&w=800&q=80'; // Router/AP
            }

            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl: fallback }
            });
        }

        // Slight delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('All product images updated!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
