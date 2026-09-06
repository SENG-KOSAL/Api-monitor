"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { monitorsAPI } from "@/lib/api";
import { MonitorCreate, MonitorUpdate } from "@/types";

export function useMonitors() {
  return useQuery({
    queryKey: ["monitors"],
    queryFn: () => monitorsAPI.getAll(),
  });
}

export function useMonitor(id: number) {
  return useQuery({
    queryKey: ["monitors", id],
    queryFn: () => monitorsAPI.getById(id),
    enabled: !!id,
  });
}

export function useMonitorResults(id: number, skip = 0, limit = 100) {
  return useQuery({
    queryKey: ["monitors", id, "results", { skip, limit }],
    queryFn: () => monitorsAPI.getResults(id, skip, limit),
    enabled: !!id,
  });
}

export function useMonitorLastCheck(id: number) {
  return useQuery({
    queryKey: ["monitors", id, "lastCheck"],
    queryFn: async () => {
      const results = await monitorsAPI.getResults(id, 0, 1);
      return results.length > 0 ? results[0] : null;
    },
    enabled: !!id,
  });
}

export function useMonitorUptime(id: number) {
  return useQuery({
    queryKey: ["monitors", id, "uptime"],
    queryFn: () => monitorsAPI.getUptime(id),
    enabled: !!id,
  });
}

export function useMonitorActiveIncidents(id: number) {
  return useQuery({
    queryKey: ["monitors", id, "incidents", "active"],
    queryFn: () => monitorsAPI.getActiveIncidents(id),
    enabled: !!id,
  });
}

export function useMonitorIncidents(id: number, skip = 0, limit = 50) {
  return useQuery({
    queryKey: ["monitors", id, "incidents", { skip, limit }],
    queryFn: () => monitorsAPI.getIncidents(id, skip, limit),
    enabled: !!id,
  });
}

export function useCreateMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MonitorCreate) => monitorsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
    },
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MonitorUpdate }) =>
      monitorsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["monitors", variables.id] });
    },
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => monitorsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
    },
  });
}

export function useCheckHealth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => monitorsAPI.checkHealth(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["monitors", id] });
      queryClient.invalidateQueries({ queryKey: ["monitors", id, "results"] });
      queryClient.invalidateQueries({ queryKey: ["monitors", id, "lastCheck"] });
      queryClient.invalidateQueries({ queryKey: ["monitors", id, "uptime"] });
      queryClient.invalidateQueries({ queryKey: ["monitors", id, "incidents"] });
    },
  });
}
