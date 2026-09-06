"use client";

import Link from "next/link";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export default function AdminUsersPage() {
  const { data: users, isLoading, error } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const { user: me } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--lime)]" />
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-semibold text-foreground mb-1.5">Users</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {users?.length ?? 0} account{users?.length !== 1 ? "s" : ""} on the platform.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((u) => {
            const isSelf = u.id === me?.id;
            return (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/users/${u.id}`} className="hover:text-[var(--lime)]">
                    {u.full_name || "—"}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.is_active ? "default" : "destructive"}>
                    {u.is_active ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSelf || updateStatus.isPending}
                    title={isSelf ? "You can't disable your own account" : undefined}
                    onClick={() => updateStatus.mutate({ id: u.id, is_active: !u.is_active })}
                  >
                    {u.is_active ? "Disable" : "Enable"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
