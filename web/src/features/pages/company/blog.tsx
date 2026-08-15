import { StaticPageLayout } from "../shared/static-layout";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

const BLOG_POSTS = [
  {
    title: "Introducing CodeHaat: The Future of Code Commerce",
    excerpt: "Why we built a marketplace that delivers code directly to your GitHub account.",
    date: "July 2026",
    category: "Announcement",
    readTime: "5 min read",
  },
  {
    title: "How to Monetize Your Side Projects",
    excerpt: "A step-by-step guide for developers looking to earn passive income from their code.",
    date: "July 2026",
    category: "Guide",
    readTime: "8 min read",
  },
  {
    title: "Why GitHub Delivery Beats .zip Files",
    excerpt: "The technical advantages of delivering code as GitHub repositories instead of static downloads.",
    date: "July 2026",
    category: "Technical",
    readTime: "6 min read",
  },
  {
    title: "Top 10 Starter Templates for 2026",
    excerpt: "Curated list of production-ready templates to kickstart your next project.",
    date: "July 2026",
    category: "Roundup",
    readTime: "10 min read",
  },
  {
    title: "Building a Marketplace: Lessons Learned",
    excerpt: "Technical insights from building CodeHaat's polyglot microservices architecture.",
    date: "July 2026",
    category: "Engineering",
    readTime: "12 min read",
  },
  {
    title: "Student Projects That Sell: A Guide",
    excerpt: "How B.Tech students can package and sell their projects on CodeHaat.",
    date: "July 2026",
    category: "Guide",
    readTime: "7 min read",
  },
];

export default function BlogPage() {
  return (
    <StaticPageLayout
      title="Blog"
      description="Insights, guides, and updates from the CodeHaat team."
    >
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <Card key={post.title} className="border-slate-200 hover:border-slate-300 transition-colors">
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3 text-[10px] bg-slate-100 border-slate-200">
                  {post.category}
                </Badge>
                <h3 className="font-semibold text-slate-950 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StaticPageLayout>
  );
}
