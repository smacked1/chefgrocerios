import { useSEO } from "@/lib/seo";
import { NavigationHeader } from "@/components/navigation-header";
import RevenueDashboard from "@/components/revenue-dashboard";

export default function Revenue() {
  // SEO optimization
  useSEO({
    title: "Revenue Dashboard - ChefGrocer Analytics",
    description: "Track subscription revenue, user growth, and business metrics for ChefGrocer AI cooking assistant.",
    keywords: ["revenue dashboard", "subscription analytics", "business metrics", "growth tracking"],
    type: "website"
  });

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Revenue Dashboard" 
        description="Track analytics and business metrics"
        backHref="/"
      />
      <RevenueDashboard />
    </div>
  );
}