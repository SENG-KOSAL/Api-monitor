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
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface MonitorFormProps {
  monitor?: Monitor;
  mode: "create" | "edit";
}

export default function MonitorForm({ monitor, mode }: MonitorFormProps) {
  const router = useRouter();
  const createMonitor = useCreateMonitor();
  const updateMonitor = useUpdateMonitor();

  const [showToken, setShowToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(() => {
    if (monitor && mode === "edit") {
      return {
        name: monitor.name,
        url: monitor.url,
        interval_seconds: monitor.interval_seconds,
        is_active: monitor.is_active,
        auth_type: (monitor.auth_type || "none") as "none" | "bearer" | "basic",
        auth_token: monitor.auth_token || "",
        auth_username: monitor.auth_username || "",
        auth_password: monitor.auth_password || "",
      };
    }
    return {
      name: "",
      url: "",
      interval_seconds: 300,
      is_active: true,
      auth_type: "none" as "none" | "bearer" | "basic",
      auth_token: "",
      auth_username: "",
      auth_password: "",
    };
  });

  const getBasicAuthPreview = () => {
    if (!formData.auth_username && !formData.auth_password) {
      return "<credentials>";
    }
    try {
      const raw = `${formData.auth_username || ""}:${formData.auth_password || ""}`;
      const encoded = btoa(unescape(encodeURIComponent(raw)));
      return showPassword ? encoded : "•".repeat(Math.min(encoded.length, 24));
    } catch {
      return "<credentials>";
    }
  };

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
          auth_type: formData.auth_type,
          auth_token: formData.auth_type === "bearer" ? formData.auth_token : undefined,
          auth_username: formData.auth_type === "basic" ? formData.auth_username : undefined,
          auth_password: formData.auth_type === "basic" ? formData.auth_password : undefined,
        };
        await createMonitor.mutateAsync(data);
        router.push("/");
      } else if (monitor) {
        const data: MonitorUpdate = {
          name: formData.name,
          url: formData.url,
          interval_seconds: formData.interval_seconds,
          is_active: formData.is_active,
          auth_type: formData.auth_type,
          auth_token: formData.auth_type === "bearer" ? formData.auth_token : null,
          auth_username: formData.auth_type === "basic" ? formData.auth_username : null,
          auth_password: formData.auth_type === "basic" ? formData.auth_password : null,
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

      <div className="space-y-4 rounded-lg border p-4 bg-card/60">
        <div className="space-y-2">
          <Label htmlFor="auth_type">Authentication</Label>
          <Select
            id="auth_type"
            name="auth_type"
            value={formData.auth_type}
            onChange={handleChange}
          >
            <option value="none">None</option>
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
          </Select>
        </div>

        {formData.auth_type === "bearer" && (
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              <Label htmlFor="auth_token">Token *</Label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  id="auth_token"
                  name="auth_token"
                  value={formData.auth_token}
                  onChange={handleChange}
                  required={formData.auth_type === "bearer"}
                  placeholder="Enter token"
                  className="pr-12 font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted/60 p-3 text-xs space-y-1">
              <p className="font-semibold text-muted-foreground">Monitor sends:</p>
              <p className="font-mono text-foreground break-all">
                Authorization: Bearer {formData.auth_token ? (showToken ? formData.auth_token : "•".repeat(Math.min(formData.auth_token.length, 24))) : "<token>"}
              </p>
            </div>
          </div>
        )}

        {formData.auth_type === "basic" && (
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              <Label htmlFor="auth_username">Username *</Label>
              <Input
                type="text"
                id="auth_username"
                name="auth_username"
                value={formData.auth_username}
                onChange={handleChange}
                required={formData.auth_type === "basic"}
                placeholder="Enter username"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth_password">Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="auth_password"
                  name="auth_password"
                  value={formData.auth_password}
                  onChange={handleChange}
                  required={formData.auth_type === "basic"}
                  placeholder="Enter password"
                  className="pr-12 font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted/60 p-3 text-xs space-y-1">
              <p className="font-semibold text-muted-foreground">Monitor sends:</p>
              <p className="font-mono text-foreground break-all">
                Authorization: Basic {getBasicAuthPreview()}
              </p>
            </div>
          </div>
        )}
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
