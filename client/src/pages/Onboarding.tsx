import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"profile" | "tier">("profile");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [selectedTier, setSelectedTier] = useState<"free" | "premium">("free");

  const updateProfile = trpc.user.updateProfile.useMutation();
  const upgradePlan = trpc.user.upgradePlan.useMutation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleProfileSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        email: formData.email,
      });
      toast.success("Profile updated!");
      setStep("tier");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleTierSelection = async () => {
    if (selectedTier === "premium") {
      try {
        await upgradePlan.mutateAsync({
          planType: "premium",
          billingCycle: "annual",
        });
        toast.success("Welcome to Premium!");
      } catch (error) {
        toast.error("Failed to upgrade plan");
        return;
      }
    }

    // Redirect to dashboard
    navigate("/dashboard");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container max-w-2xl py-20">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === "profile"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step !== "profile" ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <span className="font-semibold text-foreground">
                Complete Profile
              </span>
            </div>

            <div className="flex-1 h-1 mx-4 bg-muted" />

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === "tier"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="font-semibold text-foreground">Select Plan</span>
            </div>
          </div>
        </div>

        {/* Step 1: Profile */}
        {step === "profile" && (
          <Card className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Ontario Wills!
              </h1>
              <p className="text-muted-foreground">
                Let's get your profile set up so we can personalize your
                experience.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleProfileSubmit}
              disabled={updateProfile.isPending}
              className="w-full gap-2"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Step 2: Pricing Tier */}
        {step === "tier" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Choose Your Plan
              </h1>
              <p className="text-muted-foreground">
                Select the plan that works best for you. You can upgrade or
                downgrade anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Tier */}
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  selectedTier === "free"
                    ? "border-accent border-2 bg-accent/5"
                    : "border-border hover:border-accent/50"
                }`}
                onClick={() => setSelectedTier("free")}
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground">Free</h3>
                  <p className="text-muted-foreground text-sm">
                    Perfect for getting started
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-foreground">$0</p>
                  <p className="text-muted-foreground text-sm">Forever free</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      Create Wills & POAs
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      Basic Templates
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      PDF Downloads
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      Ontario Legal Compliance
                    </span>
                  </li>
                </ul>

                {selectedTier === "free" && (
                  <div className="text-accent font-semibold text-sm">
                    ✓ Selected
                  </div>
                )}
              </Card>

              {/* Premium Tier */}
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  selectedTier === "premium"
                    ? "border-accent border-2 bg-accent/5 shadow-lg"
                    : "border-border hover:border-accent/50"
                }`}
                onClick={() => setSelectedTier("premium")}
              >
                <div className="mb-4">
                  <div className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold mb-2">
                    Most Popular
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Premium</h3>
                  <p className="text-muted-foreground text-sm">
                    Advanced planning & optimization
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-foreground">$99</p>
                  <p className="text-muted-foreground text-sm">One-time</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      Everything in Free
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      AI Clause Optimizer
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      Live Tax Estimator
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      AI Legal Assistant Chat
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      Priority Support
                    </span>
                  </li>
                </ul>

                {selectedTier === "premium" && (
                  <div className="text-accent font-semibold text-sm">
                    ✓ Selected
                  </div>
                )}
              </Card>
            </div>

            <Button
              size="lg"
              onClick={handleTierSelection}
              disabled={upgradePlan.isPending}
              className="w-full gap-2"
            >
              {upgradePlan.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedTier === "premium"
                    ? "Upgrade to Premium"
                    : "Continue with Free"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              You can change your plan anytime from your account settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
