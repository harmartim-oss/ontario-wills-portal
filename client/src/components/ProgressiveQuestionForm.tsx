import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  EnhancedQuestion,
  QuestionContext,
  getVisibleQuestions,
  getFollowUpQuestions,
  validateAnswer,
  calculateProgress,
} from '@/lib/enhancedQuestions';
import { validateDocumentAnswers } from '@/lib/documentValidation';

interface ProgressiveQuestionFormProps {
  questions: EnhancedQuestion[];
  documentType: 'will' | 'poa-property' | 'poa-personal-care';
  userTier: 'basic' | 'advanced';
  onComplete: (answers: Record<string, any>) => void;
  onSave?: (answers: Record<string, any>) => void;
}

export function ProgressiveQuestionForm({
  questions,
  documentType,
  userTier,
  onComplete,
  onSave,
}: ProgressiveQuestionFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Create question context
  const context: QuestionContext = {
    documentType,
    userTier,
    answers,
    completedQuestions,
  };

  // Get visible questions based on answers
  const visibleQuestions = useMemo(
    () => getVisibleQuestions(questions, context),
    [questions, context]
  );

  // Get current question
  const currentQuestion = showAllQuestions
    ? visibleQuestions[currentQuestionIndex]
    : visibleQuestions[currentQuestionIndex];

  // Calculate progress
  const progress = useMemo(
    () => calculateProgress(context, questions),
    [context, questions]
  );

  // Handle answer change
  const handleAnswerChange = (value: any) => {
    const field = currentQuestion?.field;
    if (!field) return;

    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate answer
    if (currentQuestion) {
      const validation = validateAnswer(currentQuestion, value);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid answer');
      }
    }
  };

  // Handle next question
  const handleNext = () => {
    if (!currentQuestion) return;

    // Validate current answer
    const validation = validateAnswer(currentQuestion, answers[currentQuestion.field]);
    if (!validation.valid && currentQuestion.required) {
      toast.error(validation.error || 'Please answer this question');
      return;
    }

    // Mark question as completed
    if (!completedQuestions.includes(currentQuestion.id)) {
      setCompletedQuestions((prev) => [...prev, currentQuestion.id]);
    }

    // Move to next question
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // All questions answered
      handleComplete();
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Handle complete
  const handleComplete = () => {
    // Validate all answers
    const validation = validateDocumentAnswers(answers, documentType);

    if (!validation.valid) {
      const criticalErrors = validation.errors.filter((e) => e.severity === 'critical');
      if (criticalErrors.length > 0) {
        toast.error(
          `Please fix ${criticalErrors.length} critical issue(s) before completing`
        );
        return;
      }
    }

    if (validation.warnings.length > 0) {
      toast.warning(`${validation.warnings.length} warning(s) found. Review before proceeding.`);
    }

    onComplete(answers);
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(answers);
      toast.success('Answers saved successfully');
    }
  };

  // Render question input based on type
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const value = answers[currentQuestion.field] || '';

    switch (currentQuestion.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQuestion.helpText || 'Enter your answer'}
            className="w-full"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQuestion.helpText || 'Enter a number'}
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQuestion.helpText || 'Enter your answer'}
            rows={5}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={handleAnswerChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={handleAnswerChange}>
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValue = Array.isArray(value) ? value : [];
                    if (checked) {
                      handleAnswerChange([...newValue, option]);
                    } else {
                      handleAnswerChange(newValue.filter((v) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValue = Array.isArray(value) ? value : [];
                    if (checked) {
                      handleAnswerChange([...newValue, option]);
                    } else {
                      handleAnswerChange(newValue.filter((v) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentQuestion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Complete</CardTitle>
          <CardDescription>All questions have been answered</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your answers are ready for document generation
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={handleComplete} className="flex-1">
              Generate Document
            </Button>
            {onSave && (
              <Button onClick={handleSave} variant="outline" className="flex-1">
                Save Progress
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>
            {progress.completed} of {progress.total} completed
          </span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle>{currentQuestion.question}</CardTitle>
              {currentQuestion.section && (
                <CardDescription>{currentQuestion.section}</CardDescription>
              )}
            </div>
            {currentQuestion.required && (
              <span className="text-red-500 text-sm font-semibold">Required</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Help Text */}
          {currentQuestion.helpText && (
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>{currentQuestion.helpText}</AlertDescription>
            </Alert>
          )}

          {/* Question Input */}
          <div className="space-y-2">{renderQuestionInput()}</div>

          {/* Examples */}
          {currentQuestion.examples && currentQuestion.examples.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm font-semibold text-blue-900 mb-2">Examples:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                {currentQuestion.examples.map((example, idx) => (
                  <li key={idx}>• {example}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Note */}
          {currentQuestion.legalNote && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Legal Note:</strong> {currentQuestion.legalNote}
              </AlertDescription>
            </Alert>
          )}

          {/* Estimated Time */}
          {currentQuestion.estimatedTime && (
            <p className="text-xs text-gray-500">
              Estimated time to answer: {Math.ceil(currentQuestion.estimatedTime / 60)} minute(s)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-2 justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {onSave && (
            <Button onClick={handleSave} variant="outline">
              Save Progress
            </Button>
          )}
          {currentQuestionIndex === visibleQuestions.length - 1 ? (
            <Button onClick={handleComplete}>Complete & Generate</Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </div>

      {/* Question Counter */}
      <p className="text-xs text-gray-500 text-center">
        Question {currentQuestionIndex + 1} of {visibleQuestions.length}
      </p>
    </div>
  );
}
