import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, Plus, Trash2, FileText } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type WillStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface Bequest {
  id: string;
  description: string;
  beneficiary: string;
  conditions?: string;
}

interface MonetaryBequest {
  id: string;
  amount: number;
  beneficiary: string;
  percentage?: number;
}

interface WillFormData {
  // Step 1: Testator Info
  testatorName: string;
  testatorAddress: string;
  testatorAge: string;
  testatorCity: string;
  testatorProvince: string;
  testatorPostalCode: string;

  // Step 2: Family
  spouseName: string;
  maritalStatus: string;
  childrenNames: string[];
  hasMinorChildren: boolean;

  // Step 3: Assets
  assets: Array<{
    id: string;
    type: string;
    description: string;
    value: string;
    location?: string;
  }>;

  // Step 4: Bequests
  specificBequests: Bequest[];
  monetaryBequests: MonetaryBequest[];
  residuaryBeneficiary: string;

  // Step 5: Executor
  executorName: string;
  alternateExecutor: string;
  executorCompensation: string;

  // Step 6: Guardian
  guardianName: string;
  alternateGuardian: string;

  // Step 7: Trusts
  hasHensonTrust: boolean;
  hensonBeneficiary: string;
  hensonTrustee: string;

  // Step 8: Witnesses
  witness1Name: string;
  witness1Address: string;
  witness2Name: string;
  witness2Address: string;

  // Step 9: Special Provisions
  specialProvisions: string;
  hasDisabledBeneficiary: boolean;

  // Step 10: Review
  agreedToCompliance: boolean;
}

const STEP_TITLES = [
  "Testator Information",
  "Family Structure",
  "Asset Inventory",
  "Beneficiary Designations",
  "Executor Appointment",
  "Guardian Appointment",
  "Trust Provisions",
  "Witness Information",
  "Special Provisions",
  "Review & Compliance"
];

export default function ComprehensiveWillCreator() {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<WillStep>(1);
  const [formData, setFormData] = useState<WillFormData>({
    testatorName: "",
    testatorAddress: "",
    testatorAge: "",
    testatorCity: "",
    testatorProvince: "Ontario",
    testatorPostalCode: "",
    spouseName: "",
    maritalStatus: "",
    childrenNames: [],
    hasMinorChildren: false,
    assets: [],
    specificBequests: [],
    monetaryBequests: [],
    residuaryBeneficiary: "",
    executorName: "",
    alternateExecutor: "",
    executorCompensation: "",
    guardianName: "",
    alternateGuardian: "",
    hasHensonTrust: false,
    hensonBeneficiary: "",
    hensonTrustee: "",
    witness1Name: "",
    witness1Address: "",
    witness2Name: "",
    witness2Address: "",
    specialProvisions: "",
    hasDisabledBeneficiary: false,
    agreedToCompliance: false,
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
    if (currentStep < 10) {
      setCurrentStep((currentStep + 1) as WillStep);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WillStep);
      window.scrollTo(0, 0);
    }
  };

  const handleAddChild = () => {
    setFormData((prev) => ({
      ...prev,
      childrenNames: [...prev.childrenNames, ""],
    }));
  };

  const handleUpdateChild = (index: number, value: string) => {
    const newChildren = [...formData.childrenNames];
    newChildren[index] = value;
    setFormData((prev) => ({ ...prev, childrenNames: newChildren }));
  };

  const handleRemoveChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      childrenNames: prev.childrenNames.filter((_, i) => i !== index),
    }));
  };

  const handleAddAsset = () => {
    setFormData((prev) => ({
      ...prev,
      assets: [
        ...prev.assets,
        { id: Date.now().toString(), type: "", description: "", value: "", location: "" },
      ],
    }));
  };

  const handleUpdateAsset = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.map((asset) =>
        asset.id === id ? { ...asset, [field]: value } : asset
      ),
    }));
  };

  const handleRemoveAsset = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((asset) => asset.id !== id),
    }));
  };

  const handleAddBequest = () => {
    setFormData((prev) => ({
      ...prev,
      specificBequests: [
        ...prev.specificBequests,
        { id: Date.now().toString(), description: "", beneficiary: "", conditions: "" },
      ],
    }));
  };

  const handleUpdateBequest = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specificBequests: prev.specificBequests.map((bequest) =>
        bequest.id === id ? { ...bequest, [field]: value } : bequest
      ),
    }));
  };

  const handleRemoveBequest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      specificBequests: prev.specificBequests.filter((bequest) => bequest.id !== id),
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.testatorName) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.executorName) {
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
      testatorAge: formData.testatorAge ? parseInt(formData.testatorAge) : undefined,
      maritalStatus: formData.maritalStatus || undefined,
      hasChildren: formData.childrenNames.length > 0,
      primaryBeneficiary: formData.residuaryBeneficiary || undefined,
      alternateExecutor: formData.alternateExecutor || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-foreground to-secondary text-background py-8 sticky top-0 z-10">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-1">Ontario Will Creator</h1>
          <p className="opacity-90">Step {currentStep} of 10: {STEP_TITLES[currentStep - 1]}</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
              <div key={step} className="flex-1 h-1 rounded-full bg-muted" style={{
                backgroundColor: step <= currentStep ? "var(--accent)" : "var(--muted)"
              }} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">{Math.round((currentStep / 10) * 100)}% Complete</p>
        </div>

        {/* Step 1: Testator Information */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Your Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Legal Name *</label>
                <input
                  type="text"
                  value={formData.testatorName}
                  onChange={(e) => handleInputChange("testatorName", e.target.value)}
                  placeholder="Enter your full legal name"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Age *</label>
                  <input
                    type="number"
                    value={formData.testatorAge}
                    onChange={(e) => handleInputChange("testatorAge", e.target.value)}
                    placeholder="18 or older"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City/Town *</label>
                  <input
                    type="text"
                    value={formData.testatorCity}
                    onChange={(e) => handleInputChange("testatorCity", e.target.value)}
                    placeholder="e.g., Toronto"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Street Address *</label>
                <input
                  type="text"
                  value={formData.testatorAddress}
                  onChange={(e) => handleInputChange("testatorAddress", e.target.value)}
                  placeholder="Enter your street address"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={formData.testatorPostalCode}
                    onChange={(e) => handleInputChange("testatorPostalCode", e.target.value)}
                    placeholder="e.g., M5H 2N2"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Province</label>
                  <input
                    type="text"
                    value={formData.testatorProvince}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
              <p className="text-sm text-muted-foreground">
                ✓ You must be at least 18 years old and of sound mind to make a valid will in Ontario.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Family Structure */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Family Information</h2>
            <div className="space-y-4">
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
              {(formData.maritalStatus === "married" || formData.maritalStatus === "common-law") && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Spouse Name</label>
                  <input
                    type="text"
                    value={formData.spouseName}
                    onChange={(e) => handleInputChange("spouseName", e.target.value)}
                    placeholder="Enter spouse's name"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Do you have children?</label>
                <select
                  value={formData.childrenNames.length > 0 ? "yes" : "no"}
                  onChange={(e) => {
                    if (e.target.value === "no") {
                      handleInputChange("childrenNames", []);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {formData.childrenNames.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">Children Names</label>
                  {formData.childrenNames.map((child, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={child}
                        onChange={(e) => handleUpdateChild(index, e.target.value)}
                        placeholder={`Child ${index + 1} name`}
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button
                        onClick={() => handleRemoveChild(index)}
                        className="px-3 py-2 rounded-lg border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddChild}
                    className="text-accent hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Another Child
                  </button>
                </div>
              )}
              {formData.childrenNames.length > 0 && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasMinorChildren}
                      onChange={(e) => handleInputChange("hasMinorChildren", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">I have minor children (under 18)</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Asset Inventory */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Asset Inventory</h2>
            <div className="space-y-4">
              {formData.assets.map((asset) => (
                <div key={asset.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Asset Type</label>
                      <select
                        value={asset.type}
                        onChange={(e) => handleUpdateAsset(asset.id, "type", e.target.value)}
                        className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select type...</option>
                        <option value="real-estate">Real Estate</option>
                        <option value="bank-account">Bank Account</option>
                        <option value="investment">Investment/Stocks</option>
                        <option value="business">Business Interest</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="personal-item">Personal Item</option>
                        <option value="cryptocurrency">Cryptocurrency</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Estimated Value</label>
                      <input
                        type="number"
                        value={asset.value}
                        onChange={(e) => handleUpdateAsset(asset.id, "value", e.target.value)}
                        placeholder="$0"
                        className="w-full px-3 py-2 rounded border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                    <input
                      type="text"
                      value={asset.description}
                      onChange={(e) => handleUpdateAsset(asset.id, "description", e.target.value)}
                      placeholder="e.g., Primary residence at 123 Main St"
                      className="w-full px-3 py-2 rounded border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveAsset(asset.id)}
                    className="text-destructive hover:text-destructive/80 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Asset
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddAsset}
                className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-accent text-accent hover:bg-accent/5 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Asset
              </button>
            </div>
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
              <p className="text-sm text-muted-foreground">
                💡 Include all significant assets: real estate, bank accounts, investments, vehicles, and personal items of value.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Beneficiary Designations */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Beneficiary Designations</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Specific Bequests</h3>
                {formData.specificBequests.map((bequest) => (
                  <div key={bequest.id} className="p-4 rounded-lg border border-border bg-card space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">What are you leaving?</label>
                      <input
                        type="text"
                        value={bequest.description}
                        onChange={(e) => handleUpdateBequest(bequest.id, "description", e.target.value)}
                        placeholder="e.g., My diamond ring, My vintage car"
                        className="w-full px-3 py-2 rounded border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">To whom?</label>
                      <input
                        type="text"
                        value={bequest.beneficiary}
                        onChange={(e) => handleUpdateBequest(bequest.id, "beneficiary", e.target.value)}
                        placeholder="Beneficiary name"
                        className="w-full px-3 py-2 rounded border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveBequest(bequest.id)}
                      className="text-destructive hover:text-destructive/80 text-sm font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Bequest
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddBequest}
                  className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-accent text-accent hover:bg-accent/5 font-medium flex items-center justify-center gap-2 mb-6"
                >
                  <Plus className="w-4 h-4" /> Add Specific Bequest
                </button>
              </div>

              <div className="border-t border-border pt-6">
                <label className="block text-sm font-medium text-foreground mb-2">Residuary Beneficiary (receives remaining estate) *</label>
                <input
                  type="text"
                  value={formData.residuaryBeneficiary}
                  onChange={(e) => handleInputChange("residuaryBeneficiary", e.target.value)}
                  placeholder="Name of person or charity"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Executor Appointment */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Executor Appointment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Primary Executor *</label>
                <input
                  type="text"
                  value={formData.executorName}
                  onChange={(e) => handleInputChange("executorName", e.target.value)}
                  placeholder="Name of executor"
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Executor Compensation</label>
                <select
                  value={formData.executorCompensation}
                  onChange={(e) => handleInputChange("executorCompensation", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select...</option>
                  <option value="no-compensation">No compensation</option>
                  <option value="reasonable-compensation">Reasonable compensation as allowed by law</option>
                  <option value="percentage">Percentage of estate (specify in will)</option>
                </select>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
              <p className="text-sm text-muted-foreground">
                ✓ The executor manages your estate, pays debts, and distributes assets according to your will. Choose someone trustworthy.
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Guardian Appointment */}
        {currentStep === 6 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Guardian Appointment</h2>
            {formData.hasMinorChildren ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Guardian for Minor Children *</label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => handleInputChange("guardianName", e.target.value)}
                    placeholder="Name of guardian"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Alternate Guardian</label>
                  <input
                    type="text"
                    value={formData.alternateGuardian}
                    onChange={(e) => handleInputChange("alternateGuardian", e.target.value)}
                    placeholder="Name of alternate guardian"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="p-4 rounded-lg bg-orange-50/50 border border-orange-200/50">
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Guardianship is a serious responsibility. Discuss with the proposed guardian before naming them.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-muted-foreground">You indicated you have no minor children. Guardian appointment is not required.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Trust Provisions */}
        {currentStep === 7 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Trust Provisions</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasDisabledBeneficiary}
                  onChange={(e) => handleInputChange("hasDisabledBeneficiary", e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm font-medium text-foreground">I have a beneficiary with a disability</span>
              </label>

              {formData.hasDisabledBeneficiary && (
                <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasHensonTrust}
                      onChange={(e) => handleInputChange("hasHensonTrust", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">Create a Henson Trust (protects government benefits)</span>
                  </label>

                  {formData.hasHensonTrust && (
                    <div className="space-y-4 pl-6 border-l-2 border-accent">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Beneficiary Name</label>
                        <input
                          type="text"
                          value={formData.hensonBeneficiary}
                          onChange={(e) => handleInputChange("hensonBeneficiary", e.target.value)}
                          placeholder="Name of disabled beneficiary"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Trustee Name</label>
                        <input
                          type="text"
                          value={formData.hensonTrustee}
                          onChange={(e) => handleInputChange("hensonTrustee", e.target.value)}
                          placeholder="Name of trustee"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
                <p className="text-sm text-muted-foreground font-medium mb-2">What is a Henson Trust?</p>
                <p className="text-sm text-muted-foreground">
                  A Henson Trust is an absolute discretionary trust that allows you to leave money for a disabled beneficiary without affecting their eligibility for government benefits like ODSP or CPP-D.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Witness Information */}
        {currentStep === 8 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Witness Information</h2>
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-orange-50/50 border border-orange-200/50">
                <AlertCircle className="w-5 h-5 text-orange-600 inline mr-2" />
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> Your witnesses cannot be beneficiaries under this will. They must be impartial third parties.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Witness 1</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.witness1Name}
                      onChange={(e) => handleInputChange("witness1Name", e.target.value)}
                      placeholder="Witness name"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.witness1Address}
                      onChange={(e) => handleInputChange("witness1Address", e.target.value)}
                      placeholder="Witness address"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-4">Witness 2</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.witness2Name}
                      onChange={(e) => handleInputChange("witness2Name", e.target.value)}
                      placeholder="Witness name"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.witness2Address}
                      onChange={(e) => handleInputChange("witness2Address", e.target.value)}
                      placeholder="Witness address"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 9: Special Provisions */}
        {currentStep === 9 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Special Provisions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Additional Instructions or Conditions</label>
                <textarea
                  value={formData.specialProvisions}
                  onChange={(e) => handleInputChange("specialProvisions", e.target.value)}
                  placeholder="e.g., 'My collection of books should go to the library', 'My pet should be cared for by...'"
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Review & Compliance */}
        {currentStep === 10 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Review & Compliance</h2>
            
            <div className="space-y-4">
              <div className="p-6 rounded-lg border border-border bg-card space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  Your Will Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Testator:</span>
                    <span className="font-medium text-foreground">{formData.testatorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Executor:</span>
                    <span className="font-medium text-foreground">{formData.executorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beneficiaries:</span>
                    <span className="font-medium text-foreground">{formData.residuaryBeneficiary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Witnesses:</span>
                    <span className="font-medium text-foreground">{formData.witness1Name}, {formData.witness2Name}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-blue-50/50 border border-blue-200/50 space-y-3">
                <h3 className="font-semibold text-foreground">Ontario Legal Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  This will has been created in compliance with the Ontario Succession Law Reform Act (SLRA) and Trustees Act. It meets all formal requirements for a valid will in Ontario.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>✓ Testator is 18+ years old</li>
                  <li>✓ Will is in writing</li>
                  <li>✓ Testator has signed</li>
                  <li>✓ Two qualified witnesses present</li>
                  <li>✓ Witnesses are not beneficiaries</li>
                </ul>
              </div>

              <div className="p-6 rounded-lg bg-orange-50/50 border border-orange-200/50 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Important Disclaimer
                </h3>
                <p className="text-sm text-muted-foreground">
                  While this will complies with Ontario law, we strongly recommend having a qualified lawyer review it before execution, especially if your situation is complex (blended families, significant assets, business interests, or special needs beneficiaries).
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 border-accent/20 hover:bg-accent/5">
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
          </div>
        )}

        {/* Navigation */}
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
          {currentStep === 10 ? (
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
                  Create Will Document <FileText className="w-4 h-4" />
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
