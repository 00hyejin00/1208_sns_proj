import type { NextConfig } from "next";

// Supabase URL에서 호스트명 추출
const getSupabaseHostname = (): string | undefined => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return undefined;
  
  try {
    const url = new URL(supabaseUrl);
    return url.hostname;
  } catch {
    return undefined;
  }
};

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // Supabase Storage 도메인 추가
      ...(supabaseHostname
        ? [
            {
              hostname: supabaseHostname,
              protocol: "https" as const,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
