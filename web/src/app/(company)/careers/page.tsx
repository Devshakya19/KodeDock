import { StaticPageLayout } from "@/shared/components/layout/static-layout";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const OPENINGS = [
  {
    title: "Full-Stack Developer",
    department: "Engineering",
    location: "Remote / India",
    type: "Full-time",
    description: "Build and scale KodeDock's marketplace platform using Next.js, Rust, and Go.",
  },
  {
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote / India",
    type: "Full-time",
    description: "Design intuitive interfaces for developers buying and selling code.",
  },
  {
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote / India",
    type: "Full-time",
    description: "Manage and scale our polyglot microservices architecture.",
  },
  {
    title: "Content Writer",
    department: "Marketing",
    location: "Remote",
    type: "Part-time",
    description: "Write technical content, tutorials, and blog posts for the developer community.",
  },
];

export default function CareersPage() {
  return (
    <StaticPageLayout
      title="Careers"
      description="Join our team and help build the future of code commerce."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Why Work at KodeDock?</h2>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;re building something meaningful — a platform that empowers Indian developers
            to monetize their skills. Join a small, passionate team where your work directly
            impacts thousands of creators.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              { title: "Remote-First", desc: "Work from anywhere in India" },
              { title: "Flexible Hours", desc: "Work when you&apos;re most productive" },
              { title: "Growth", desc: "Learn and grow with a fast-moving startup" },
            ].map((perk) => (
              <div key={perk.title} className="p-4 rounded-lg border border-border text-center">
                <h3 className="font-semibold text-foreground mb-1">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Open Positions</h2>
          <div className="space-y-4">
            {OPENINGS.map((job) => (
              <Card key={job.title} className="border-border hover:border-border transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-[10px] bg-secondary border-border">
                          {job.department}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] bg-secondary border-border">
                          {job.location}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] bg-secondary border-border">
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-border text-foreground">
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </StaticPageLayout>
  );
}
