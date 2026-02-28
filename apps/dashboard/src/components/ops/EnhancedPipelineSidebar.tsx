"use client";

import { useState, useMemo } from "react";
import { Search, Filter, CheckCircle, XCircle, Clock, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Pipeline } from "@/lib/ops/mock-data";

interface EnhancedPipelineSidebarProps {
  pipelines: Pipeline[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "awaiting_approval", label: "Awaiting Approval" },
] as const;

const TRIGGER_FILTERS = [
  { value: "all", label: "All Triggers" },
  { value: "push", label: "Push" },
  { value: "schedule", label: "Scheduled" },
  { value: "manual", label: "Manual" },
] as const;

export function EnhancedPipelineSidebar({ pipelines, selectedId, onSelect }: EnhancedPipelineSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [triggerFilter, setTriggerFilter] = useState("all");

  const filteredPipelines = useMemo(() => {
    return pipelines.filter((pipeline) => {
      // Search filter
      const matchesSearch = 
        pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pipeline.sourceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pipeline.trigger.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || pipeline.status === statusFilter;

      // Trigger filter
      const matchesTrigger = triggerFilter === "all" || pipeline.trigger === triggerFilter;

      return matchesSearch && matchesStatus && matchesTrigger;
    });
  }, [pipelines, searchQuery, statusFilter, triggerFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-500" />;
      case "running":
        return <Play className="h-3 w-3 text-blue-500" />;
      case "awaiting_approval":
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "awaiting_approval":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case "push":
        return "bg-purple-100 text-purple-800";
      case "schedule":
        return "bg-green-100 text-green-800";
      case "manual":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTriggerFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || triggerFilter !== "all";

  return (
    <div className="w-80 border-r border-border bg-card/50 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Pipelines ({filteredPipelines.length})
        </h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pipelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 font-mono text-xs"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filters</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value} className="text-xs">
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={triggerFilter} onValueChange={setTriggerFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value} className="text-xs">
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pipeline List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPipelines.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? "No pipelines match your filters" : "No pipelines found"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredPipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedId === pipeline.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80 hover:bg-muted/30"
                }`}
                onClick={() => onSelect(pipeline.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(pipeline.status)}
                    <span className="font-medium text-sm line-clamp-1">{pipeline.name}</span>
                  </div>
                  <Badge className={`text-xs px-1.5 py-0.5 ${getStatusColor(pipeline.status)}`}>
                    {pipeline.status}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {pipeline.sourceRef}
                    </span>
                    <Badge className={`text-xs ${getTriggerColor(pipeline.trigger)}`}>
                      {pipeline.trigger}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {pipeline.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
