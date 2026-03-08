import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Send, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">PA RTK</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
              Pennsylvania Right-to-Know Requests Made Simple
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              File public records requests to thousands of Pennsylvania government
              agencies. Search school districts, municipalities, and counties.
              Generate professional PDF requests and send them directly via email.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="h-12 px-8">
                  Start Filing Requests
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-semibold mb-12">
              Everything you need to exercise your right to know
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">4,000+ Agencies</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Access contact information for every registered PA agency
                  including school districts, boroughs, townships, and counties.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">PDF Generation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automatically generate properly formatted RTK request forms
                  pre-filled with your information and the agency details.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Direct Email</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Send your requests directly to agency RTK officers with your
                  PDF attached. Track delivery and manage responses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center text-center">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Built on Pennsylvania Law
              </h2>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                This tool generates requests compliant with Pennsylvania&apos;s
                Right-to-Know Law (65 P.S. 67.101 et seq.). Agency data is sourced
                directly from the PA Office of Open Records.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>
            Data sourced from the{" "}
            <a
              href="https://www.openrecords.pa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Pennsylvania Office of Open Records
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
