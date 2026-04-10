import { useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit2, Loader2, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function ViewDocument() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const documentId = id ? parseInt(id) : null;

  // Fetch document
  const { data: document, isLoading } = trpc.documents.getById.useQuery(
    { id: documentId! },
    { enabled: isAuthenticated && !!documentId }
  );

  // Update document mutation
  const updateMutation = trpc.documents.update.useMutation({
    onSuccess: () => {
      toast.success("Document saved successfully");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to save document");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please log in to view documents</p>
          <a href="/"><Button>Go Home</Button></a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Document not found</p>
          <a href="/dashboard"><Button>Back to Dashboard</Button></a>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!documentId) return;
    updateMutation.mutate({
      id: documentId,
      content: editContent,
    });
  };

  const getDocumentTypeLabel = () => {
    switch (document.documentType) {
      case "will":
        return "Will";
      case "poa-property":
        return "Power of Attorney for Property";
      case "poa-personal":
        return "Power of Attorney for Personal Care";
      default:
        return "Document";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-foreground to-secondary text-background py-8">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <a href="/dashboard">
              <Button variant="ghost" size="sm" className="text-background hover:bg-background/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </a>
          </div>
          <h1 className="text-4xl font-bold mb-2">{document.title}</h1>
          <p className="opacity-90">{getDocumentTypeLabel()} • Status: {document.status}</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        {/* Document Info */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <p className="font-semibold text-foreground">{getDocumentTypeLabel()}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="font-semibold text-foreground capitalize">{document.status}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Created</p>
            <p className="font-semibold text-foreground">{new Date(document.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
            <p className="font-semibold text-foreground">{new Date(document.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Document Details */}
        <div className="p-8 rounded-lg bg-card border border-border mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Document Details</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {document.testatorName && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Testator Name</p>
                <p className="font-medium text-foreground">{document.testatorName}</p>
              </div>
            )}
            {document.testatorAge && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Age</p>
                <p className="font-medium text-foreground">{document.testatorAge}</p>
              </div>
            )}
            {document.maritalStatus && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Marital Status</p>
                <p className="font-medium text-foreground capitalize">{document.maritalStatus}</p>
              </div>
            )}
            {document.primaryBeneficiary && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Primary Beneficiary</p>
                <p className="font-medium text-foreground">{document.primaryBeneficiary}</p>
              </div>
            )}
            {document.alternateExecutor && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Alternate Executor</p>
                <p className="font-medium text-foreground">{document.alternateExecutor}</p>
              </div>
            )}
            {document.estateValue && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estate Value</p>
                <p className="font-medium text-foreground">${document.estateValue.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Document Content */}
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Document content..."
                className="w-full h-64 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-6 whitespace-pre-wrap">
                {document.content || "No content yet. Click Edit to add content to this document."}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!isEditing && (
            <>
              <Button onClick={() => {
                setEditContent(document.content || "");
                setIsEditing(true);
              }} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Document
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </>
          )}
        </div>

        {/* Legal Compliance Notice */}
        <div className="mt-12 p-6 rounded-lg bg-blue-50/50 border border-blue-200/50">
          <h3 className="font-semibold text-foreground mb-2">Ontario Legal Compliance</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This document has been created in compliance with Ontario's Succession Law Reform Act. However, we strongly recommend having a qualified lawyer review this document before execution to ensure it meets your specific needs and circumstances.
          </p>
          <p className="text-xs text-muted-foreground">
            For complex estates or special circumstances (e.g., blended families, significant assets, or beneficiaries with disabilities), professional legal advice is essential.
          </p>
        </div>
      </div>
    </div>
  );
}
