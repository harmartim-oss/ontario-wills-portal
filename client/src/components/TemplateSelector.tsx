import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'simple' | 'blended' | 'business';
  estimatedTime: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  icon: React.ReactNode;
}

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
  isLoading?: boolean;
}

const templates: Template[] = [
  {
    id: 'simple-estate',
    name: 'Simple Estate',
    description: 'Perfect for individuals with straightforward estates and clear succession plans.',
    category: 'simple',
    estimatedTime: 15,
    complexity: 'beginner',
    features: [
      'Basic will provisions',
      'Single executor',
      'Simple asset distribution',
      'Guardian designation',
    ],
    icon: <div className="text-3xl">📋</div>,
  },
  {
    id: 'blended-family',
    name: 'Blended Family',
    description: 'Designed for blended families with children from previous relationships.',
    category: 'blended',
    estimatedTime: 25,
    complexity: 'intermediate',
    features: [
      'Multiple beneficiaries',
      'Trust provisions',
      'Asset protection',
      'Separate property management',
    ],
    icon: <div className="text-3xl">👨‍👩‍👧‍👦</div>,
  },
  {
    id: 'business-owner',
    name: 'Business Owner',
    description: 'Tailored for business owners with complex assets and succession planning needs.',
    category: 'business',
    estimatedTime: 35,
    complexity: 'advanced',
    features: [
      'Business succession planning',
      'Tax optimization',
      'Key person insurance',
      'Buy-sell agreements',
    ],
    icon: <div className="text-3xl">💼</div>,
  },
];

const complexityColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
};

export function TemplateSelector({ onSelectTemplate, isLoading = false }: TemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (templateId: string) => {
    setSelectedId(templateId);
    onSelectTemplate(templateId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Template</h1>
        <p className="text-xl text-gray-600">
          Select a template that best matches your situation to get started quickly
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedId === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => handleSelect(template.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{template.icon}</div>
                <Badge className={complexityColors[template.complexity]}>
                  {template.complexity}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              <CardDescription className="text-base">{template.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Metadata */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">
                    <strong>Estimated time:</strong> {template.estimatedTime} minutes
                  </span>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Includes
                </h4>
                <ul className="space-y-2">
                  {template.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Select Button */}
              <Button
                onClick={() => handleSelect(template.id)}
                disabled={isLoading}
                className={`w-full mt-4 ${
                  selectedId === template.id
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {selectedId === template.id ? 'Selected' : 'Select Template'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Why Templates?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Save Time:</strong> Pre-filled questions tailored to your situation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Expert Guidance:</strong> Questions designed by legal professionals
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Comprehensive:</strong> Covers all important aspects of your situation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Flexible:</strong> Customize any answer as you go through the process
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-8">
        <Button
          disabled={!selectedId || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
        >
          Continue with Selected Template
        </Button>
        <Button variant="outline" className="px-8 py-2">
          Start from Scratch
        </Button>
      </div>
    </div>
  );
}

export default TemplateSelector;
