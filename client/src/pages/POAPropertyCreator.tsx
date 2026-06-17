import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { getQuestionsForTier, getQuestionCountByTier, Question } from '@/lib/documentQuestions';

interface POAData {
  [key: string]: any;
}

export default function POAPropertyCreator() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<POAData>({});
  const [questionTier, setQuestionTier] = useState<'basic' | 'advanced'>('basic');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showTierSelector, setShowTierSelector] = useState(true);

  const { user } = useAuth();
  const [, navigate] = useLocation();
  const createDocument = trpc.documents.create.useMutation();

  // Initialize questions based on tier selection
  useEffect(() => {
    if (!showTierSelector) {
      const selectedQuestions = getQuestionsForTier('poa-property', questionTier === 'advanced' ? 'all' : 'basic');
      setQuestions(selectedQuestions);
    }
  }, [showTierSelector, questionTier]);

  const currentQ = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const questionCounts = getQuestionCountByTier('poa-property');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleTierSelection = (tier: 'basic' | 'advanced') => {
    setQuestionTier(tier);
    setShowTierSelector(false);
    setCurrentQuestion(0);
  };

  const handleSubmit = async () => {
    if (!user || !formData.grantorFullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createDocument.mutateAsync({
        documentType: 'poa-property',
        title: `Power of Attorney for Property - ${formData.grantorFullName}`,
        testatorName: formData.grantorFullName,
        maritalStatus: formData.maritalStatus || 'Not specified',
        hasChildren: false,
      });

      toast.success('Power of Attorney for Property created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error creating Power of Attorney');
      console.error(error);
    }
  };

  // Tier Selection Screen
  if (showTierSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-slate-900">Power of Attorney for Property</h1>
            </div>
            <p className="text-slate-600 text-lg">Choose your experience level</p>
          </div>

          {/* Tier Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Basic Tier */}
            <Card className="p-8 border-2 border-slate-200 hover:border-green-500 cursor-pointer transition-all"
              onClick={() => handleTierSelection('basic')}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Free Plan</h2>
                <p className="text-slate-600">{questionCounts.basic} Essential Questions</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Grantor information</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Attorney (agent) selection</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Basic property information</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Effective date selection</span>
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">Start Free Plan</Button>
            </Card>

            {/* Advanced Tier */}
            <Card className="p-8 border-2 border-green-500 bg-green-50 hover:border-green-600 cursor-pointer transition-all relative"
              onClick={() => handleTierSelection('advanced')}>
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Premium
              </div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium Plan</h2>
                <p className="text-slate-600">{questionCounts.total} Comprehensive Questions</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">All free plan questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Detailed power specifications</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Business interest management</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Compensation and accountability</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Special instructions and restrictions</span>
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">Start Premium Plan</Button>
            </Card>
          </div>

          {/* Info Box */}
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex gap-3">
              <Info className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Which plan is right for you?</h3>
                <p className="text-slate-700 text-sm">
                  Choose the <strong>Free Plan</strong> for simple property management needs. 
                  Choose the <strong>Premium Plan</strong> if you have multiple properties, business interests, or complex financial arrangements.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Question Screen
  if (!currentQ || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600">Loading questions...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Power of Attorney for Property</h1>
                <p className="text-slate-600 text-sm">{questionTier === 'advanced' ? 'Premium' : 'Free'} Plan</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              setShowTierSelector(true);
              setCurrentQuestion(0);
              setFormData({});
            }}>
              Change Plan
            </Button>
          </div>
          <p className="text-slate-600">Question {currentQuestion + 1} of {questions.length}</p>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-8" />

        {/* Question Card */}
        <Card className="p-8 mb-8 shadow-lg border-0">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
              {currentQ.section}
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{currentQ.question}</h2>
            {currentQ.required && <p className="text-red-600 text-sm mt-1">* Required field</p>}
            {currentQ.helpText && <p className="text-slate-600 text-sm mt-2">{currentQ.helpText}</p>}
            {currentQ.legalNote && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-900 text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Legal Note:</strong> {currentQ.legalNote}</span>
                </p>
              </div>
            )}
          </div>

          {/* Input Fields */}
          <div className="mb-8">
            {currentQ.type === 'text' && (
              <input
                type="text"
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your answer..."
              />
            )}
            {currentQ.type === 'date' && (
              <input
                type="date"
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
            {currentQ.type === 'textarea' && (
              <textarea
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-24 resize-none"
                placeholder="Enter your answer..."
              />
            )}
            {currentQ.type === 'select' && (
              <select
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select an option...</option>
                {currentQ.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            {currentQ.type === 'checkbox' && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData as any)[currentQ.field] || false}
                  onChange={(e) => handleInputChange(currentQ.field, e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-green-600"
                />
                <span className="text-slate-700">{currentQ.question}</span>
              </label>
            )}
            {currentQ.type === 'number' && (
              <input
                type="number"
                value={(formData as any)[currentQ.field] || ''}
                onChange={(e) => handleInputChange(currentQ.field, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter a number..."
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={createDocument.isPending}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                {createDocument.isPending ? 'Creating...' : 'Create POA'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Progress Info */}
        <div className="text-center text-slate-600 text-sm">
          <p>
            {currentQuestion + 1} of {questions.length} questions answered
            ({Math.round(progress)}% complete)
          </p>
        </div>
      </div>
    </div>
  );
}
