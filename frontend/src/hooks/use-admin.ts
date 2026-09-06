"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { UserRole } from "@/types";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => adminAPI.getOverview(),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminAPI.getUsers(),
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => adminAPI.getUser(id),
    enabled: !!id,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      adminAPI.updateUserStatus(id, is_active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      adminAPI.updateUserRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });
}
