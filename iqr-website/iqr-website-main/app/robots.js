export const dynamic = "force-static";
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/dashboard/" },
    sitemap: "https://iqrhq.me/sitemap.xml",
  };
}
