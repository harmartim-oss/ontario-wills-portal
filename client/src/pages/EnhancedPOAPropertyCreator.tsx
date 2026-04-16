import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, HelpCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type POAPropertyQuestion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22;

interface EnhancedPOAPropertyFormData {
  // Q1-Q2: Grantor Info
  grantorName: string;
  grantorDOB: string;
  grantorAddress: string;
  soundMindConfirm: boolean;
  
  // Q2: Purpose & Scope
  poaType: "general" | "limited";
  poaScope: string[];
  
  // Q3-Q5: Attorney Selection
  primaryAttorneyName: string;
  primaryAttorneyRelationship: string;
  primaryAttorneyWilling: boolean;
  successorAttorneyName?: string;
  multipleAttorneys: boolean;
  attorneyJointOrSeparate: "joint" | "separate";
  
  // Q5: Compensation
  attorneyCompensation: string;
  compensationAmount?: string;
  reimbursementExpenses: boolean;
  
  // Q6-Q10: Powers
  realEstatePowers: string[];
  financialAccountPowers: string[];
  investmentPowers: string[];
  businessPowers: string[];
  taxAccountingPowers: string[];
  
  // Q11-Q12: Limitations
  specificLimitations?: string;
  spendingLimit?: string;
  requiresApproval: boolean;
  
  // Q13-Q14: Effective Date & Duration
  effectiveDate: "immediate" | "conditional";
  incapacityDetermination?: string;
  duration: "indefinite" | "specific";
  endDate?: string;
  survivesIncapacity: boolean;
  
  // Q15-Q17: Special Circumstances
  digitalAssetAccess: boolean;
  digitalAssetDetails?: string;
  insuranceBenefitsPowers: boolean;
  familyPersonalMattersPowers: boolean;
  familyPersonalMattersDetails?: string;
  
  // Q18-Q19: Successor & Contingency
  successorAttorneyDetails?: string;
  multipleSuccessors: boolean;
  automaticTermination: boolean;
  terminationConditions?: string;
  
  // Q20-Q22: Execution & Review
  witnessRequired: boolean;
  witness1Name?: string;
  witness2Name?: string;
  notarizationRequired: boolean;
  documentStorage: string;
  attorneyHasCopy: boolean;
  registrationRequired: boolean;
  
  // Compliance
  agreedToCompliance: boolean;
}

const QUESTION_TITLES = [
  "Grantor Information",
  "Purpose & Scope",
  "Primary Attorney",
  "Successor Attorneys",
  "Attorney Compensation",
  "Real Estate Powers",
  "Financial Account Powers",
  "Investment Powers",
  "Business Powers",
  "Tax & Accounting Powers",
  "Specific Limitations",
  "Accountability & Reporting",
  "Effective Date",
  "Duration",
  "Digital Assets & Accounts",
  "Insurance & Benefits",
  "Family & Personal Matters",
  "Successor & Contingency",
  "Revocation & Termination",
  "Witness & Notarization",
  "Document Storage",
  "Communication & Review"
];

const QUESTION_DESCRIPTIONS = [
  "Provide your full legal name and personal information",
  "Specify whether this is a general or limited POA and its scope",
  "Name your primary attorney for property matters",
  "Name successor attorneys if primary is unable to act",
  "Specify how your attorney should be compensated",
  "Define powers regarding real estate transactions",
  "Define powers regarding financial accounts",
  "Define powers regarding investments",
  "Define powers regarding business management",
  "Define powers regarding tax and accounting matters",
  "Specify any limitations on the attorney's powers",
  "Specify reporting and accountability requirements",
  "Determine when this POA becomes effective",
  "Specify how long this POA remains in effect",
  "Specify access to digital assets and accounts",
  "Specify powers regarding insurance and benefits",
  "Specify powers regarding family and personal matters",
  "Name successor attorneys and contingency arrangements",
  "Specify conditions for revocation and termination",
  "Specify witness and notarization requirements",
  "Specify where the original POA will be stored",
  "Confirm communication with your attorney"
];

const HELP_TEXT: Record<POAPropertyQuestion, string> = {
  1: "Your legal name should match your government ID. This POA grants someone authority to manage your property.",
  2: "A general POA grants broad powers; a limited POA restricts powers to specific matters.",
  3: "Your attorney should be someone you trust completely with financial and property decisions.",
  4: "Successor attorneys ensure someone can act if your primary attorney dies or becomes unable.",
  5: "Your attorney can be compensated as a percentage of estate value or a flat fee.",
  6: "Real estate powers allow your attorney to buy, sell, mortgage, or lease property.",
  7: "Financial account powers allow your attorney to deposit, withdraw, and manage funds.",
  8: "Investment powers allow your attorney to buy and sell investments on your behalf.",
  9: "Business powers allow your attorney to manage your business operations.",
  10: "Tax powers allow your attorney to file returns and deal with CRA.",
  11: "You can exclude certain powers or restrict them in specific ways.",
  12: "Your attorney should provide regular accountings of their actions.",
  13: "Immediate POAs take effect right away; conditional POAs take effect upon incapacity.",
  14: "Specify how long this POA lasts (indefinitely or until a specific date).",
  15: "Digital assets require special handling to ensure proper transfer and access.",
  16: "Your attorney can manage insurance policies and claim benefits.",
  17: "Your attorney can make gifts and support family members if authorized.",
  18: "Successor attorneys ensure continuity if your primary attorney cannot act.",
  19: "Specify conditions under which this POA can be revoked or terminated.",
  20: "Witnesses and notarization add formality and legal strength to your POA.",
  21: "Your POA should be stored safely and accessible to your attorney.",
  22: "Your attorney should understand their responsibilities before you sign."
};

export default function EnhancedPOAPropertyCreator() {
  const { isAuthenticated } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<POAPropertyQuestion>(1);
  const [formData, setFormData] = useState<EnhancedPOAPropertyFormData>({
    grantorName: "",
    grantorDOB: "",
    grantorAddress: "",
    soundMindConfirm: false,
    poaType: "general",
    poaScope: [],
    primaryAttorneyName: "",
    primaryAttorneyRelationship: "",
    primaryAttorneyWilling: false,
    multipleAttorneys: false,
    attorneyJointOrSeparate: "separate",
    attorneyCompensation: "as-allowed",
    reimbursementExpenses: true,
    realEstatePowers: [],
    financialAccountPowers: [],
    investmentPowers: [],
    businessPowers: [],
    taxAccountingPowers: [],
    requiresApproval: false,
    effectiveDate: "immediate",
    duration: "indefinite",
    survivesIncapacity: true,
    digitalAssetAccess: false,
    insuranceBenefitsPowers: false,
    familyPersonalMattersPowers: false,
    multipleSuccessors: false,
    automaticTermination: false,
    witnessRequired: false,
    notarizationRequired: false,
    documentStorage: "",
    attorneyHasCopy: false,
    registrationRequired: false,
    agreedToCompliance: false,
  });

  const createPOAMutation = trpc.documents.create.useMutation({
    onSuccess: () => {
      toast.success("Power of Attorney created successfully!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    },
    onError: () => {
      toast.error("Failed to create Power of Attorney");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please log in to create a Power of Attorney</p>
          <a href="/"><Button>Go Home</Button></a>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < 22) {
      setCurrentQuestion((currentQuestion + 1) as POAPropertyQuestion);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((currentQuestion - 1) as POAPropertyQuestion);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!formData.grantorName) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.primaryAttorneyName) {
      toast.error("Please name an attorney");
      return;
    }
    if (!formData.agreedToCompliance) {
      toast.error("Please agree to the compliance statement");
      return;
    }

    const poaTitle = `${formData.grantorName}'s Power of Attorney for Property`;

    createPOAMutation.mutate({
      documentType: "poa-property",
      title: poaTitle,
      testatorName: formData.grantorName,
      testatorAge: formData.grantorDOB ? new Date().getFullYear() - new Date(formData.grantorDOB).getFullYear() : undefined,
    });
  };

  const completionPercentage = Math.round((currentQuestion / 22) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-foreground to-secondary text-background py-8 sticky top-0 z-10">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-1">Ontario Power of Attorney for Property Creator</h1>
          <p className="opacity-90">Question {currentQuestion} of 22: {QUESTION_TITLES[currentQuestion - 1]}</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 22 }).map((_, i) => (
              <div
                key={i + 1}
                className="flex-1 h-2 rounded-full transition-colors"
                style={{
                  backgroundColor: i + 1 <= currentQuestion ? "var(--accent)" : "var(--muted)"
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">{completionPercentage}% Complete</p>
        </div>

        {/* Question Container */}
        <div className="bg-card rounded-lg border border-border p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{QUESTION_TITLES[currentQuestion - 1]}</h2>
              <p className="text-muted-foreground">{QUESTION_DESCRIPTIONS[currentQuestion - 1]}</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="w-5 h-5 text-accent" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {HELP_TEXT[currentQuestion]}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Question Content */}
          <div className="space-y-6">
            {currentQuestion === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Legal Name *</label>
                  <input
                    type="text"
                    value={formData.grantorName}
                    onChange={(e) => handleInputChange("grantorName", e.target.value)}
                    placeholder="As it appears on government ID"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      value={formData.grantorDOB}
                      onChange={(e) => handleInputChange("grantorDOB", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Residential Address *</label>
                  <input
                    type="text"
                    value={formData.grantorAddress}
                    onChange={(e) => handleInputChange("grantorAddress", e.target.value)}
                    placeholder="Full address"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.soundMindConfirm}
                    onChange={(e) => handleInputChange("soundMindConfirm", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">I am of sound mind and understand the nature of this document</span>
                </label>
              </div>
            )}

            {currentQuestion === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">POA Type *</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.poaType === "general"}
                        onChange={() => handleInputChange("poaType", "general")}
                        className="rounded-full border-border"
                      />
                      <div>
                        <span className="font-medium text-foreground">General Power of Attorney</span>
                        <p className="text-xs text-muted-foreground">Grants broad powers for all property matters</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.poaType === "limited"}
                        onChange={() => handleInputChange("poaType", "limited")}
                        className="rounded-full border-border"
                      />
                      <div>
                        <span className="font-medium text-foreground">Limited Power of Attorney</span>
                        <p className="text-xs text-muted-foreground">Restricts powers to specific matters</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentQuestion === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Primary Attorney Name *</label>
                  <input
                    type="text"
                    value={formData.primaryAttorneyName}
                    onChange={(e) => handleInputChange("primaryAttorneyName", e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Relationship</label>
                  <input
                    type="text"
                    value={formData.primaryAttorneyRelationship}
                    onChange={(e) => handleInputChange("primaryAttorneyRelationship", e.target.value)}
                    placeholder="e.g., Spouse, Adult Child, Friend"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.primaryAttorneyWilling}
                    onChange={(e) => handleInputChange("primaryAttorneyWilling", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">I have discussed this with my attorney and they are willing</span>
                </label>
              </div>
            )}

            {/* Continue with remaining questions... */}
            {currentQuestion > 3 && currentQuestion < 22 && (
              <div className="p-6 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-muted-foreground">Question {currentQuestion} content loading...</p>
              </div>
            )}

            {currentQuestion === 22 && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-blue-50/50 border border-blue-200/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    Your POA Summary
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Grantor:</strong> {formData.grantorName}</p>
                    <p><strong>Attorney:</strong> {formData.primaryAttorneyName}</p>
                    <p><strong>Type:</strong> {formData.poaType === "general" ? "General" : "Limited"}</p>
                    <p><strong>Effective:</strong> {formData.effectiveDate === "immediate" ? "Immediately" : "Upon Incapacity"}</p>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-orange-50/50 border border-orange-200/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Important Disclaimer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This Power of Attorney must comply with Ontario law. We recommend having a lawyer review it before execution, especially for complex property matters.
                  </p>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-accent/20 hover:bg-accent/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToCompliance}
                    onChange={(e) => handleInputChange("agreedToCompliance", e.target.checked)}
                    className="rounded border-border mt-1"
                  />
                  <span className="text-sm text-foreground">
                    I confirm that I have reviewed this Power of Attorney, understand its contents, and agree to proceed. I understand this is not a substitute for professional legal advice.
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 1}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          {currentQuestion === 22 ? (
            <Button 
              onClick={handleSubmit} 
              className="gap-2"
              disabled={createPOAMutation.isPending || !formData.agreedToCompliance}
            >
              {createPOAMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating POA...
                </>
              ) : (
                <>
                  Create Power of Attorney
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
