import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface DocumentPreviewProps {
  documentType: 'will' | 'poa-property' | 'poa-personal-care';
  answers: Record<string, any>;
  onDownload?: (format: 'pdf' | 'docx') => void;
  isLoading?: boolean;
}

interface DocumentPreviewData {
  title: string;
  content: string;
  sections: Array<{
    title: string;
    content: string;
    legalBasis?: string;
  }>;
  metadata: {
    generatedAt: string;
    documentType: string;
    jurisdiction: string;
    legalCompliance: string[];
  };
}

export function DocumentPreview({
  documentType,
  answers,
  onDownload,
  isLoading = false,
}: DocumentPreviewProps) {
  const [preview, setPreview] = useState<DocumentPreviewData | null>(null);
  const [activeTab, setActiveTab] = useState('full');
  const [wordCount, setWordCount] = useState(0);

  // Generate preview
  useEffect(() => {
    const generatePreview = async () => {
      try {
        // In a real implementation, this would call a tRPC procedure
        // For now, we'll create a mock preview based on answers
        const mockPreview: DocumentPreviewData = {
          title: getDocumentTitle(documentType, answers),
          content: generatePreviewContent(documentType, answers),
          sections: generatePreviewSections(documentType, answers),
          metadata: {
            generatedAt: new Date().toISOString(),
            documentType,
            jurisdiction: 'Ontario',
            legalCompliance: getLegalCompliance(documentType),
          },
        };

        setPreview(mockPreview);
        setWordCount(mockPreview.content.split(/\s+/).length);
      } catch (error) {
        toast.error('Failed to generate preview');
      }
    };

    if (Object.keys(answers).length > 0) {
      generatePreview();
    }
  }, [answers, documentType]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
          <CardDescription>Generating preview...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500">Generating document preview...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
          <CardDescription>No preview available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Answer some questions to see a preview of your document
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle>{preview.title}</CardTitle>
            <CardDescription>
              {wordCount} words • {preview.metadata.jurisdiction} jurisdiction
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onDownload && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownload('pdf')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownload('docx')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  DOCX
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Document Type</p>
            <p className="font-semibold">{formatDocumentType(documentType)}</p>
          </div>
          <div>
            <p className="text-gray-500">Jurisdiction</p>
            <p className="font-semibold">{preview.metadata.jurisdiction}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 mb-1">Legal Compliance</p>
            <div className="flex flex-wrap gap-1">
              {preview.metadata.legalCompliance.map((compliance) => (
                <Badge key={compliance} variant="secondary" className="text-xs">
                  {compliance}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="full">Full Document</TabsTrigger>
            <TabsTrigger value="sections">By Section</TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 border rounded-md p-4 bg-gray-50">
              <div className="space-y-4 pr-4">
                <div className="prose prose-sm max-w-none">
                  <h1 className="text-xl font-bold mb-4">{preview.title}</h1>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {preview.content}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sections" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 border rounded-md p-4 bg-gray-50">
              <div className="space-y-6 pr-4">
                {preview.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                      {section.legalBasis && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {section.legalBasis}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            This is a preview of your document. Please review carefully and consult with a lawyer
            before finalizing.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDocumentTitle(
  documentType: string,
  answers: Record<string, any>
): string {
  switch (documentType) {
    case 'will':
      return `Last Will and Testament of ${answers.testatorFullName || 'Testator'}`;
    case 'poa-property':
      return `Power of Attorney for Property - ${answers.grantorFullName || 'Grantor'}`;
    case 'poa-personal-care':
      return `Power of Attorney for Personal Care - ${answers.grantorFullName || 'Grantor'}`;
    default:
      return 'Document';
  }
}

function generatePreviewContent(
  documentType: string,
  answers: Record<string, any>
): string {
  switch (documentType) {
    case 'will':
      return `LAST WILL AND TESTAMENT

I, ${answers.testatorFullName || '[Testator Name]'}, of ${answers.testatorAddress || '[Address]'}, being of sound mind and memory, do hereby make, publish and declare this to be my Last Will and Testament.

REVOCATION
I hereby revoke and annul all former Wills, Codicils and Testamentary dispositions made by me and declare this only to be my Will.

FAMILY STATUS
${generateFamilyStatus(answers)}

EXECUTOR APPOINTMENT
I appoint ${answers.primaryExecutor || '[Primary Executor]'} to be my Executor and Trustee. Should ${answers.primaryExecutor || 'they'} predecease me or be unable or unwilling to act, I appoint ${answers.alternateExecutor || '[Alternate Executor]'} to be my Executor and Trustee.

DISTRIBUTION OF ESTATE
I direct my Executor to distribute my estate as follows:
${answers.primaryBeneficiaries || '[Primary Beneficiaries]'}

EXECUTION
IN WITNESS WHEREOF I have executed this Will this _____ day of ______________, 20_____.

[Testator Signature]
[Witness 1 Signature]
[Witness 2 Signature]`;

    case 'poa-property':
      return `POWER OF ATTORNEY FOR PROPERTY

I, ${answers.grantorFullName || '[Grantor Name]'}, of ${answers.grantorAddress || '[Address]'}, being of sound mind, do hereby make, constitute and appoint this Power of Attorney for Property.

APPOINTMENT OF ATTORNEY
I appoint ${answers.attorneyName || '[Attorney Name]'} to be my attorney for property with full power and authority to manage, control, and dispose of all my property.

POWERS GRANTED
My attorney shall have all powers granted under the Powers of Attorney Act, including the power to:
- Sell, mortgage, or lease property
- Invest and reinvest funds
- Collect debts and rents
- Pay bills and expenses
- Enter into contracts
- Manage business affairs
- File tax returns

EXECUTION
IN WITNESS WHEREOF I have executed this Power of Attorney this _____ day of ______________, 20_____.

[Grantor Signature]
[Witness 1 Signature]
[Witness 2 Signature]`;

    case 'poa-personal-care':
      return `POWER OF ATTORNEY FOR PERSONAL CARE

I, ${answers.grantorFullName || '[Grantor Name]'}, of ${answers.grantorAddress || '[Address]'}, being of sound mind, do hereby make, constitute and appoint this Power of Attorney for Personal Care.

APPOINTMENT OF ATTORNEY
I appoint ${answers.attorneyName || '[Attorney Name]'} to be my attorney for personal care with authority to make decisions regarding my personal care.

SCOPE OF AUTHORITY
My attorney shall have authority to:
- Consent to or refuse medical treatment
- Communicate with health care providers
- Access my medical records
- Make decisions about my living arrangements
- Manage my personal affairs

EXECUTION
IN WITNESS WHEREOF I have executed this Power of Attorney for Personal Care this _____ day of ______________, 20_____.

[Grantor Signature]
[Witness 1 Signature]
[Witness 2 Signature]`;

    default:
      return 'Document content';
  }
}

function generateFamilyStatus(answers: Record<string, any>): string {
  let status = '';

  if (answers.maritalStatus) {
    status += `Marital Status: ${answers.maritalStatus}\n`;
    if (answers.spouseName) {
      status += `Spouse: ${answers.spouseName}\n`;
    }
  }

  if (answers.hasChildren) {
    status += `Children: ${answers.hasChildren}\n`;
    if (answers.numberOfChildren) {
      status += `Number of Children: ${answers.numberOfChildren}\n`;
    }
  }

  return status || 'Family information as provided';
}

function generatePreviewSections(
  documentType: string,
  answers: Record<string, any>
): Array<{
  title: string;
  content: string;
  legalBasis?: string;
}> {
  const sections = [];

  switch (documentType) {
    case 'will':
      sections.push(
        {
          title: 'TESTATOR INFORMATION',
          content: `I, ${answers.testatorFullName || '[Name]'}, of ${answers.testatorAddress || '[Address]'}, being of sound mind and memory...`,
          legalBasis: 'Succession Law Reform Act, s. 1',
        },
        {
          title: 'REVOCATION',
          content: 'I hereby revoke and annul all former Wills, Codicils and Testamentary dispositions made by me...',
          legalBasis: 'Succession Law Reform Act, s. 2',
        },
        {
          title: 'EXECUTOR APPOINTMENT',
          content: `I appoint ${answers.primaryExecutor || '[Name]'} to be my Executor and Trustee...`,
          legalBasis: 'Succession Law Reform Act, s. 36',
        },
        {
          title: 'DISTRIBUTION OF ESTATE',
          content: `I direct my Executor to distribute my estate as follows: ${answers.primaryBeneficiaries || '[Beneficiaries]'}`,
        }
      );
      break;

    case 'poa-property':
      sections.push(
        {
          title: 'APPOINTMENT OF ATTORNEY',
          content: `I appoint ${answers.attorneyName || '[Name]'} to be my attorney for property...`,
          legalBasis: 'Powers of Attorney Act, s. 7',
        },
        {
          title: 'POWERS GRANTED',
          content: 'My attorney shall have all powers granted under the Powers of Attorney Act...',
          legalBasis: 'Powers of Attorney Act, s. 7(1)',
        }
      );
      break;

    case 'poa-personal-care':
      sections.push(
        {
          title: 'APPOINTMENT OF ATTORNEY',
          content: `I appoint ${answers.attorneyName || '[Name]'} to be my attorney for personal care...`,
          legalBasis: 'Health Care Consent Act, s. 20',
        },
        {
          title: 'SCOPE OF AUTHORITY',
          content: 'My attorney shall have authority to make decisions regarding my personal care...',
          legalBasis: 'Substitute Decisions Act, s. 17',
        }
      );
      break;
  }

  return sections;
}

function getLegalCompliance(documentType: string): string[] {
  switch (documentType) {
    case 'will':
      return ['Succession Law Reform Act', 'Estates Act', 'Common Law Requirements'];
    case 'poa-property':
      return ['Powers of Attorney Act', 'Substitute Decisions Act'];
    case 'poa-personal-care':
      return ['Health Care Consent Act', 'Substitute Decisions Act'];
    default:
      return [];
  }
}

function formatDocumentType(documentType: string): string {
  switch (documentType) {
    case 'will':
      return 'Last Will and Testament';
    case 'poa-property':
      return 'Power of Attorney for Property';
    case 'poa-personal-care':
      return 'Power of Attorney for Personal Care';
    default:
      return documentType;
  }
}
