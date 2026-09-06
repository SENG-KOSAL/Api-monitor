"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAdminUser, useUpdateUserRole, useUpdateUserStatus } from "@/hooks/use-admin";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { UserRole } from "@/types";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  const { data: user, isLoading, error } = useAdminUser(userId);
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();
  const { user: me } = useAuth();

  const isSelf = me?.id === userId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--lime)]" />
        Loading user...
      </div>
    );
  }

  if (error || !user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error?.message ?? "User not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to users
      </Link>

      <h1 className="text-3xl font-display font-semibold text-foreground mb-1.5">
        {user.full_name || user.email}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">{user.email}</p>

      {(updateStatus.isError || updateRole.isError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(updateStatus.error as Error)?.message || (updateRole.error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Status</p>
            <p className="text-xs text-muted-foreground">Disabled accounts can&apos;t log in.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={user.is_active ? "default" : "destructive"}>
              {user.is_active ? "Active" : "Disabled"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              disabled={isSelf || updateStatus.isPending}
              title={isSelf ? "You can't disable your own account" : undefined}
              onClick={() => updateStatus.mutate({ id: user.id, is_active: !user.is_active })}
            >
              {updateStatus.isPending ? "Saving..." : user.is_active ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Role</p>
            <p className="text-xs text-muted-foreground">
              Admins can manage users; developers only manage their own monitors.
            </p>
          </div>
          <Select
            className="w-36 shrink-0"
            value={user.role}
            disabled={isSelf || updateRole.isPending}
            title={isSelf ? "You can't change your own role" : undefined}
            onChange={(e) =>
              updateRole.mutate({ id: user.id, role: e.target.value as UserRole })
            }
          >
            <option value="developer">Developer</option>
            <option value="admin">Admin</option>
          </Select>
        </div>

        {isSelf && (
          <p className="text-xs text-muted-foreground border-t border-white/10 pt-4">
            You can&apos;t change your own role or status — this prevents an admin from
            accidentally locking themselves out.
          </p>
        )}
      </Card>
    </div>
  );
}
