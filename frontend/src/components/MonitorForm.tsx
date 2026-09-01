"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, MonitorCreate, MonitorUpdate } from "@/types";
import { useCreateMonitor, useUpdateMonitor } from "@/hooks/use-monitors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

interface MonitorFormProps {
  monitor?: Monitor;
  mode: "create" | "edit";
}

export default function MonitorForm({ monitor, mode }: MonitorFormProps) {
  const router = useRouter();
  const createMonitor = useCreateMonitor();
  const updateMonitor = useUpdateMonitor();

  const [formData, setFormData] = useState(() => {
    if (monitor && mode === "edit") {
      return {
        name: monitor.name,
        url: monitor.url,
        interval_seconds: monitor.interval_seconds,
        is_active: monitor.is_active,
      };
    }
    return {
      name: "",
      url: "",
      interval_seconds: 300,
      is_active: true,
    };
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "create") {
        const data: MonitorCreate = {
          name: formData.name,
          url: formData.url,
          interval_seconds: formData.interval_seconds,
          is_active: formData.is_active,
        };
        await createMonitor.mutateAsync(data);
        router.push("/");
      } else if (monitor) {
        const data: MonitorUpdate = {
          name: formData.name,
          url: formData.url,
          interval_seconds: formData.interval_seconds,
          is_active: formData.is_active,
        };
        await updateMonitor.mutateAsync({ id: monitor.id, data });
        router.push(`/monitors/${monitor.id}`);
      }
    } catch {
      // Error is handled by the mutation
    }
  };

  const intervalOptions = [
    { value: 30, label: "30 seconds" },
    { value: 60, label: "1 minute" },
    { value: 300, label: "5 minutes" },
    { value: 600, label: "10 minutes" },
    { value: 900, label: "15 minutes" },
    { value: 1800, label: "30 minutes" },
    { value: 3600, label: "1 hour" },
    { value: 7200, label: "2 hours" },
    { value: 86400, label: "24 hours" },
  ];

  const error = createMonitor.error?.message || updateMonitor.error?.message;
  const isSubmitting = createMonitor.isPending || updateMonitor.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Monitor Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          minLength={1}
          maxLength={255}
          placeholder="e.g., My API Health Check"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL to Monitor *</Label>
        <Input
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
          placeholder="https://api.example.com/health"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interval_seconds">Check Interval</Label>
        <Select
          id="interval_seconds"
          name="interval_seconds"
          value={formData.interval_seconds}
          onChange={handleChange}
        >
          {intervalOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active (monitoring enabled)
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Create Monitor"
            : "Update Monitor"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
