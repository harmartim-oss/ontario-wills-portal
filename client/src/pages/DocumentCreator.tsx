import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, FileText, Users, DollarSign, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type DocumentType = "will" | "poa-property" | "poa-personal" | null;
type Step = 1 | 2 | 3 | 4;

export default function DocumentCreator() {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [documentType, setDocumentType] = useState<DocumentType>(null);
  const [formData, setFormData] = useState({
    testatorName: "",
    testatorAge: "",
    maritalStatus: "",
    children: "",
    spouse: "",
    primaryBeneficiary: "",
    alternateExecutor: "",
  });

  // Create document mutation
  const createDocMutation = trpc.documents.create.useMutation({
    onSuccess: (result) => {
      toast.success("Document created successfully!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    },
    onError: (error) => {
      toast.error("Failed to create document");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please log in to create a document</p>
          <a href="/"><Button>Go Home</Button></a>
        </div>
      </div>
    );
  }

  const handleDocumentTypeSelect = (type: DocumentType) => {
    setDocumentType(type);
    setCurrentStep(2);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!documentType) {
      toast.error("Please select a document type");
      return;
    }

    if (!formData.testatorName) {
      toast.error("Please enter your name");
      return;
    }

    const documentTitle = `${formData.testatorName}'s ${
      documentType === "will" ? "Will" : documentType === "poa-property" ? "POA for Property" : "POA for Personal Care"
    }`;

    createDocMutation.mutate({
      documentType,
      title: documentTitle,
      testatorName: formData.testatorName,
      testatorAge: formData.testatorAge ? parseInt(formData.testatorAge) : undefined,
      maritalStatus: formData.maritalStatus || undefined,
      hasChildren: formData.children === "yes",
      primaryBeneficiary: formData.primaryBeneficiary || undefined,
      alternateExecutor: formData.alternateExecutor || undefined,
    });
  };

  const getDocumentTitle = () => {
    switch (documentType) {
      case "will":
        return "Create Your Will";
      case "poa-property":
        return "Create Power of Attorney for Property";
      case "poa-personal":
        return "Create Power of Attorney for Personal Care";
      default:
        return "Create Document";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-foreground to-secondary text-background py-8">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">{getDocumentTitle()}</h1>
          <p className="opacity-90">Step {currentStep} of 4</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        {/* Progress Bar */}
        <div className="mb-12 flex gap-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-2 rounded-full transition-colors ${
                  step <= currentStep ? "bg-accent" : "bg-muted"
                }`}
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {["Type", "Personal", "Beneficiaries", "Review"][step - 1]}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1: Document Type Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground">What would you like to create?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => handleDocumentTypeSelect("will")}
                className="p-8 rounded-lg border-2 border-border bg-card hover:border-accent hover:shadow-lg transition-all text-left"
              >
                <FileText className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Will</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Specify how your assets are distributed and appoint an executor.
                </p>
                <div className="text-xs text-accent font-semibold">Ontario Compliant</div>
              </button>

              <button
                onClick={() => handleDocumentTypeSelect("poa-property")}
                className="p-8 rounded-lg border-2 border-border bg-card hover:border-accent hover:shadow-lg transition-all text-left"
              >
                <DollarSign className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">POA for Property</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Authorize someone to manage your financial and property matters.
                </p>
                <div className="text-xs text-accent font-semibold">Ontario Compliant</div>
              </button>

              <button
                onClick={() => handleDocumentTypeSelect("poa-personal")}
                className="p-8 rounded-lg border-2 border-border bg-card hover:border-accent hover:shadow-lg transition-all text-left"
              >
                <Users className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">POA for Personal Care</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Authorize someone to make healthcare and personal care decisions.
                </p>
                <div className="text-xs text-accent font-semibold">Ontario Compliant</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-foreground">Tell us about yourself</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.testatorName}
                  onChange={(e) => handleInputChange("testatorName", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                <input
                  type="number"
                  value={formData.testatorAge}
                  onChange={(e) => handleInputChange("testatorAge", e.target.value)}
                  placeholder="Enter your age"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select...</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="common-law">Common Law</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Do you have children?</label>
                <select
                  value={formData.children}
                  onChange={(e) => handleInputChange("children", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Beneficiaries */}
        {currentStep === 3 && (
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-foreground">Who are your beneficiaries?</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Primary Beneficiary</label>
                <input
                  type="text"
                  value={formData.primaryBeneficiary}
                  onChange={(e) => handleInputChange("primaryBeneficiary", e.target.value)}
                  placeholder="Name of primary beneficiary"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Alternate Executor</label>
                <input
                  type="text"
                  value={formData.alternateExecutor}
                  onChange={(e) => handleInputChange("alternateExecutor", e.target.value)}
                  placeholder="Name of alternate executor"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  💡 Use the Interactive Family Tree in your dashboard to visually map your family and automatically populate beneficiaries.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-foreground">Review your information</h2>
            <div className="space-y-4 p-6 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Document Type</p>
                  <p className="text-muted-foreground">{getDocumentTitle()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Personal Information</p>
                  <p className="text-muted-foreground">{formData.testatorName}, Age {formData.testatorAge || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Primary Beneficiary</p>
                  <p className="text-muted-foreground">{formData.primaryBeneficiary || "Not specified"}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
              <p className="text-sm text-muted-foreground">
                ✓ This document complies with Ontario Succession Law Reform Act requirements. We recommend having a lawyer review before execution.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-12 flex gap-4 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          {currentStep === 4 ? (
            <Button 
              onClick={handleSubmit} 
              className="gap-2"
              disabled={createDocMutation.isPending}
            >
              {createDocMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Document <CheckCircle className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
