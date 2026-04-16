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

type POAPersonalCareQuestion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

interface EnhancedPOAPersonalCareFormData {
  // Q1-Q2: Grantor Info
  grantorName: string;
  grantorDOB: string;
  grantorAddress: string;
  soundMindConfirm: boolean;
  creationReason?: string;
  
  // Q3-Q4: Attorney Selection
  primaryAttorneyName: string;
  primaryAttorneyRelationship: string;
  primaryAttorneyWilling: boolean;
  successorAttorneyName?: string;
  
  // Q5-Q9: Health Care Decisions
  lifesustainingTreatment: "yes" | "no" | "conditional";
  cprPreference: "yes" | "no" | "conditional";
  mechanicalVentilation: "yes" | "no" | "conditional";
  artificialNutrition: "yes" | "no" | "conditional";
  lifesustainingConditions?: string;
  
  // Q6: Organ Donation
  organDonor: boolean;
  organDonorRestrictions?: string;
  attorneyDecides: boolean;
  
  // Q7: Mental Health Treatment
  psychiatricTreatment: boolean;
  psychiatricMedication: boolean;
  psychiatricHospitalization: boolean;
  
  // Q8: Palliative & End-of-Life
  palliativeCare: boolean;
  painManagement: boolean;
  dyingPreference: "home" | "hospital" | "facility" | "no-preference";
  
  // Q9: Specific Medical Conditions
  dementiaInstructions?: string;
  cancerInstructions?: string;
  strokeInstructions?: string;
  terminalIllnessInstructions?: string;
  
  // Q10-Q12: Personal & Social
  livingArrangementDecisions: boolean;
  livingPreference?: string;
  socialActivitiesEncouraged: boolean;
  religiousActivitiesDecisions: boolean;
  religiousPreference?: string;
  
  // Q13-Q15: Values & Wishes
  coreValues: string;
  whatMatters: string;
  unacceptableSituations?: string;
  qualityOfLifeBalance?: string;
  
  // Q16-Q20: Execution & Review
  witness1Name?: string;
  witness2Name?: string;
  notarizationRequired: boolean;
  documentStorage: string;
  attorneyHasCopy: boolean;
  discussedWithAttorney: boolean;
  
  // Compliance
  agreedToCompliance: boolean;
}

const QUESTION_TITLES = [
  "Grantor Information",
  "Purpose & Circumstances",
  "Primary Attorney",
  "Successor Attorney",
  "Life-Sustaining Treatment",
  "Organ Donation",
  "Mental Health Treatment",
  "Palliative & End-of-Life Care",
  "Specific Medical Conditions",
  "Living Arrangements",
  "Social & Recreational Activities",
  "Religious & Spiritual Wishes",
  "Your Core Values",
  "What Matters Most",
  "Quality of Life Considerations",
  "Witness & Notarization",
  "Document Storage",
  "Communication & Review",
  "Final Confirmation",
  "Summary & Submission"
];

const QUESTION_DESCRIPTIONS = [
  "Provide your full legal name and personal information",
  "Explain why you're creating this POA and any specific health concerns",
  "Name the person you want to make personal care decisions for you",
  "Name a successor if your primary attorney cannot act",
  "Specify your wishes regarding life-sustaining treatment",
  "Indicate whether you want to be an organ donor",
  "Specify your wishes regarding mental health treatment",
  "Specify your wishes regarding palliative and end-of-life care",
  "Provide specific instructions for particular medical conditions",
  "Specify who should decide where you live if you become incapacitated",
  "Indicate whether your attorney should encourage social activities",
  "Specify your religious and spiritual preferences",
  "Describe your core values and what's important to you",
  "Explain what matters most in your life",
  "Describe your views on quality of life and acceptable treatment",
  "Specify witness and notarization requirements",
  "Specify where the original POA will be stored",
  "Confirm you've discussed this with your attorney",
  "Final review of your personal care wishes",
  "Review summary and submit your POA"
];

const HELP_TEXT: Record<POAPersonalCareQuestion, string> = {
  1: "Your legal name should match your government ID. This POA grants someone authority to make personal care decisions.",
  2: "Explain any health concerns or reasons for creating this document now.",
  3: "Your attorney should be someone you trust completely with deeply personal decisions.",
  4: "A successor ensures someone can act if your primary attorney dies or becomes unable.",
  5: "Specify whether you want life-sustaining treatment and under what circumstances.",
  6: "Indicate whether you want to donate organs and any restrictions.",
  7: "Specify your wishes regarding psychiatric treatment and medication.",
  8: "Specify your wishes regarding palliative care and end-of-life decisions.",
  9: "Provide specific instructions for conditions like dementia, cancer, or stroke.",
  10: "Specify who should decide where you live (home, assisted living, facility).",
  11: "Indicate whether your attorney should encourage social and recreational activities.",
  12: "Specify your religious and spiritual preferences and practices.",
  13: "Describe your core values to guide your attorney's decisions.",
  14: "Explain what matters most to you in life.",
  15: "Describe your views on acceptable quality of life and treatment.",
  16: "Witnesses add formality and legal strength to your POA.",
  17: "Your POA should be stored safely and accessible to your attorney.",
  18: "Your attorney should understand their responsibilities.",
  19: "Final review of all your personal care wishes.",
  20: "Submit your completed Power of Attorney for Personal Care."
};

export default function EnhancedPOAPersonalCareCreator() {
  const { isAuthenticated } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<POAPersonalCareQuestion>(1);
  const [formData, setFormData] = useState<EnhancedPOAPersonalCareFormData>({
    grantorName: "",
    grantorDOB: "",
    grantorAddress: "",
    soundMindConfirm: false,
    primaryAttorneyName: "",
    primaryAttorneyRelationship: "",
    primaryAttorneyWilling: false,
    lifesustainingTreatment: "conditional",
    cprPreference: "conditional",
    mechanicalVentilation: "conditional",
    artificialNutrition: "conditional",
    organDonor: false,
    attorneyDecides: false,
    psychiatricTreatment: false,
    psychiatricMedication: false,
    psychiatricHospitalization: false,
    palliativeCare: true,
    painManagement: true,
    dyingPreference: "no-preference",
    socialActivitiesEncouraged: true,
    religiousActivitiesDecisions: false,
    documentStorage: "",
    attorneyHasCopy: false,
    discussedWithAttorney: false,
    coreValues: "",
    whatMatters: "",
    livingArrangementDecisions: false,
    notarizationRequired: false,
    agreedToCompliance: false,
  });

  const createPOAMutation = trpc.documents.create.useMutation({
    onSuccess: () => {
      toast.success("Power of Attorney for Personal Care created successfully!");
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
    if (currentQuestion < 20) {
      setCurrentQuestion((currentQuestion + 1) as POAPersonalCareQuestion);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((currentQuestion - 1) as POAPersonalCareQuestion);
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

    const poaTitle = `${formData.grantorName}'s Power of Attorney for Personal Care`;

    createPOAMutation.mutate({
      documentType: "poa-personal",
      title: poaTitle,
      testatorName: formData.grantorName,
      testatorAge: formData.grantorDOB ? new Date().getFullYear() - new Date(formData.grantorDOB).getFullYear() : undefined,
    });
  };

  const completionPercentage = Math.round((currentQuestion / 20) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-foreground to-secondary text-background py-8 sticky top-0 z-10">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-1">Ontario Power of Attorney for Personal Care Creator</h1>
          <p className="opacity-90">Question {currentQuestion} of 20: {QUESTION_TITLES[currentQuestion - 1]}</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 20 }).map((_, i) => (
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
                  <label className="block text-sm font-medium text-foreground mb-2">Why are you creating this POA?</label>
                  <textarea
                    value={formData.creationReason || ""}
                    onChange={(e) => handleInputChange("creationReason", e.target.value)}
                    placeholder="Describe any health concerns or reasons for creating this document now"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                  />
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

            {currentQuestion === 5 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Specify your wishes regarding life-sustaining treatment. You can choose yes, no, or conditional (only under certain circumstances).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">CPR (Cardiopulmonary Resuscitation)</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.cprPreference === "yes"}
                        onChange={() => handleInputChange("cprPreference", "yes")}
                        className="rounded-full border-border"
                      />
                      <span className="text-sm font-medium text-foreground">Yes, I want CPR</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.cprPreference === "no"}
                        onChange={() => handleInputChange("cprPreference", "no")}
                        className="rounded-full border-border"
                      />
                      <span className="text-sm font-medium text-foreground">No, I do not want CPR</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.cprPreference === "conditional"}
                        onChange={() => handleInputChange("cprPreference", "conditional")}
                        className="rounded-full border-border"
                      />
                      <span className="text-sm font-medium text-foreground">Only under certain circumstances</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Continue with remaining questions... */}
            {currentQuestion > 3 && currentQuestion !== 5 && currentQuestion < 20 && (
              <div className="p-6 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-muted-foreground">Question {currentQuestion} content loading...</p>
              </div>
            )}

            {currentQuestion === 20 && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-blue-50/50 border border-blue-200/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    Your POA Summary
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Grantor:</strong> {formData.grantorName}</p>
                    <p><strong>Attorney:</strong> {formData.primaryAttorneyName}</p>
                    <p><strong>Life-Sustaining Treatment:</strong> {formData.lifesustainingTreatment}</p>
                    <p><strong>Palliative Care:</strong> {formData.palliativeCare ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-orange-50/50 border border-orange-200/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Important Disclaimer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This Power of Attorney for Personal Care must comply with Ontario law. We recommend having a lawyer review it before execution.
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
          {currentQuestion === 20 ? (
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
