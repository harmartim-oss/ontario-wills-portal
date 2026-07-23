import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Share2, Trash2, Edit2 } from "lucide-react";

interface DocumentSharingProps {
  documentId: number;
}

export function DocumentSharing({ documentId }: DocumentSharingProps) {

  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [permission, setPermission] = useState<"view" | "edit" | "comment">("view");
  const [editingShareId, setEditingShareId] = useState<number | null>(null);
  const [editPermission, setEditPermission] = useState<"view" | "edit" | "comment">("view");
  const [revokeShareId, setRevokeShareId] = useState<number | null>(null);

  // Fetch shares
  const { data: sharesData, isLoading: isLoadingShares, refetch } = trpc.sharing.getShares.useQuery(
    { documentId },
    {
      enabled: !!documentId,
    }
  );

  // Share document mutation
  const shareDocument = trpc.sharing.shareDocument.useMutation({
    onSuccess: () => {
      toast.success("Document shared successfully");
      setUserId("");
      setPermission("view");
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to share document");
    },
  });

  // Update permission mutation
  const updatePermission = trpc.sharing.updateSharePermission.useMutation({
    onSuccess: () => {
      toast.success("Permission updated");
      setEditingShareId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update permission");
    },
  });

  // Revoke share mutation
  const revokeShare = trpc.sharing.revokeShare.useMutation({
    onSuccess: () => {
      toast.success("Share revoked");
      setRevokeShareId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to revoke share");
    },
  });

  const shares = sharesData?.shares || [];

  const handleShare = () => {
    if (!userId) {
      toast.error("Please enter a user ID");
      return;
    }

    shareDocument.mutate({
      documentId,
      sharedWithUserId: parseInt(userId),
      permission,
    });
  };

  const handleUpdatePermission = (shareId: number) => {
    updatePermission.mutate({
      shareId,
      permission: editPermission,
    });
  };

  const handleRevoke = (shareId: number) => {
    revokeShare.mutate({ shareId });
  };

  if (isLoadingShares) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Sharing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Document Sharing
            </CardTitle>
            <CardDescription>
              {shares.length} user{shares.length !== 1 ? "s" : ""} with access
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Share Document</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Document</DialogTitle>
                <DialogDescription>
                  Share this document with another user by entering their user ID
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    type="number"
                  />
                </div>
                <div>
                  <Label htmlFor="permission">Permission Level</Label>
                  <Select value={permission} onValueChange={(value: any) => setPermission(value)}>
                    <SelectTrigger id="permission">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleShare}
                    disabled={shareDocument.isPending || !userId}
                  >
                    {shareDocument.isPending ? "Sharing..." : "Share"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {shares.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>This document is not shared with anyone yet</p>
            <p className="text-sm mt-2">Share it to collaborate with others</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shares.map((share: any) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">User {share.sharedWithUserId}</span>
                    <Badge variant="secondary">{share.permission}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Shared {formatDistanceToNow(new Date(share.sharedAt), { addSuffix: true })}
                  </p>
                  {share.expiresAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires {formatDistanceToNow(new Date(share.expiresAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog open={editingShareId === share.id} onOpenChange={(open) => {
                    if (!open) setEditingShareId(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingShareId(share.id);
                          setEditPermission(share.permission);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Permission</DialogTitle>
                        <DialogDescription>
                          Change the permission level for this user
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="editPermission">Permission Level</Label>
                          <Select value={editPermission} onValueChange={(value: any) => setEditPermission(value)}>
                            <SelectTrigger id="editPermission">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">View Only</SelectItem>
                              <SelectItem value="comment">Comment</SelectItem>
                              <SelectItem value="edit">Edit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button variant="outline" onClick={() => setEditingShareId(null)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleUpdatePermission(share.id)}
                            disabled={updatePermission.isPending}
                          >
                            {updatePermission.isPending ? "Updating..." : "Update"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog open={revokeShareId === share.id} onOpenChange={(open) => {
                    if (!open) setRevokeShareId(null);
                  }}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove access to this document for user {share.sharedWithUserId}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRevoke(share.id)}
                          disabled={revokeShare.isPending}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {revokeShare.isPending ? "Revoking..." : "Revoke"}
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevokeShareId(share.id)}
                    disabled={revokeShare.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
