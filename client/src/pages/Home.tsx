import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Shield, Zap, TrendingUp, Users, Lock, FileText } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold text-foreground">Ontario Wills</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            {isAuthenticated ? (
              <a href="/dashboard">
                <Button>Dashboard</Button>
              </a>
            ) : (
              <Button onClick={() => window.location.href = loginUrl}>Sign In</Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-background to-muted">
        <div className="container max-w-5xl">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Estate Planning Made Simple
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create legally compliant Wills and Powers of Attorney in Ontario with AI-powered guidance and real-time financial insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a href={loginUrl}>
                <Button size="lg" className="gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="pt-8 text-sm text-muted-foreground">
              <p>✓ No credit card required • ✓ Ontario legal compliance • ✓ Secure & encrypted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need for comprehensive estate planning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Interactive Family Tree */}
            <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Interactive Family Tree</h3>
              <p className="text-muted-foreground mb-4">
                Visually map your family structure and automatically populate beneficiaries with role assignments and relationship tracking.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Visual family mapping
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Role assignments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Automatic population
                </li>
              </ul>
            </div>

            {/* Feature 2: AI Clause Optimizer */}
            <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">AI Clause Optimizer</h3>
              <p className="text-muted-foreground mb-4">
                Get AI-powered suggestions for legally robust will and trust clauses tailored to your specific situation and Ontario precedents.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Legal clause suggestions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Multiple variants
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Ontario compliance
                </li>
              </ul>
            </div>

            {/* Feature 3: Live Tax Estimator */}
            <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Live Tax Estimator</h3>
              <p className="text-muted-foreground mb-4">
                Real-time estate valuation with live market data for stocks, crypto, and real estate to calculate accurate probate fees.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Real-time valuations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Tax calculations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Optimization tips
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground">More Than Just Documents</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Secure & Encrypted</h3>
                    <p className="text-muted-foreground">Bank-level security protects your sensitive information</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">AI Legal Assistant</h3>
                    <p className="text-muted-foreground">Ask questions about your documents anytime</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">PDF Downloads</h3>
                    <p className="text-muted-foreground">Export your documents in professional PDF format</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-12 border border-accent/20">
              <div className="space-y-4 text-center">
                <p className="text-4xl font-bold text-accent">100%</p>
                <p className="text-lg text-foreground font-semibold">Ontario Legal Compliance</p>
                <p className="text-muted-foreground">All documents follow Ontario Succession Law Reform Act requirements</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-32">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Trusted by Ontario Residents</h2>
            <p className="text-lg text-muted-foreground">Join thousands who've simplified their estate planning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-accent mb-2">5,000+</p>
              <p className="text-muted-foreground">Wills & POAs Created</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-accent mb-2">4.9/5</p>
              <p className="text-muted-foreground">Average User Rating</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-accent mb-2">24/7</p>
              <p className="text-muted-foreground">AI Legal Support</p>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent">★</span>
                ))}
              </div>
              <p className="text-foreground mb-4">"This made estate planning so much easier. The interactive family tree and AI suggestions were incredibly helpful."</p>
              <p className="font-semibold text-foreground">Sarah M.</p>
              <p className="text-sm text-muted-foreground">Toronto, ON</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent">★</span>
                ))}
              </div>
              <p className="text-foreground mb-4">"Finally, a legal tool that's actually user-friendly. The tax estimator saved me thousands in probate fees."</p>
              <p className="font-semibold text-foreground">James T.</p>
              <p className="text-sm text-muted-foreground">Ottawa, ON</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-foreground to-secondary text-background">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Protect Your Legacy?</h2>
          <p className="text-lg opacity-90">
            Start creating your Will or Power of Attorney today. No credit card required.
          </p>
          <a href={loginUrl}>
            <Button size="lg" variant="secondary" className="gap-2">
              Create Your Estate Plan <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6" />
                <span className="font-bold">Ontario Wills</span>
              </div>
              <p className="text-sm opacity-75">Professional estate planning for Ontario residents</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm opacity-75">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/about">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm opacity-75">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm opacity-75">
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-75">
            <p>&copy; 2026 Ontario Wills & Power of Attorney Creator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
