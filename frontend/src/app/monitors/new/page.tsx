"use client";

import MonitorForm from "@/components/MonitorForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function NewMonitorPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <MonitorForm mode="create" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
