"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Database,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  X,
  FileJson,
  Check,
} from "lucide-react";
import { db } from "@/lib/db/client";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

// All tables from schema v28
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
  "bodyMarkers",
  "bodyMarkerEvents",
  "bodyMarkerLocations",
  "moodEntries",
  "sleepEntries",
  "dailyEntries",
  "dailyLogs",
  "photoAttachments",
  "photoComparisons",
  "bodyMapLocations",
  "bodyMapPreferences",
  "attachments",
  "analysisResults",
  "uxEvents",
  "correlations",
  "patternDetections",
  "treatmentEffectiveness",
  "treatmentAlerts",
] as const;

type TableName = (typeof TABLES)[number];

interface DatabaseManagerProps {
  onClose?: () => void;
}

export function DatabaseManager({ onClose }: DatabaseManagerProps) {
  const { userId } = useCurrentUser();
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [recordCount, setRecordCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load record counts for all tables
  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const tableName of TABLES) {
        try {
          const count = await (db as any)[tableName]?.count();
          counts[tableName] = count || 0;
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
        setMessage({
          type: "error",
          text: `Failed to load ${selectedTable}: ${error}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [selectedTable]);

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const searchLower = searchTerm.toLowerCase();
    return records.filter((record) =>
      JSON.stringify(record).toLowerCase().includes(searchLower)
    );
  }, [records, searchTerm]);

  // Total records across all tables
  const totalRecords = useMemo(
    () => Object.values(recordCount).reduce((sum, count) => sum + count, 0),
    [recordCount]
  );

  // Handle delete record
  const handleDelete = async (id: string) => {
    if (!selectedTable) return;

    if (
      !confirm(
        "Are you sure you want to delete this record? This action cannot be undone."
      )
    ) {
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

      setMessage({ type: "success", text: "Record deleted successfully" });
    } catch (error) {
      console.error("Error deleting record:", error);
      setMessage({
        type: "error",
        text: `Failed to delete record: ${error}`,
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
        setMessage({ type: "success", text: "Record created successfully" });
        setRecordCount({
          ...recordCount,
          [selectedTable]: recordCount[selectedTable] + 1,
        });
      } else {
        await table.put(editingRecord);
        setMessage({ type: "success", text: "Record updated successfully" });
      }

      // Reload records
      const allRecords = await table.toArray();
      setRecords(allRecords);

      setShowEditor(false);
      setEditingRecord(null);
      setIsCreating(false);
    } catch (error) {
      console.error("Error saving record:", error);
      setMessage({
        type: "error",
        text: `Failed to save record: ${error}`,
      });
    }
  };

  // Handle export table
  const handleExportTable = () => {
    if (!selectedTable || records.length === 0) return;

    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTable}_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setMessage({
      type: "success",
      text: `Exported ${filteredRecords.length} records from ${selectedTable}`,
    });
  };

  // Handle export all data
  const handleExportAll = async () => {
    try {
      const allData: Record<string, any[]> = {};

      for (const tableName of TABLES) {
        try {
          const table = (db as any)[tableName];
          const records = await table?.toArray();
          if (records && records.length > 0) {
            allData[tableName] = records;
          }
        } catch (error) {
          console.error(`Error exporting ${tableName}:`, error);
        }
      }

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `symptom_tracker_backup_${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: `Exported complete database (${totalRecords} total records)`,
      });
    } catch (error) {
      console.error("Error exporting all data:", error);
      setMessage({
        type: "error",
        text: `Failed to export data: ${error}`,
      });
    }
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
    if (
      key.includes("timestamp") ||
      key.includes("Date") ||
      key.includes("At")
    )
      return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "object") return "json";
    return "text";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Manager
          </h3>
          <p className="text-sm text-muted-foreground">
            {totalRecords} total records across {TABLES.length} tables
          </p>
        </div>
        <button
          onClick={handleExportAll}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <FileJson className="w-4 h-4" />
          Export All Data
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg border flex items-start gap-2 ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm flex-1">{message.text}</p>
          <button
            onClick={() => setMessage(null)}
            className="text-current opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Table List */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/50">
              <h4 className="font-medium text-foreground text-sm">Tables</h4>
            </div>
            <div className="divide-y divide-border max-h-[calc(100vh-400px)] overflow-y-auto">
              {TABLES.map((tableName) => (
                <button
                  key={tableName}
                  onClick={() => {
                    setSelectedTable(tableName);
                    setSearchTerm("");
                  }}
                  className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                    selectedTable === tableName
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {tableName}
                    </span>
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
                  <h4 className="font-medium text-foreground">
                    {selectedTable} ({filteredRecords.length} records)
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsCreating(true);
                        setEditingRecord({
                          id: `new-${Date.now()}`,
                          userId,
                          createdAt: Date.now(),
                          updatedAt: Date.now(),
                        });
                        setShowEditor(true);
                      }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
                      title="Add new record"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={handleExportTable}
                      disabled={records.length === 0}
                      className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export table to JSON"
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
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Records List */}
              <div className="max-h-[calc(100vh-450px)] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-2" />
                    <p>Loading records...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>
                      {searchTerm
                        ? "No matching records found"
                        : "No records in this table"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredRecords.map((record, index) => (
                      <div
                        key={record.id || index}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-xs text-muted-foreground">
                            ID: {record.id}
                          </code>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setIsCreating(false);
                                setEditingRecord({ ...record });
                                setShowEditor(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                              title="Edit record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <pre className="text-xs bg-muted/50 p-3 rounded overflow-x-auto">
                          {Object.entries(record).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="text-primary font-semibold">
                                {key}:
                              </span>{" "}
                              <span className="text-foreground">
                                {formatValue(value)}
                              </span>
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
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Select a Table
              </h3>
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
                      <span className="text-xs text-muted-foreground ml-2">
                        ({fieldType})
                      </span>
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
                            // Invalid JSON, keep editing
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
                            [key]:
                              fieldType === "number"
                                ? Number(e.target.value)
                                : e.target.value,
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
