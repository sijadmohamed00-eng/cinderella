import BlogPostClient from "./BlogPostClient";

export async function generateStaticParams() {
  return [
    { slug: "inventory-waste" },
    { slug: "peak-hours" },
    { slug: "staff-management" },
    { slug: "menu-engineering" },
    { slug: "order-routing" },
    { slug: "iraq-restaurant-market" },
    { slug: "digital-transformation" },
    { slug: "customer-experience" },
    { slug: "supplier-management" },
  ];
}

export default function Page({ params }) {
  return <BlogPostClient params={params} />;
}
