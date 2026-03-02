/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'public.blob.vercel-storage.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
        ],
    },
    transpilePackages: ['@vercel/blob', 'undici'],
}

module.exports = nextConfig
