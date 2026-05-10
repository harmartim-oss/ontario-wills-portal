import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

interface WillFormData {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  citizenship: string;
  sin: string;
  currentAddress: string;
  phone: string;
  email: string;
  occupation: string;
  employer: string;
  
  // Marital Status
  maritalStatus: string;
  spouseName: string;
  spouseAddress: string;
  marriageDate: string;
  marriagePlace: string;
  previousMarriages: string;
  marriageAgreement: string;
  
  // Children & Grandchildren
  hasChildren: string;
  childrenDetails: Array<{ name: string; dob: string; address: string; maritalStatus: string }>;
  hasGrandchildren: string;
  grandchildrenDetails: Array<{ name: string; dob: string; parentName: string }>;
  hasDependants: string;
  dependantDetails: string;
  
  // Guardianship
  minorChildren: string;
  guardianName: string;
  guardianAddress: string;
  alternateGuardianName: string;
  alternateGuardianAddress: string;
  
  // Assets - Financial
  bankAccounts: string;
  investments: string;
  rrsp: string;
  rrif: string;
  tfsa: string;
  lifeInsurance: string;
  pension: string;
  otherFinancial: string;
  
  // Assets - Real Property
  primaryResidence: string;
  secondaryProperties: string;
  propertyDetails: string;
  
  // Assets - Personal Property
  vehicles: string;
  jewellery: string;
  artwork: string;
  collectables: string;
  heirlooms: string;
  
  // Business Interests
  hasBusinessInterests: string;
  businessName: string;
  businessStructure: string;
  ownershipPercentage: string;
  businessValue: string;
  shareholderAgreement: string;
  
  // Liabilities
  mortgages: string;
  loans: string;
  creditCardDebt: string;
  otherDebts: string;
  
  // Executors
  executorName: string;
  executorRelationship: string;
  executorAddress: string;
  alternateExecutorName: string;
  alternateExecutorRelationship: string;
  executorPowers: string;
  executorCompensation: string;
  
  // Beneficiaries - Specific Gifts
  specificGifts: Array<{ item: string; recipient: string; alternateRecipient: string }>;
  
  // Beneficiaries - Residue
  residueDistribution: string;
  residuePercentages: string;
  alternateResidueRecipient: string;
  
  // Trusts & Special Provisions
  hasHensonTrust: string;
  hensonTrustDetails: string;
  ageContingencies: string;
  conditions: string;
  restrictions: string;
  
  // Digital Assets
  emailAccounts: string;
  socialMedia: string;
  cryptocurrency: string;
  onlineAccounts: string;
  
  // Funeral Wishes
  burialPreference: string;
  funeralLocation: string;
  memorialService: string;
  
  // Special Instructions
  specialInstructions: string;
  charities: string;
  familyHarmony: string;
  
  // Capacity & Medical
  capacityConcerns: string;
  mentalHealthHistory: string;
  physicianName: string;
  physicianContact: string;
  
  // Existing Documents
  existingWill: string;
  existingPOAProperty: string;
  existingPOAPersonalCare: string;
}

const QUESTIONS = [
  {
    id: 'fullName',
    category: 'Personal Information',
    question: 'What is your full legal name?',
    type: 'text',
    required: true,
    tooltip: 'Enter your full legal name as it appears on your government-issued ID',
  },
  {
    id: 'dateOfBirth',
    category: 'Personal Information',
    question: 'What is your date of birth?',
    type: 'date',
    required: true,
    tooltip: 'For capacity verification and identification purposes',
  },
  {
    id: 'placeOfBirth',
    category: 'Personal Information',
    question: 'Where were you born?',
    type: 'text',
    required: false,
    tooltip: 'City and province/country of birth',
  },
  {
    id: 'citizenship',
    category: 'Personal Information',
    question: 'What is your citizenship?',
    type: 'text',
    required: false,
    tooltip: 'Your citizenship status',
  },
  {
    id: 'sin',
    category: 'Personal Information',
    question: 'What is your Social Insurance Number (SIN)?',
    type: 'text',
    required: false,
    tooltip: 'For tax and identification purposes (optional)',
  },
  {
    id: 'currentAddress',
    category: 'Personal Information',
    question: 'What is your current address?',
    type: 'textarea',
    required: true,
    tooltip: 'Your full residential address',
  },
  {
    id: 'phone',
    category: 'Personal Information',
    question: 'What is your phone number?',
    type: 'text',
    required: true,
    tooltip: 'Your contact phone number',
  },
  {
    id: 'email',
    category: 'Personal Information',
    question: 'What is your email address?',
    type: 'email',
    required: true,
    tooltip: 'Your email contact',
  },
  {
    id: 'occupation',
    category: 'Personal Information',
    question: 'What is your occupation?',
    type: 'text',
    required: false,
    tooltip: 'Your current occupation or profession',
  },
  {
    id: 'employer',
    category: 'Personal Information',
    question: 'Who is your employer?',
    type: 'text',
    required: false,
    tooltip: 'Your current employer or business name',
  },
  {
    id: 'maritalStatus',
    category: 'Marital Status & Relationships',
    question: 'What is your current marital status?',
    type: 'select',
    options: ['Single', 'Common Law', 'Engaged', 'Married', 'Separated', 'Divorced', 'Widowed'],
    required: true,
    tooltip: 'Your current marital status',
  },
  {
    id: 'spouseName',
    category: 'Marital Status & Relationships',
    question: 'What is your spouse\'s name?',
    type: 'text',
    required: false,
    conditional: { field: 'maritalStatus', values: ['Married', 'Common Law', 'Separated'] },
    tooltip: 'Full legal name of your spouse',
  },
  {
    id: 'spouseAddress',
    category: 'Marital Status & Relationships',
    question: 'What is your spouse\'s address?',
    type: 'textarea',
    required: false,
    conditional: { field: 'maritalStatus', values: ['Married', 'Common Law', 'Separated'] },
    tooltip: 'Current address of your spouse',
  },
  {
    id: 'marriageDate',
    category: 'Marital Status & Relationships',
    question: 'What is your marriage date?',
    type: 'date',
    required: false,
    conditional: { field: 'maritalStatus', values: ['Married', 'Separated', 'Divorced'] },
    tooltip: 'Date of marriage',
  },
  {
    id: 'marriagePlace',
    category: 'Marital Status & Relationships',
    question: 'Where were you married?',
    type: 'text',
    required: false,
    conditional: { field: 'maritalStatus', values: ['Married', 'Separated', 'Divorced'] },
    tooltip: 'Location of marriage',
  },
  {
    id: 'previousMarriages',
    category: 'Marital Status & Relationships',
    question: 'Do you have any previous marriages?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Information about any previous marriages',
  },
  {
    id: 'marriageAgreement',
    category: 'Marital Status & Relationships',
    question: 'Do you have a Marriage Contract, Cohabitation Agreement, or Separation Agreement?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Any legal agreements regarding marital property',
  },
  {
    id: 'hasChildren',
    category: 'Children & Grandchildren',
    question: 'Do you have any children?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true,
    tooltip: 'Include biological, adopted, and step-children',
  },
  {
    id: 'childrenDetails',
    category: 'Children & Grandchildren',
    question: 'Please provide details for each child',
    type: 'complex',
    required: false,
    conditional: { field: 'hasChildren', values: ['Yes'] },
    tooltip: 'Name, date of birth, address, and marital status for each child',
  },
  {
    id: 'hasGrandchildren',
    category: 'Children & Grandchildren',
    question: 'Do you have any grandchildren?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Include all grandchildren',
  },
  {
    id: 'hasDependants',
    category: 'Children & Grandchildren',
    question: 'Do you have any dependants other than your children?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Any other people financially dependent on you',
  },
  {
    id: 'minorChildren',
    category: 'Guardianship',
    question: 'Do you have any children under the age of 18?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    conditional: { field: 'hasChildren', values: ['Yes'] },
    tooltip: 'Any children who are minors',
  },
  {
    id: 'guardianName',
    category: 'Guardianship',
    question: 'Who would you like to appoint as guardian for your minor children?',
    type: 'text',
    required: false,
    conditional: { field: 'minorChildren', values: ['Yes'] },
    tooltip: 'Full name of preferred guardian',
  },
  {
    id: 'alternateGuardianName',
    category: 'Guardianship',
    question: 'Who would you like to appoint as alternate guardian?',
    type: 'text',
    required: false,
    conditional: { field: 'minorChildren', values: ['Yes'] },
    tooltip: 'Backup guardian if primary is unable to serve',
  },
  {
    id: 'bankAccounts',
    category: 'Assets - Financial',
    question: 'Do you have any bank accounts?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Savings, chequing, or other bank accounts',
  },
  {
    id: 'investments',
    category: 'Assets - Financial',
    question: 'Do you have any investments (stocks, bonds, mutual funds)?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Investment accounts and securities',
  },
  {
    id: 'rrsp',
    category: 'Assets - Financial',
    question: 'Do you have any RRSPs (Registered Retirement Savings Plans)?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Registered retirement savings accounts',
  },
  {
    id: 'rrif',
    category: 'Assets - Financial',
    question: 'Do you have any RRIFs (Registered Retirement Income Funds)?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Registered retirement income accounts',
  },
  {
    id: 'tfsa',
    category: 'Assets - Financial',
    question: 'Do you have any TFSAs (Tax-Free Savings Accounts)?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Tax-free savings accounts',
  },
  {
    id: 'lifeInsurance',
    category: 'Assets - Financial',
    question: 'Do you have any life insurance policies?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Life insurance policies and beneficiary designations',
  },
  {
    id: 'pension',
    category: 'Assets - Financial',
    question: 'Do you have any pension plans?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Employer or personal pension plans',
  },
  {
    id: 'primaryResidence',
    category: 'Assets - Real Property',
    question: 'Do you own a primary residence?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Your main home',
  },
  {
    id: 'secondaryProperties',
    category: 'Assets - Real Property',
    question: 'Do you own any secondary properties (cottage, investment property, etc.)?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Any properties other than your primary residence',
  },
  {
    id: 'hasBusinessInterests',
    category: 'Business Interests',
    question: 'Do you have any business interests?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Sole proprietorship, partnership, corporation, or other business',
  },
  {
    id: 'businessStructure',
    category: 'Business Interests',
    question: 'What is your business structure?',
    type: 'select',
    options: ['Sole Proprietor', 'Partnership', 'Corporation', 'LLC/Other'],
    required: false,
    conditional: { field: 'hasBusinessInterests', values: ['Yes'] },
    tooltip: 'How your business is legally structured',
  },
  {
    id: 'executorName',
    category: 'Executors & Trustees',
    question: 'Who would you like to appoint as your executor?',
    type: 'text',
    required: true,
    tooltip: 'Full name of person to manage your estate',
  },
  {
    id: 'executorRelationship',
    category: 'Executors & Trustees',
    question: 'What is the executor\'s relationship to you?',
    type: 'text',
    required: true,
    tooltip: 'Family member, friend, professional, etc.',
  },
  {
    id: 'alternateExecutorName',
    category: 'Executors & Trustees',
    question: 'Who would you like to appoint as alternate executor?',
    type: 'text',
    required: false,
    tooltip: 'Backup executor if primary is unable to serve',
  },
  {
    id: 'residueDistribution',
    category: 'Beneficiaries - Residue',
    question: 'How would you like to distribute the residue of your estate?',
    type: 'textarea',
    required: true,
    tooltip: 'Everything remaining after debts, taxes, and specific gifts (e.g., 50% to child A, 50% to child B)',
  },
  {
    id: 'hasHensonTrust',
    category: 'Trusts & Special Provisions',
    question: 'Do you have any beneficiaries with disabilities who might benefit from a Henson Trust?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'A Henson Trust protects ODSP eligibility for disabled beneficiaries',
  },
  {
    id: 'specialInstructions',
    category: 'Special Instructions',
    question: 'Are there any special instructions or wishes you would like included in your will?',
    type: 'textarea',
    required: false,
    tooltip: 'Any additional instructions, wishes, or explanations',
  },
  {
    id: 'capacityConcerns',
    category: 'Capacity & Medical',
    question: 'Do you have any capacity-related concerns or diagnoses?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Any mental health, cognitive, or capacity issues',
  },
  {
    id: 'physicianName',
    category: 'Capacity & Medical',
    question: 'What is your physician\'s name?',
    type: 'text',
    required: false,
    tooltip: 'Your primary care physician',
  },
  {
    id: 'existingWill',
    category: 'Existing Documents',
    question: 'Do you have an existing will?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: false,
    tooltip: 'Any previous will documents',
  },
];

export default function RevampedWillCreator() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<WillFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createWillMutation = trpc.documents.create.useMutation();

  const visibleQuestions = useMemo(() => {
    return QUESTIONS.filter(q => {
      if (!q.conditional) return true;
      const conditionValue = formData[q.conditional.field as keyof WillFormData];
      return q.conditional.values.includes(String(conditionValue));
    });
  }, [formData]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateCurrentQuestion = () => {
    if (!currentQuestion?.required) return true;
    const value = formData[currentQuestion.id as keyof WillFormData];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: 'This field is required',
      }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (currentQuestionIndex < visibleQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) return;

    try {
      await createWillMutation.mutateAsync({
        documentType: 'will',
        title: `Will for ${formData.fullName}`,
        testatorName: formData.fullName,
        testatorAge: formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : undefined,
        maritalStatus: formData.maritalStatus,
        hasChildren: formData.hasChildren === 'Yes',
        primaryBeneficiary: formData.residueDistribution,
        alternateExecutor: formData.alternateExecutorName,
      });
      navigate('/dashboard?created=true');
    } catch (error) {
      console.error('Error creating will:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to create a will.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-navy-600 to-slate-600 text-white rounded-t-lg">
            <CardTitle>Professional Will Creator</CardTitle>
            <CardDescription className="text-slate-100">
              Step {currentQuestionIndex + 1} of {visibleQuestions.length}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-slate-600 mt-2">
                {Math.round(progressPercentage)}% Complete
              </p>
            </div>

            {/* Question Category */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                {currentQuestion?.category}
              </p>
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-2 mb-4">
                <Label className="text-lg font-semibold text-slate-900">
                  {currentQuestion?.question}
                </Label>
                {currentQuestion?.tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {currentQuestion.tooltip}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Input Field */}
              {currentQuestion?.type === 'text' && (
                <Input
                  type="text"
                  value={typeof formData[currentQuestion.id as keyof WillFormData] === 'string' ? (formData[currentQuestion.id as keyof WillFormData] as string) : ''}
                  onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter your answer..."
                  className={errors[currentQuestion.id] ? 'border-red-500' : ''}
                />
              )}

              {currentQuestion?.type === 'email' && (
                <Input
                  type="email"
                  value={typeof formData[currentQuestion.id as keyof WillFormData] === 'string' ? (formData[currentQuestion.id as keyof WillFormData] as string) : ''}
                  onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter your email..."
                  className={errors[currentQuestion.id] ? 'border-red-500' : ''}
                />
              )}

              {currentQuestion?.type === 'date' && (
                <Input
                  type="date"
                  value={typeof formData[currentQuestion.id as keyof WillFormData] === 'string' ? (formData[currentQuestion.id as keyof WillFormData] as string) : ''}
                  onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                  className={errors[currentQuestion.id] ? 'border-red-500' : ''}
                />
              )}

              {currentQuestion?.type === 'textarea' && (
                <Textarea
                  value={typeof formData[currentQuestion.id as keyof WillFormData] === 'string' ? (formData[currentQuestion.id as keyof WillFormData] as string) : ''}
                  onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter your answer..."
                  rows={4}
                  className={errors[currentQuestion.id] ? 'border-red-500' : ''}
                />
              )}

              {currentQuestion?.type === 'select' && (
                <Select
                  value={typeof formData[currentQuestion.id as keyof WillFormData] === 'string' ? (formData[currentQuestion.id as keyof WillFormData] as string) : ''}
                  onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                >
                  <SelectTrigger className={errors[currentQuestion.id] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select an option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion?.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {currentQuestion?.type === 'radio' && (
                <RadioGroup
                  value={typeof formData[currentQuestion.id as keyof WillFormData] === 'string' ? (formData[currentQuestion.id as keyof WillFormData] as string) : ''}
                  onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                >
                  {currentQuestion?.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Error Message */}
              {errors[currentQuestion?.id || ''] && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    {errors[currentQuestion?.id || '']}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestionIndex === visibleQuestions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={createWillMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createWillMutation.isPending ? 'Creating Will...' : 'Create Will'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-navy-600 hover:bg-navy-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Summary Link */}
            {currentQuestionIndex === visibleQuestions.length - 1 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestionIndex(0)}
                className="w-full mt-4"
              >
                Review from Beginning
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
