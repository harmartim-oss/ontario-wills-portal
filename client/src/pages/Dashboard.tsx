import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Plus, FileText, AlertCircle, TrendingUp, Users, Download, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  
  // Fetch documents from backend
  const { data: documents = [], isLoading, refetch } = trpc.documents.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Delete document mutation
  const deleteDocMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete document");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please log in to access your dashboard</p>
          <a href="/"><Button>Go Home</Button></a>
        </div>
      </div>
    );
  }

  const handleDeleteDocument = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocMutation.mutate({ id });
    }
  };

  const totalEstateValue = documents.reduce((sum, doc) => sum + (doc.estateValue || 0), 0);
  const totalBeneficiaries = documents.length; // Simplified for now

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-foreground to-secondary text-background py-8">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || "User"}</h1>
          <p className="opacity-90">Manage your estate planning documents</p>
        </div>
      </div>

      <div className="container max-w-6xl py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Documents Created</p>
                <p className="text-3xl font-bold text-foreground">{documents.length}</p>
              </div>
              <FileText className="w-12 h-12 text-accent opacity-20" />
            </div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estate Value</p>
                <p className="text-3xl font-bold text-foreground">${(totalEstateValue / 1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="w-12 h-12 text-accent opacity-20" />
            </div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Beneficiaries</p>
                <p className="text-3xl font-bold text-foreground">{totalBeneficiaries}</p>
              </div>
              <Users className="w-12 h-12 text-accent opacity-20" />
            </div>
          </div>
        </div>

        {/* Re-balancing Alerts */}
        {documents.length > 0 && (
          <div className="mb-12 p-6 rounded-lg border-2 border-orange-300/50 bg-orange-50/30">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Distribution Alert</h3>
                <p className="text-muted-foreground mb-3">
                  Review your estate distribution to ensure it aligns with current market values.
                </p>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Documents</h2>
          <a href="/create-document">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Document
            </Button>
          </a>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* Documents List */}
        {!isLoading && documents.length > 0 && (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="w-10 h-10 text-accent" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.documentType === "will" ? "Will" : doc.documentType === "poa-property" ? "POA for Property" : "POA for Personal Care"} • Created {new Date(doc.createdAt).toLocaleDateString()} • {doc.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`/view-document/${doc.id}`}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </a>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDocument(doc.id)}
                      disabled={deleteDocMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-6">Create your first Will or Power of Attorney to get started</p>
            <a href="/create-document">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Document
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
