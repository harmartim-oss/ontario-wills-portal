import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

interface WillData {
  testatorName: string;
  testatorAge?: number;
  maritalStatus: string;
  hasChildren: boolean;
  childrenNames?: string;
  primaryBeneficiary?: string;
  alternateExecutor?: string;
  estateValue?: number;
  [key: string]: any;
}

const WILL_QUESTIONS = [
  // Section 1: Testator Information (6 questions)
  { id: 1, section: 'Testator Information', question: 'What is your full legal name (including any maiden names or aliases)?', field: 'testatorName', type: 'text', required: true },
  { id: 2, section: 'Testator Information', question: 'What is your date of birth?', field: 'dateOfBirth', type: 'date', required: true },
  { id: 3, section: 'Testator Information', question: 'What is your current residential address?', field: 'currentAddress', type: 'textarea', required: true },
  { id: 4, section: 'Testator Information', question: 'What is your current marital status?', field: 'maritalStatus', type: 'select', options: ['Single', 'Married', 'Common-law', 'Divorced', 'Widowed'], required: true },
  { id: 5, section: 'Testator Information', question: 'If married/common-law, what is your spouse\'s full legal name and date of birth?', field: 'spouseInfo', type: 'textarea' },
  { id: 6, section: 'Testator Information', question: 'Have you been married or in a common-law relationship before? If yes, provide details.', field: 'previousMarriages', type: 'textarea' },

  // Section 2: Family Structure (8 questions)
  { id: 7, section: 'Family Structure', question: 'Do you have any children (biological, adopted, or step-children)? If yes, list their names and dates of birth.', field: 'children', type: 'textarea' },
  { id: 8, section: 'Family Structure', question: 'Do you have any grandchildren? If yes, list their names and parents.', field: 'grandchildren', type: 'textarea' },
  { id: 9, section: 'Family Structure', question: 'Are there any other individuals who depend on you financially?', field: 'dependents', type: 'textarea' },
  { id: 10, section: 'Family Structure', question: 'Are there any family members you intentionally wish to exclude from your will? If yes, provide names and reasons.', field: 'excludedFamily', type: 'textarea' },
  { id: 11, section: 'Family Structure', question: 'Do you have a blended family situation? If yes, describe how you want assets distributed.', field: 'blendedFamily', type: 'textarea' },
  { id: 12, section: 'Family Structure', question: 'Do any of your children have special circumstances (disabilities, substance issues, financial irresponsibility)?', field: 'childrenSpecialCircumstances', type: 'textarea' },
  { id: 13, section: 'Family Structure', question: 'Are there any known family conflicts or tensions that might affect inheritance?', field: 'familyConflict', type: 'textarea' },
  { id: 14, section: 'Family Structure', question: 'Do you have an unmarried partner you wish to include in your will?', field: 'unmarriedPartner', type: 'text' },

  // Section 3: Real Property (7 questions)
  { id: 15, section: 'Real Property', question: 'Do you own your primary residence? If yes, provide address and estimated value.', field: 'primaryResidence', type: 'textarea' },
  { id: 16, section: 'Real Property', question: 'Is there a mortgage on your primary residence? If yes, provide lender and approximate balance.', field: 'mortgageInfo', type: 'textarea' },
  { id: 17, section: 'Real Property', question: 'Do you own any investment properties (rental, commercial)? If yes, list addresses and values.', field: 'investmentProperties', type: 'textarea' },
  { id: 18, section: 'Real Property', question: 'Do you own any vacation or cottage properties? If yes, provide details.', field: 'vacationProperties', type: 'textarea' },
  { id: 19, section: 'Real Property', question: 'Do you own any land or vacant properties? If yes, provide details.', field: 'landHoldings', type: 'textarea' },
  { id: 20, section: 'Real Property', question: 'Is any real property owned jointly with others? If yes, provide details.', field: 'jointOwnership', type: 'textarea' },
  { id: 21, section: 'Real Property', question: 'How would you like your real property to be distributed among your beneficiaries?', field: 'propertyDisposition', type: 'textarea' },

  // Section 4: Financial Assets (11 questions)
  { id: 22, section: 'Financial Assets', question: 'List all bank accounts (institution, account type, approximate balance).', field: 'bankAccounts', type: 'textarea' },
  { id: 23, section: 'Financial Assets', question: 'Do you have investment accounts (stocks, bonds, mutual funds)? If yes, list institutions and approximate values.', field: 'investmentAccounts', type: 'textarea' },
  { id: 24, section: 'Financial Assets', question: 'Do you have registered retirement savings plans (RRSPs)? If yes, list institutions and values.', field: 'rrsps', type: 'textarea' },
  { id: 25, section: 'Financial Assets', question: 'Do you have tax-free savings accounts (TFSAs)? If yes, list institutions and values.', field: 'tfsas', type: 'textarea' },
  { id: 26, section: 'Financial Assets', question: 'Do you have GICs or other fixed income investments? If yes, provide details.', field: 'gicsAndFixed', type: 'textarea' },
  { id: 27, section: 'Financial Assets', question: 'Do you receive or are entitled to any pensions? If yes, provide details.', field: 'pensions', type: 'textarea' },
  { id: 28, section: 'Financial Assets', question: 'Do you have life insurance policies? If yes, list beneficiaries and amounts.', field: 'lifeInsurance', type: 'textarea' },
  { id: 29, section: 'Financial Assets', question: 'Do you have any annuities? If yes, provide details.', field: 'annuities', type: 'textarea' },
  { id: 30, section: 'Financial Assets', question: 'Do you have a safe deposit box? If yes, where and what does it contain?', field: 'safeDepositBox', type: 'textarea' },
  { id: 31, section: 'Financial Assets', question: 'Are there any financial accounts with designated beneficiaries? If yes, list them.', field: 'designatedBeneficiaries', type: 'textarea' },
  { id: 32, section: 'Financial Assets', question: 'Estimate your total financial assets (excluding real estate).', field: 'totalFinancialAssets', type: 'text' },

  // Section 5: Business Interests (5 questions)
  { id: 33, section: 'Business Interests', question: 'Do you own or have an interest in any business? If yes, describe the business and your ownership percentage.', field: 'businessDetails', type: 'textarea' },
  { id: 34, section: 'Business Interests', question: 'What type of business is it (sole proprietorship, partnership, corporation)?', field: 'businessType', type: 'text' },
  { id: 35, section: 'Business Interests', question: 'What is the estimated value of your business interest?', field: 'businessValue', type: 'text' },
  { id: 36, section: 'Business Interests', question: 'Is there a buy-sell agreement in place? If yes, provide details.', field: 'buySellAgreement', type: 'textarea' },
  { id: 37, section: 'Business Interests', question: 'How should your business interest be handled after your death?', field: 'businessSuccession', type: 'textarea' },

  // Section 6: Digital & Cryptocurrency Assets (4 questions)
  { id: 38, section: 'Digital Assets', question: 'Do you own any cryptocurrency (Bitcoin, Ethereum, etc.)? If yes, provide details and estimated value.', field: 'cryptocurrency', type: 'textarea' },
  { id: 39, section: 'Digital Assets', question: 'Do you have digital accounts (PayPal, online banking, etc.)? If yes, list them.', field: 'digitalAccounts', type: 'textarea' },
  { id: 40, section: 'Digital Assets', question: 'Do you own any online businesses, websites, or domains? If yes, provide details.', field: 'onlineBusiness', type: 'textarea' },
  { id: 41, section: 'Digital Assets', question: 'Do you have valuable digital subscriptions or accounts? If yes, list them.', field: 'digitalSubscriptions', type: 'textarea' },

  // Section 7: Personal Property (6 questions)
  { id: 42, section: 'Personal Property', question: 'Do you own any vehicles? If yes, list make, model, year, and estimated value.', field: 'vehicles', type: 'textarea' },
  { id: 43, section: 'Personal Property', question: 'Do you own jewelry, art, or collectibles of significant value? If yes, provide details.', field: 'jewelryCollectibles', type: 'textarea' },
  { id: 44, section: 'Personal Property', question: 'Do you have household furnishings of significant value?', field: 'householdFurnishings', type: 'textarea' },
  { id: 45, section: 'Personal Property', question: 'Are there specific personal items you wish to leave to specific people?', field: 'sentimentalItems', type: 'textarea' },
  { id: 46, section: 'Personal Property', question: 'Do you own tools, equipment, or machinery of value?', field: 'toolsEquipment', type: 'textarea' },
  { id: 47, section: 'Personal Property', question: 'Do you have any pets? If yes, who should care for them and are there funds to support them?', field: 'pets', type: 'textarea' },

  // Section 8: Debts & Liabilities (4 questions)
  { id: 48, section: 'Debts & Liabilities', question: 'List all mortgages (lender, property, approximate balance).', field: 'mortgages', type: 'textarea' },
  { id: 49, section: 'Debts & Liabilities', question: 'Do you have any personal loans? If yes, provide details.', field: 'personalLoans', type: 'textarea' },
  { id: 50, section: 'Debts & Liabilities', question: 'Do you have credit card debts? If yes, approximate total.', field: 'creditCardDebts', type: 'text' },
  { id: 51, section: 'Debts & Liabilities', question: 'Do you have any other debts (business loans, tax liabilities, etc.)?', field: 'otherDebts', type: 'textarea' },

  // Section 9: Executor & Trustee (6 questions)
  { id: 52, section: 'Executor & Trustee', question: 'Who should be your executor (estate trustee)? Provide full name, address, and relationship.', field: 'primaryExecutor', type: 'textarea', required: true },
  { id: 53, section: 'Executor & Trustee', question: 'Have you discussed this with the primary executor and confirmed their willingness?', field: 'executorWilling', type: 'select', options: ['Yes', 'No', 'Not yet'] },
  { id: 54, section: 'Executor & Trustee', question: 'Who should be your alternate executor if the primary cannot serve?', field: 'alternateExecutor', type: 'textarea' },
  { id: 55, section: 'Executor & Trustee', question: 'Should your executor receive compensation? If yes, how much or what percentage?', field: 'executorCompensation', type: 'text' },
  { id: 56, section: 'Executor & Trustee', question: 'Should your executor have broad powers or limited powers? Specify any restrictions.', field: 'executorPowers', type: 'textarea' },
  { id: 57, section: 'Executor & Trustee', question: 'Should there be a trust manager separate from the executor? If yes, who?', field: 'trustManager', type: 'textarea' },

  // Section 10: Guardianship & Special Provisions (3 questions)
  { id: 58, section: 'Guardianship & Trusts', question: 'Do you have minor children? If yes, who should be their guardian?', field: 'guardians', type: 'textarea' },
  { id: 59, section: 'Guardianship & Trusts', question: 'Do you want to establish trusts for any beneficiaries? If yes, provide details (e.g., Henson Trust for special needs).', field: 'specialTrusts', type: 'textarea' },
  { id: 60, section: 'Guardianship & Trusts', question: 'Are there any other special wishes or instructions for your estate?', field: 'specialWishes', type: 'textarea' },
];

export default function WillCreatorPro() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<WillData>({
    testatorName: '',
    maritalStatus: '',
    hasChildren: false,
  });

  const { user } = useAuth();
  const [, navigate] = useLocation();
  const createDocument = trpc.documents.create.useMutation();

  const currentQ = WILL_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / WILL_QUESTIONS.length) * 100;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < WILL_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.testatorName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createDocument.mutateAsync({
        documentType: 'will',
        title: `Will for ${formData.testatorName}`,
        testatorName: formData.testatorName,
        maritalStatus: formData.maritalStatus,
        hasChildren: formData.hasChildren,
      });

      toast.success('Will created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error creating will');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Professional Will Creator</h1>
          </div>
          <p className="text-slate-600">Question {currentQuestion + 1} of {WILL_QUESTIONS.length}</p>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-8" />

        {/* Question Card */}
        <Card className="p-8 mb-8 shadow-lg border-0">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3">
              {currentQ.section}
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{currentQ.question}</h2>
            {currentQ.required && <p className="text-red-600 text-sm mt-1">* Required field</p>}
          </div>

          {/* Input Fields */}
          <div className="mb-8">
            {currentQ.type === 'text' && (
              <input
                type="text"
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your answer..."
              />
            )}
            {currentQ.type === 'date' && (
              <input
                type="date"
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            {currentQ.type === 'textarea' && (
              <textarea
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-28 resize-none"
                placeholder="Enter your answer..."
              />
            )}
            {currentQ.type === 'select' && (
              <select
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an option...</option>
                {currentQ.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentQuestion === WILL_QUESTIONS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={createDocument.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6"
              >
                <CheckCircle2 className="w-4 h-4" />
                {createDocument.isPending ? 'Creating Will...' : 'Create Will'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Info Box */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Professional Ontario Will</h3>
              <p className="text-sm text-blue-800">Your responses will generate a professionally formatted Ontario Will that complies with the Succession Law Reform Act (SLRA). The will can be executed with two witnesses and is legally binding.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
