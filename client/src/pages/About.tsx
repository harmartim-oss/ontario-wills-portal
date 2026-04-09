import { Shield, CheckCircle, Lock, FileText, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function About() {
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-20 md:py-32 bg-gradient-to-br from-background to-muted">
        <div className="container max-w-4xl text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">About Ontario Wills</h1>
          <p className="text-xl text-muted-foreground">
            Professional estate planning built for Ontario residents, with legal compliance and security at its core.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 md:py-32">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                We believe estate planning should be accessible, affordable, and stress-free. Our mission is to empower Ontario residents to create legally compliant Wills and Powers of Attorney without expensive lawyer fees or complex processes.
              </p>
              <p className="text-lg text-muted-foreground">
                By combining AI-powered guidance, real-time financial insights, and Ontario legal expertise, we make professional estate planning available to everyone.
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-12 border border-accent/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent" />
                  <p className="font-semibold text-foreground">Legally Compliant</p>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-accent" />
                  <p className="font-semibold text-foreground">Secure & Private</p>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-accent" />
                  <p className="font-semibold text-foreground">AI-Powered</p>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-accent" />
                  <p className="font-semibold text-foreground">Ontario-Focused</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Create Your Account</h3>
                <p className="text-muted-foreground">
                  Sign up securely using Manus OAuth. Your account is protected with bank-level encryption.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Build Your Family Tree</h3>
                <p className="text-muted-foreground">
                  Use the Interactive Family Tree to map your family structure and assign roles to beneficiaries, executors, and trustees.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Answer Guided Questions</h3>
                <p className="text-muted-foreground">
                  Our progressive disclosure form guides you through the estate planning process with smart branching that only asks relevant questions.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Get AI Suggestions</h3>
                <p className="text-muted-foreground">
                  The AI Clause Optimizer provides legally robust suggestions for will and trust clauses tailored to your situation and Ontario precedents.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                  5
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Review & Optimize</h3>
                <p className="text-muted-foreground">
                  Use the Live Tax Estimator to calculate probate fees and optimize your estate distribution. Ask the AI Legal Assistant any questions.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                  6
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Download & Execute</h3>
                <p className="text-muted-foreground">
                  Download your Will or POA as a professional PDF. Have it properly executed according to Ontario law requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ontario Legal Compliance */}
      <section className="py-20 md:py-32">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Ontario Legal Compliance</h2>
          <div className="space-y-8">
            <div className="p-8 rounded-lg border border-border bg-card">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Succession Law Reform Act Compliance</h3>
              <p className="text-muted-foreground mb-4">
                All documents created through Ontario Wills comply with Ontario's Succession Law Reform Act (SLRA). This includes:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Proper execution requirements (signature, witnesses, testator capacity)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Valid beneficiary designations and revocation clauses</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Executor appointment and powers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Trust provisions and fiduciary duties</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-lg border border-border bg-card">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Powers of Attorney (POA)</h3>
              <p className="text-muted-foreground mb-4">
                We support two types of Powers of Attorney as defined by Ontario law:
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">POA for Property</h4>
                  <p className="text-muted-foreground">
                    Allows your attorney to manage financial and property matters. Complies with the Power of Attorney Act.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">POA for Personal Care</h4>
                  <p className="text-muted-foreground">
                    Allows your attorney to make healthcare and personal care decisions. Complies with the Health Care Consent Act.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-lg border border-border bg-card">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Estate Administration Tax (Probate Fees)</h3>
              <p className="text-muted-foreground mb-4">
                Our Live Tax Estimator calculates Ontario Estate Administration Tax (EAT) using 2026 rates:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>No EAT on estates under $50,000</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>1.5% on probatable value above $50,000</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Strategies to minimize tax impact</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Security & Privacy</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Encryption</h3>
              </div>
              <p className="text-muted-foreground">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your documents are protected with bank-level security.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Privacy</h3>
              </div>
              <p className="text-muted-foreground">
                We comply with Ontario privacy laws and never share your data with third parties. Your information is used only to create your documents.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Data Retention</h3>
              </div>
              <p className="text-muted-foreground">
                You control your data. Delete your account anytime and all your information will be permanently removed from our servers.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Authentication</h3>
              </div>
              <p className="text-muted-foreground">
                Secure Manus OAuth authentication ensures only you can access your account. No passwords to remember or compromise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Disclaimer */}
      <section className="py-20 md:py-32">
        <div className="container max-w-4xl">
          <div className="p-8 rounded-lg border-2 border-destructive/30 bg-destructive/5">
            <h2 className="text-2xl font-bold text-foreground mb-4">Important Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              Ontario Wills provides tools to help you create estate planning documents. However, this service is not a substitute for legal advice from a qualified lawyer. While our documents comply with Ontario law, we recommend having a lawyer review your documents before execution, especially for complex estates.
            </p>
            <p className="text-muted-foreground">
              Always consult with a lawyer or financial advisor for personalized legal and financial advice. The information provided is general in nature and may not apply to your specific situation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-foreground to-secondary text-background">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Create Your Estate Plan?</h2>
          <p className="text-lg opacity-90">Start for free today. No credit card required.</p>
          <Button size="lg" variant="secondary">
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}
