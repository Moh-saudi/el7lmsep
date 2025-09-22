/** @type {import('next').NextConfig} */
const nextConfig = {
    // إعداد متغيرات البيئة
    env: {
        BEON_API_TOKEN: process.env.BEON_API_TOKEN,
        BEON_BASE_URL: process.env.BEON_BASE_URL,
        BEON_SMS_TOKEN: process.env.BEON_SMS_TOKEN,
        BEON_WHATSAPP_TOKEN: process.env.BEON_WHATSAPP_TOKEN,
        BEON_OTP_TOKEN: process.env.BEON_OTP_TOKEN,
        BEON_SENDER_NAME: process.env.BEON_SENDER_NAME,
        ENABLE_SMS_SIMULATION: process.env.ENABLE_SMS_SIMULATION,
        BEON_V3_TOKEN: process.env.BEON_V3_TOKEN,
        BEON_V3_BASE_URL: process.env.BEON_V3_BASE_URL,
    },
    
    // إعدادات الإنتاج
    output: 'standalone',
    compress: true,
    poweredByHeader: false,
    
    // إعدادات الصور
    images: {
        unoptimized: true,
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ekyerljzfokqimbabzxm.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            }
        ],
        domains: ['lh3.googleusercontent.com', 'graph.facebook.com'],
    },
    
    // إعدادات الأداء
    reactStrictMode: true,
    
    // إعدادات خارجية للسيرفر
    serverExternalPackages: ['firebase-admin', 'framer-motion'],
    
    // تعطيل DevTools نهائياً (خارج experimental)
    devIndicators: {
        buildActivity: false,
        buildActivityPosition: 'bottom-right',
    },
    
    // إعدادات تجريبية
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        scrollRestoration: true,
        serverActions: {
            bodySizeLimit: '100mb',
        },
    },

    // إعدادات webpack مبسطة
    webpack: (config, { isServer }) => {
        // إصلاح مشكلة self is not defined
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                global: false,
                buffer: false,
                process: false,
            };
        }
        
        return config;
    },
}

export default nextConfig;