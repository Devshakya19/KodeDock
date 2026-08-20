import { StaticPageLayout } from "@/shared/components/layout/static-layout";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <StaticPageLayout
      title="Contact Us"
      description="Get in touch with the KodeDock team."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Get in Touch</h2>
          <p className="text-muted-foreground leading-relaxed">
            Have a question, suggestion, or want to partner with us? We&apos;d love to hear from you.
            Reach out through any of the channels below.
          </p>
        </section>

        <section>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Mail, title: "Email", value: "hello@kodedock.com", desc: "For general inquiries" },
              { icon: Mail, title: "Support", value: "support@kodedock.com", desc: "For technical support" },
              { icon: MapPin, title: "Location", value: "India", desc: "Remote-first company" },
            ].map((contact) => (
              <Card key={contact.title} className="border-border">
                <CardContent className="p-6 text-center">
                  <contact.icon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">{contact.title}</h3>
                  <p className="text-sm font-medium text-foreground">{contact.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{contact.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Send us a Message</h2>
          <Card className="border-border">
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-slate-800">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </StaticPageLayout>
  );
}
