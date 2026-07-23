import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Clock, RotateCcw, Eye } from "lucide-react";

interface DocumentHistoryProps {
  documentId: number;
}

export function DocumentHistory({ documentId }: DocumentHistoryProps) {

  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<number | null>(null);

  // Fetch versions
  const { data: versionsData, isLoading: isLoadingVersions, refetch } = trpc.versioning.getVersions.useQuery(
    { documentId },
    {
      enabled: !!documentId,
    }
  );

  // Fetch specific version
  const { data: versionData, isLoading: isLoadingVersion } = trpc.versioning.getVersion.useQuery(
    { versionId: selectedVersion! },
    {
      enabled: !!selectedVersion,
    }
  );

  // Restore version mutation
  const restoreVersion = trpc.versioning.restoreVersion.useMutation({
    onSuccess: () => {
      toast.success("Document restored to previous version");
      setRestoreConfirm(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to restore version");
    },
  });

  const versions = versionsData?.versions || [];

  if (isLoadingVersions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Document History
        </CardTitle>
        <CardDescription>
          {versions.length} version{versions.length !== 1 ? "s" : ""} saved
        </CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No version history yet</p>
            <p className="text-sm mt-2">Versions are created when you save changes to your document</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version: any, index: number) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Version {version.versionNumber}</span>
                    {index === 0 && <Badge variant="default">Current</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}</p>
                    {version.changesSummary && (
                      <p className="mt-1 text-xs">{version.changesSummary}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersion(version.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Version {version.versionNumber}</DialogTitle>
                        <DialogDescription>
                          {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                        </DialogDescription>
                      </DialogHeader>
                      {isLoadingVersion ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                          ))}
                        </div>
                      ) : versionData?.version ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Title</h4>
                            <p className="text-sm text-muted-foreground">{versionData.version.title}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Status</h4>
                            <Badge>{versionData.version.status}</Badge>
                          </div>
                          {versionData.version.changesSummary && (
                            <div>
                              <h4 className="font-semibold mb-2">Changes</h4>
                              <p className="text-sm text-muted-foreground">{versionData.version.changesSummary}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold mb-2">Content Preview</h4>
                            <div className="bg-muted p-3 rounded text-sm max-h-64 overflow-y-auto">
                              {versionData.version.content ? (
                                <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                                  {versionData.version.content.substring(0, 500)}
                                  {versionData.version.content.length > 500 && "..."}
                                </pre>
                              ) : (
                                <p className="text-muted-foreground">No content</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </DialogContent>
                  </Dialog>

                  {index !== 0 && (
                    <AlertDialog open={restoreConfirm === version.id} onOpenChange={(open) => {
                      if (!open) setRestoreConfirm(null);
                    }}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restore Version?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will restore your document to version {version.versionNumber}. The current version will be saved as a new version.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              restoreVersion.mutate({ versionId: version.id });
                            }}
                            disabled={restoreVersion.isPending}
                          >
                            {restoreVersion.isPending ? "Restoring..." : "Restore"}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreConfirm(version.id)}
                      disabled={restoreVersion.isPending}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
