import { Button } from "@/components/ui/button";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const loginUrl = getLoginUrl();

  const features = [
    { name: "Wills & POAs", free: true, premium: true },
    { name: "Interactive Family Tree", free: true, premium: true },
    { name: "Basic Document Templates", free: true, premium: true },
    { name: "PDF Download", free: true, premium: true },
    { name: "AI Clause Optimizer", free: false, premium: true },
    { name: "Live Tax Estimator", free: false, premium: true },
    { name: "Real-time Asset Valuation", free: false, premium: true },
    { name: "AI Legal Assistant Chat", free: false, premium: true },
    { name: "Document Versioning", free: false, premium: true },
    { name: "Priority Support", free: false, premium: true },
    { name: "Henson Trust Templates", free: false, premium: true },
    { name: "Re-balancing Alerts", free: false, premium: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-20 md:py-32 bg-gradient-to-br from-background to-muted">
        <div className="container max-w-4xl text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Start for free, upgrade anytime. No hidden fees.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <section className="py-20 md:py-32">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Free Tier */}
            <div className="rounded-lg border-2 border-border bg-card p-8 flex flex-col">
              <h2 className="text-2xl font-bold text-foreground mb-2">Free</h2>
              <p className="text-muted-foreground mb-6">Perfect for getting started</p>
              <div className="mb-8">
                <p className="text-4xl font-bold text-foreground">$0</p>
                <p className="text-muted-foreground text-sm mt-2">Forever free</p>
              </div>
              <Button size="lg" variant="outline" className="w-full mb-8">
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Button>
              <div className="space-y-4 flex-1">
                <p className="font-semibold text-foreground mb-4">Includes:</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Create Wills & POAs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Interactive Family Tree</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Basic Templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">PDF Downloads</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Ontario Legal Compliance</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="rounded-lg border-2 border-accent bg-card p-8 flex flex-col shadow-lg">
              <div className="mb-4">
                <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Premium</h2>
              <p className="text-muted-foreground mb-6">Advanced planning & optimization</p>
              <div className="mb-8">
                <p className="text-4xl font-bold text-foreground">$99</p>
                <p className="text-muted-foreground text-sm mt-2">One-time purchase</p>
              </div>
              <Button size="lg" className="w-full mb-8 gap-2">
                Upgrade Now <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="space-y-4 flex-1">
                <p className="font-semibold text-foreground mb-4">Everything in Free, plus:</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">AI Clause Optimizer</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Live Tax Estimator</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Real-time Asset Valuation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">AI Legal Assistant Chat</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Henson Trust Templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Priority Support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container max-w-6xl">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-4 px-4 text-foreground">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {feature.free ? (
                        <CheckCircle className="w-5 h-5 text-accent mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {feature.premium ? (
                        <CheckCircle className="w-5 h-5 text-accent mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-32">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-2">Can I upgrade from Free to Premium?</h3>
              <p className="text-muted-foreground">Yes! You can upgrade anytime from your dashboard. Your documents and progress will be preserved.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-2">Is Premium a subscription or one-time purchase?</h3>
              <p className="text-muted-foreground">Premium is a one-time purchase of $99. You get lifetime access to all premium features with no recurring charges.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-2">What if I am not satisfied with Premium?</h3>
              <p className="text-muted-foreground">We offer a 30-day money-back guarantee. If you are not satisfied, contact our support team for a full refund.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-2">Do you offer discounts for multiple documents?</h3>
              <p className="text-muted-foreground">Premium gives you unlimited access to all features for creating multiple Wills, POAs, and other documents.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground">Yes, we use bank-level encryption and comply with all Ontario privacy regulations. Your data is never shared with third parties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-foreground to-secondary text-background">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg opacity-90">Start with Free and upgrade anytime. No credit card required.</p>
          <Button size="lg" variant="secondary" className="gap-2">
            Create Your Estate Plan <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
