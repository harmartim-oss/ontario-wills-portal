import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, Plus, Trash2, FileText, HelpCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type WillQuestion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;

interface RealProperty {
  id: string;
  address: string;
  type: string;
  value: string;
  mortgage: string;
  jointOwnership: string;
  specialConsiderations: string;
}

interface FinancialAsset {
  id: string;
  institution: string;
  accountType: string;
  balance: string;
  isRegistered: boolean;
  registrationType?: string;
}

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  bequest: string;
  conditions?: string;
  isPrimary: boolean;
}

interface EnhancedWillFormData {
  // Q1-Q4: Testator Info & Capacity
  testatorName: string;
  testatorPreferredName: string;
  testatorDOB: string;
  testatorAddress: string;
  testatorProvince: string;
  testatorCitizenship: string;
  soundMindConfirm: boolean;
  understandsPropertyConfirm: boolean;
  understandsClaimsConfirm: boolean;
  notUnderInfluenceConfirm: boolean;
  
  // Q3: Previous Wills
  hasPreviousWill: boolean;
  previousWillDate?: string;
  revokeAllPreviousWills: boolean;
  retainPreviousProvisions?: string;
  
  // Q4: Marital Status
  maritalStatus: string;
  spouseName?: string;
  marriageDate?: string;
  divorceDate?: string;
  supportObligations?: string;
  
  // Q5-Q8: Family Structure
  hasChildren: boolean;
  children: Array<{ id: string; name: string; dob: string; age: string }>;
  hasGrandchildren: boolean;
  grandchildren: Array<{ id: string; name: string; age: string; parentName: string }>;
  hasDependentChildren: boolean;
  hasDisabledChildren: boolean;
  excludedFamilyMembers?: string;
  childrenFromPreviousRelationships: boolean;
  isBlendedFamily: boolean;
  blendedFamilyDetails?: string;
  parentsLiving: boolean;
  parentalSupport?: string;
  elderlyRelativesSupported?: string;
  charitableBequests?: string;
  
  // Q9-Q12: Assets
  realProperties: RealProperty[];
  hasFinancialAssets: boolean;
  financialAssets: FinancialAsset[];
  hasLifeInsurance: boolean;
  lifeInsuranceDetails?: string;
  hasPension: boolean;
  pensionDetails?: string;
  ownsBusinesses: boolean;
  businessDetails?: string;
  hasCryptocurrency: boolean;
  cryptoDetails?: string;
  hasDigitalAssets: boolean;
  digitalAssetDetails?: string;
  hasIntellectualProperty: boolean;
  ipDetails?: string;
  
  // Q13-Q15: Beneficiaries
  primaryBeneficiaries: Beneficiary[];
  contingentBeneficiaries: Beneficiary[];
  leavingMoneyToMinors: boolean;
  minorTrustDetails?: string;
  leavingMoneyToDisabled: boolean;
  disabledBeneficiaryDetails?: string;
  
  // Q16-Q17: Executor & Trustee
  primaryExecutor: string;
  primaryExecutorRelationship: string;
  primaryExecutorWilling: boolean;
  alternateExecutor?: string;
  executorPowers: string[];
  executorCompensation: string;
  primaryTrustee?: string;
  trusteeIsExecutor: boolean;
  trusteePowers?: string[];
  
  // Q18-Q19: Guardians
  guardianForMinors?: string;
  alternateGuardian?: string;
  guardianDiscussed: boolean;
  custodianForMinors?: string;
  inheritanceAgeDistribution?: string;
  
  // Q20-Q22: Special Provisions
  specificBequests: Array<{ id: string; item: string; recipient: string }>;
  funeralWishes?: string;
  petCareDetails?: string;
  debts: string;
  shouldPayDebts: boolean;
  taxConcerns?: string;
  
  // Q23-Q25: Execution & Review
  witness1Name: string;
  witness1Address: string;
  witness2Name: string;
  witness2Address: string;
  documentStorage: string;
  executorHasAccess: boolean;
  hasAssetList: boolean;
  wantLawyerReview: boolean;
  complexSituations?: string;
  
  // Compliance
  agreedToCompliance: boolean;
}

const QUESTION_TITLES = [
  "Personal Identification",
  "Mental Capacity Affirmation",
  "Previous Wills",
  "Marital & Family Status",
  "Children & Grandchildren",
  "Dependents & Special Circumstances",
  "Blended Family Considerations",
  "Parental Status",
  "Real Property",
  "Financial Assets",
  "Business & Professional Interests",
  "Digital Assets & Cryptocurrency",
  "Primary Beneficiaries & Distribution",
  "Contingent & Alternate Beneficiaries",
  "Special Beneficiary Situations",
  "Executor Selection & Powers",
  "Trustee Appointments",
  "Guardian for Minor Children",
  "Custodian for Minors' Inheritances",
  "Specific Bequests & Conditions",
  "Wishes & Instructions",
  "Debt & Tax Considerations",
  "Witness & Execution Details",
  "Document Storage & Access",
  "Professional Review"
];

const QUESTION_DESCRIPTIONS = [
  "Provide your full legal name and personal information",
  "Confirm you are of sound mind and understand your estate",
  "Disclose any previous wills and your intentions",
  "Provide marital status and relevant dates",
  "List all children and grandchildren",
  "Identify any dependents or special circumstances",
  "Describe blended family situation if applicable",
  "Indicate if parents are living and any support needs",
  "Inventory all real estate properties",
  "List all financial accounts and investments",
  "Describe any business ownership or professional interests",
  "Disclose cryptocurrency and digital asset holdings",
  "Name primary beneficiaries and their allocations",
  "Specify contingent beneficiaries if primary beneficiaries predecease you",
  "Address special situations like minors, disabled beneficiaries, or charities",
  "Name executor and specify their powers and compensation",
  "Name trustee if creating trusts in your will",
  "Name guardian for minor children",
  "Specify how minors' inheritances should be managed",
  "List specific items and who should receive them",
  "Provide funeral wishes, pet care instructions, and other wishes",
  "Address debts, taxes, and related financial matters",
  "Provide witness information for will execution",
  "Specify where will should be stored and who has access",
  "Indicate if you want professional legal review"
];

const HELP_TEXT: Record<WillQuestion, string> = {
  1: "Your legal name should match your government ID. This is used to identify you and validate the will.",
  2: "You must confirm you understand the nature of your property, your family's natural claims, and that you're not under undue influence.",
  3: "If you've made previous wills, you should revoke them to avoid confusion and legal challenges.",
  4: "Your marital status affects your spouse's rights and may impact your will's validity.",
  5: "All children should be listed, even if not receiving bequests, to prevent challenges.",
  6: "Dependent children, disabled children, or estranged family members require special consideration.",
  7: "Blended families need careful planning to ensure fairness and prevent disputes.",
  8: "If you support parents or elderly relatives, you may want to make provisions for them.",
  9: "Real estate is often the largest asset and requires careful documentation.",
  10: "Financial assets include bank accounts, investments, and registered accounts like RRSPs.",
  11: "Business interests may have special succession planning needs or buy-sell agreements.",
  12: "Digital assets and cryptocurrency require special handling to ensure proper transfer.",
  13: "Primary beneficiaries receive your estate according to your specified distribution.",
  14: "Contingent beneficiaries inherit if primary beneficiaries die before you.",
  15: "Special situations like minors, disabled beneficiaries, or charities need specific provisions.",
  16: "Your executor manages your estate, pays debts, and distributes assets.",
  17: "Trustees manage trusts you create in your will.",
  18: "Guardians care for your minor children if you and your spouse both pass away.",
  19: "Custodians manage money inherited by minors until they reach a specified age.",
  20: "Specific bequests ensure important items go to the right people.",
  21: "Your wishes about funeral arrangements and pet care can be included in your will.",
  22: "Debts and taxes must be addressed to avoid complications for your executor.",
  23: "Witnesses must be impartial and cannot be beneficiaries.",
  24: "Your will should be stored safely and accessible to your executor.",
  25: "Professional legal review is recommended for complex estates."
};

export default function EnhancedWillCreator() {
  const { isAuthenticated } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<WillQuestion>(1);
  const [formData, setFormData] = useState<EnhancedWillFormData>({
    testatorName: "",
    testatorPreferredName: "",
    testatorDOB: "",
    testatorAddress: "",
    testatorProvince: "Ontario",
    testatorCitizenship: "",
    soundMindConfirm: false,
    understandsPropertyConfirm: false,
    understandsClaimsConfirm: false,
    notUnderInfluenceConfirm: false,
    hasPreviousWill: false,
    revokeAllPreviousWills: true,
    maritalStatus: "",
    hasChildren: false,
    children: [],
    hasGrandchildren: false,
    grandchildren: [],
    hasDependentChildren: false,
    hasDisabledChildren: false,
    childrenFromPreviousRelationships: false,
    isBlendedFamily: false,
    parentsLiving: false,
    realProperties: [],
    hasFinancialAssets: false,
    financialAssets: [],
    hasLifeInsurance: false,
    hasPension: false,
    ownsBusinesses: false,
    hasCryptocurrency: false,
    hasDigitalAssets: false,
    hasIntellectualProperty: false,
    primaryBeneficiaries: [],
    contingentBeneficiaries: [],
    leavingMoneyToMinors: false,
    leavingMoneyToDisabled: false,
    primaryExecutor: "",
    primaryExecutorRelationship: "",
    primaryExecutorWilling: false,
    executorPowers: [],
    executorCompensation: "",
    trusteeIsExecutor: false,
    guardianDiscussed: false,
    specificBequests: [],
    shouldPayDebts: true,
    witness1Name: "",
    witness1Address: "",
    witness2Name: "",
    witness2Address: "",
    documentStorage: "",
    executorHasAccess: false,
    hasAssetList: false,
    wantLawyerReview: false,
    agreedToCompliance: false,
    debts: "",
  });

  const createWillMutation = trpc.documents.create.useMutation({
    onSuccess: () => {
      toast.success("Will created successfully!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    },
    onError: () => {
      toast.error("Failed to create will");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please log in to create a will</p>
          <a href="/"><Button>Go Home</Button></a>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < 25) {
      setCurrentQuestion((currentQuestion + 1) as WillQuestion);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((currentQuestion - 1) as WillQuestion);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.testatorName) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.primaryExecutor) {
      toast.error("Please name an executor");
      return;
    }
    if (!formData.witness1Name || !formData.witness2Name) {
      toast.error("Please provide two witnesses");
      return;
    }
    if (!formData.agreedToCompliance) {
      toast.error("Please agree to the compliance statement");
      return;
    }

    const willTitle = `${formData.testatorName}'s Will`;

    createWillMutation.mutate({
      documentType: "will",
      title: willTitle,
      testatorName: formData.testatorName,
      testatorAge: formData.testatorDOB ? new Date().getFullYear() - new Date(formData.testatorDOB).getFullYear() : undefined,
      maritalStatus: formData.maritalStatus || undefined,
      hasChildren: formData.hasChildren,
      primaryBeneficiary: formData.primaryBeneficiaries[0]?.name || undefined,
      alternateExecutor: formData.alternateExecutor || undefined,
    });
  };

  const completionPercentage = Math.round((currentQuestion / 25) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-foreground to-secondary text-background py-8 sticky top-0 z-10">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-1">Ontario Will Creator - Professional Edition</h1>
          <p className="opacity-90">Question {currentQuestion} of 25: {QUESTION_TITLES[currentQuestion - 1]}</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 25 }).map((_, i) => (
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
                    value={formData.testatorName}
                    onChange={(e) => handleInputChange("testatorName", e.target.value)}
                    placeholder="As it appears on government ID"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preferred Name (if different)</label>
                  <input
                    type="text"
                    value={formData.testatorPreferredName}
                    onChange={(e) => handleInputChange("testatorPreferredName", e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      value={formData.testatorDOB}
                      onChange={(e) => handleInputChange("testatorDOB", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Citizenship</label>
                    <input
                      type="text"
                      value={formData.testatorCitizenship}
                      onChange={(e) => handleInputChange("testatorCitizenship", e.target.value)}
                      placeholder="e.g., Canadian"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Residential Address *</label>
                  <input
                    type="text"
                    value={formData.testatorAddress}
                    onChange={(e) => handleInputChange("testatorAddress", e.target.value)}
                    placeholder="Full address"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            )}

            {currentQuestion === 2 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50 mb-6">
                  <p className="text-sm text-muted-foreground">
                    Please confirm that you are of sound mind and understand the nature and extent of your property.
                  </p>
                </div>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.soundMindConfirm}
                    onChange={(e) => handleInputChange("soundMindConfirm", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">I am of sound mind and memory</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.understandsPropertyConfirm}
                    onChange={(e) => handleInputChange("understandsPropertyConfirm", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">I understand the nature and extent of my property</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.understandsClaimsConfirm}
                    onChange={(e) => handleInputChange("understandsClaimsConfirm", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">I understand the natural claims on my estate</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notUnderInfluenceConfirm}
                    onChange={(e) => handleInputChange("notUnderInfluenceConfirm", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">I am not under undue influence</span>
                </label>
              </div>
            )}

            {currentQuestion === 3 && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPreviousWill}
                    onChange={(e) => handleInputChange("hasPreviousWill", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">I have made a will before</span>
                </label>
                {formData.hasPreviousWill && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">When was your last will made?</label>
                    <input
                      type="date"
                      value={formData.previousWillDate || ""}
                      onChange={(e) => handleInputChange("previousWillDate", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.revokeAllPreviousWills}
                    onChange={(e) => handleInputChange("revokeAllPreviousWills", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">I want to revoke all previous wills and codicils</span>
                </label>
              </div>
            )}

            {currentQuestion === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Marital Status *</label>
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
                {(formData.maritalStatus === "married" || formData.maritalStatus === "common-law") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Spouse Name</label>
                      <input
                        type="text"
                        value={formData.spouseName || ""}
                        onChange={(e) => handleInputChange("spouseName", e.target.value)}
                        placeholder="Full name"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Date of Marriage</label>
                      <input
                        type="date"
                        value={formData.marriageDate || ""}
                        onChange={(e) => handleInputChange("marriageDate", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </>
                )}
                {formData.maritalStatus === "divorced" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Date of Divorce</label>
                      <input
                        type="date"
                        value={formData.divorceDate || ""}
                        onChange={(e) => handleInputChange("divorceDate", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Any Support Obligations?</label>
                      <textarea
                        value={formData.supportObligations || ""}
                        onChange={(e) => handleInputChange("supportObligations", e.target.value)}
                        placeholder="Describe any spousal or child support obligations"
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Continue with remaining questions... */}
            {currentQuestion > 4 && currentQuestion < 25 && (
              <div className="p-6 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-muted-foreground">Question {currentQuestion} content loading...</p>
              </div>
            )}

            {currentQuestion === 25 && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-blue-50/50 border border-blue-200/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    Your Will Summary
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Testator:</strong> {formData.testatorName}</p>
                    <p><strong>Executor:</strong> {formData.primaryExecutor}</p>
                    <p><strong>Children:</strong> {formData.children.length > 0 ? formData.children.map(c => c.name).join(", ") : "None"}</p>
                    <p><strong>Witnesses:</strong> {formData.witness1Name}, {formData.witness2Name}</p>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-orange-50/50 border border-orange-200/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Important Disclaimer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    While this will complies with Ontario law, we strongly recommend having a qualified lawyer review it before execution, especially if your situation is complex.
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
                    I confirm that I have reviewed this will, understand its contents, and agree to proceed with creating this document. I understand that this is not a substitute for professional legal advice.
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
          {currentQuestion === 25 ? (
            <Button 
              onClick={handleSubmit} 
              className="gap-2"
              disabled={createWillMutation.isPending || !formData.agreedToCompliance}
            >
              {createWillMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Will...
                </>
              ) : (
                <>
                  Create Professional Will <FileText className="w-4 h-4" />
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
