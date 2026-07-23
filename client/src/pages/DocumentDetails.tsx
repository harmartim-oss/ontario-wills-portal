import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { DocumentHistory } from "@/components/DocumentHistory";
import { DocumentSharing } from "@/components/DocumentSharing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DocumentDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  const documentId = parseInt(id || "0");

  // Fetch document
  const { data: document, isLoading, error } = trpc.documents.getById.useQuery(
    { id: documentId },
    {
      enabled: !!documentId,
    }
  );

  // Delete mutation
  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted successfully");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete document");
    },
  });

  // Generate PDF mutation
  const generatePDF = trpc.documents.generateWillPDF.useMutation({
    onSuccess: (data) => {
      toast.success("PDF generated successfully");
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate PDF");
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !document) {
    return (
      <DashboardLayout>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Document Not Found</CardTitle>
            <CardDescription>
              The document you're looking for doesn't exist or you don't have permission to access it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-3xl font-bold">{document.title}</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge>{document.documentType.toUpperCase()}</Badge>
              <Badge variant="outline">{document.status}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {document.status === "completed" && (
              <Button
                onClick={() => generatePDF.mutate({ id: documentId })}
                disabled={generatePDF.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                {generatePDF.isPending ? "Generating..." : "Download PDF"}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure you want to delete this document?")) {
                  deleteDocument.mutate({ id: documentId });
                }
              }}
              disabled={deleteDocument.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {document.testatorName && (
                <div>
                  <p className="text-sm text-muted-foreground">Testator Name</p>
                  <p className="font-medium">{document.testatorName}</p>
                </div>
              )}
              {document.testatorAge && (
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{document.testatorAge}</p>
                </div>
              )}
              {document.maritalStatus && (
                <div>
                  <p className="text-sm text-muted-foreground">Marital Status</p>
                  <p className="font-medium">{document.maritalStatus}</p>
                </div>
              )}
              {document.primaryBeneficiary && (
                <div>
                  <p className="text-sm text-muted-foreground">Primary Beneficiary</p>
                  <p className="font-medium">{document.primaryBeneficiary}</p>
                </div>
              )}
              {document.estateValue && (
                <div>
                  <p className="text-sm text-muted-foreground">Estate Value</p>
                  <p className="font-medium">${document.estateValue.toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(document.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for History and Sharing */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="space-y-4">
            <DocumentHistory documentId={documentId} />
          </TabsContent>
          <TabsContent value="sharing" className="space-y-4">
            <DocumentSharing documentId={documentId} />
          </TabsContent>
        </Tabs>

        {/* Document Content */}
        {document.content && (
          <Card>
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                  {document.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
