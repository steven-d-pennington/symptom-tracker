"use client";

import { useState, useEffect } from "react";
import { Database, ChevronRight, Plus, Edit, Trash2, Download, Search, X } from "lucide-react";
import { db } from "@/lib/db/client";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { toast } from "@/components/common/Toast";

// Define all table names from the database
const TABLES = [
  "users",
  "symptoms",
  "symptomInstances",
  "medications",
  "medicationEvents",
  "triggers",
  "triggerEvents",
  "foods",
  "foodEvents",
  "foodCombinations",
  "flares",
  "flareEvents",
  "moodEntries",
  "sleepEntries",
  "dailyEntries",
  "photoAttachments",
  "photoComparisons",
  "bodyMapLocations",
  "attachments",
  "analysisResults",
  "uxEvents",
] as const;

type TableName = typeof TABLES[number];

export default function MyDataPage() {
  const { userId } = useCurrentUser();
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [recordCount, setRecordCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Load record counts for all tables
  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const tableName of TABLES) {
        try {
          const count = await (db as any)[tableName].count();
          counts[tableName] = count;
        } catch (error) {
          console.error(`Error counting ${tableName}:`, error);
          counts[tableName] = 0;
        }
      }
      setRecordCount(counts);
    };

    loadCounts();
  }, []);

  // Load records for selected table
  useEffect(() => {
    if (!selectedTable) {
      setRecords([]);
      return;
    }

    const loadRecords = async () => {
      setIsLoading(true);
      try {
        const table = (db as any)[selectedTable];
        const allRecords = await table.toArray();
        setRecords(allRecords);
      } catch (error) {
        console.error(`Error loading ${selectedTable}:`, error);
        toast.error("Failed to load data", {
          description: String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [selectedTable]);

  // Filter records based on search term
  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return JSON.stringify(record).toLowerCase().includes(searchLower);
  });

  // Handle delete record
  const handleDelete = async (id: string) => {
    if (!selectedTable) return;

    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      return;
    }

    try {
      await (db as any)[selectedTable].delete(id);
      setRecords(records.filter((r) => r.id !== id));

      // Update count
      setRecordCount({
        ...recordCount,
        [selectedTable]: recordCount[selectedTable] - 1,
      });

      toast.success("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record", {
        description: String(error),
      });
    }
  };

  // Handle save (create or update)
  const handleSave = async () => {
    if (!selectedTable || !editingRecord) return;

    try {
      const table = (db as any)[selectedTable];

      if (isCreating) {
        await table.add(editingRecord);
        toast.success("Record created successfully");
        setRecordCount({
          ...recordCount,
          [selectedTable]: recordCount[selectedTable] + 1,
        });
      } else {
        await table.put(editingRecord);
        toast.success("Record updated successfully");
      }

      // Reload records
      const allRecords = await table.toArray();
      setRecords(allRecords);

      setShowEditor(false);
      setEditingRecord(null);
      setIsCreating(false);
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Failed to save record", {
        description: String(error),
      });
    }
  };

  // Handle export table
  const handleExport = () => {
    if (!selectedTable || records.length === 0) return;

    const dataStr = JSON.stringify(records, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTable}_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "object") {
      if (value instanceof Date) return value.toLocaleString();
      if (value instanceof Blob) return `[Blob: ${value.size} bytes]`;
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === "number") {
      // Check if it's a timestamp
      if (value > 1000000000000 && value < 9999999999999) {
        return `${value} (${new Date(value).toLocaleString()})`;
      }
      return value.toString();
    }
    return String(value);
  };

  // Get field type for input
  const getFieldType = (key: string, value: any): string => {
    if (key.includes("timestamp") || key.includes("Date") || key.includes("At")) return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "object") return "json";
    return "text";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Database className="w-8 h-8" />
          My Data
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your IndexedDB data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table List */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h2 className="font-semibold text-foreground">Tables</h2>
            </div>
            <div className="divide-y divide-border max-h-[calc(100vh-250px)] overflow-y-auto">
              {TABLES.map((tableName) => (
                <button
                  key={tableName}
                  onClick={() => setSelectedTable(tableName)}
                  className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                    selectedTable === tableName ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{tableName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {recordCount[tableName] || 0}
                      </span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Records View */}
        <div className="lg:col-span-3">
          {selectedTable ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-foreground">
                    {selectedTable} ({filteredRecords.length} records)
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsCreating(true);
                        setEditingRecord({ id: `new-${Date.now()}`, userId });
                        setShowEditor(true);
                      }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={records.length === 0}
                      className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Records List */}
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-2" />
                    <p>Loading records...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No records found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredRecords.map((record, index) => (
                      <div key={record.id || index} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-xs text-muted-foreground">ID: {record.id}</code>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setIsCreating(false);
                                setEditingRecord({ ...record });
                                setShowEditor(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <pre className="text-xs bg-muted/50 p-3 rounded overflow-x-auto">
                          {Object.entries(record).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="text-primary font-semibold">{key}:</span>{" "}
                              <span className="text-foreground">{formatValue(value)}</span>
                            </div>
                          ))}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a Table</h3>
              <p className="text-sm text-muted-foreground">
                Choose a table from the list to view and manage its records
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && editingRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {isCreating ? "Create" : "Edit"} {selectedTable} Record
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {Object.keys(editingRecord).map((key) => {
                const fieldType = getFieldType(key, editingRecord[key]);

                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {key}
                      <span className="text-xs text-muted-foreground ml-2">({fieldType})</span>
                    </label>

                    {fieldType === "boolean" ? (
                      <select
                        value={editingRecord[key]?.toString()}
                        onChange={(e) =>
                          setEditingRecord({
                            ...editingRecord,
                            [key]: e.target.value === "true",
                          })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : fieldType === "json" ? (
                      <textarea
                        value={JSON.stringify(editingRecord[key], null, 2)}
                        onChange={(e) => {
                          try {
                            setEditingRecord({
                              ...editingRecord,
                              [key]: JSON.parse(e.target.value),
                            });
                          } catch (error) {
                            // Invalid JSON, update raw
                            setEditingRecord({
                              ...editingRecord,
                              [key]: e.target.value,
                            });
                          }
                        }}
                        rows={4}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground font-mono"
                      />
                    ) : (
                      <input
                        type={fieldType === "number" ? "number" : "text"}
                        value={editingRecord[key] ?? ""}
                        onChange={(e) =>
                          setEditingRecord({
                            ...editingRecord,
                            [key]: fieldType === "number" ? Number(e.target.value) : e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingRecord(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
              >
                {isCreating ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
