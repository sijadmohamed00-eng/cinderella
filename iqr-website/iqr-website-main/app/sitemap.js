export const dynamic = "force-static";
export default function sitemap() {
  return [
    { url: "https://iqrhq.me", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://iqrhq.me/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://iqrhq.me/contact", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://iqrhq.me/blog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: "https://iqrhq.me/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://iqrhq.me/dashboard", lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];
}
