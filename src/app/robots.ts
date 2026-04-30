import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://safian-healthcare.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/admin-login",
          "/api/*",
          "/account",
          "/account/*",
          "/checkout",
          "/cart",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
