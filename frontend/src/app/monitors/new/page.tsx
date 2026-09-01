import MonitorForm from "@/components/MonitorForm";

export default function NewMonitorPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Monitor</h1>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <MonitorForm mode="create" />
      </div>
    </div>
  );
}
