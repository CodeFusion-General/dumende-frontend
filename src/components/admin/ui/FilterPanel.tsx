import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  Save,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Types
export type FilterType =
  | "text"
  | "select"
  | "multiselect"
  | "date"
  | "daterange"
  | "number"
  | "boolean";

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: any;
  required?: boolean;
  validation?: (value: any) => string | null;
  width?: "sm" | "md" | "lg" | "full";
}

export interface FilterValues {
  [key: string]: any;
}

export interface SavedFilter {
  id: string;
  name: string;
  values: FilterValues;
  createdAt: string;
}

export interface FilterPanelProps {
  filters: FilterDefinition[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset: () => void;
  onSave?: (name: string, values: FilterValues) => void;
  savedFilters?: SavedFilter[];
  onLoadSavedFilter?: (filter: SavedFilter) => void;
  onDeleteSavedFilter?: (filterId: string) => void;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  onSave,
  savedFilters = [],
  onLoadSavedFilter,
  onDeleteSavedFilter,
  className,
  collapsible = true,
  defaultCollapsed = false,
}: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Handle filter value change
  const handleValueChange = useCallback(
    (key: string, value: any) => {
      const newValues = { ...values, [key]: value };
      onChange(newValues);
    },
    [values, onChange]
  );

  // Handle filter removal
  const handleRemoveFilter = useCallback(
    (key: string) => {
      const newValues = { ...values };
      delete newValues[key];
      onChange(newValues);
    },
    [values, onChange]
  );

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.keys(values).filter((key) => {
      const value = values[key];
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
  }, [values]);

  // Handle save filter
  const handleSaveFilter = useCallback(() => {
    if (!onSave || !saveFilterName.trim()) return;

    onSave(saveFilterName.trim(), values);
    setSaveFilterName("");
    setShowSaveDialog(false);
  }, [onSave, saveFilterName, values]);

  // Render filter input based on type
  const renderFilterInput = useCallback(
    (filter: FilterDefinition) => {
      const value = values[filter.key];
      const widthClass = {
        sm: "w-32",
        md: "w-48",
        lg: "w-64",
        full: "w-full",
      }[filter.width || "md"];

      switch (filter.type) {
        case "text":
          return (
            <Input
              placeholder={filter.placeholder}
              value={value || ""}
              onChange={(e) => handleValueChange(filter.key, e.target.value)}
              className={widthClass}
            />
          );

        case "number":
          return (
            <Input
              type="number"
              placeholder={filter.placeholder}
              value={value || ""}
              onChange={(e) => handleValueChange(filter.key, e.target.value)}
              className={widthClass}
            />
          );

        case "select":
          return (
            <Select
              value={value || ""}
              onValueChange={(newValue) =>
                handleValueChange(filter.key, newValue)
              }
            >
              <SelectTrigger className={widthClass}>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem
                    key={option.value.toString()}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case "multiselect":
          const selectedValues = Array.isArray(value) ? value : [];
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(widthClass, "justify-between")}
                >
                  {selectedValues.length > 0
                    ? `${selectedValues.length} seçildi`
                    : filter.placeholder || "Seçiniz"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="p-4 space-y-2">
                  {filter.options?.map((option) => (
                    <div
                      key={option.value.toString()}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${filter.key}-${option.value}`}
                        checked={selectedValues.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const newValues = checked
                            ? [...selectedValues, option.value]
                            : selectedValues.filter((v) => v !== option.value);
                          handleValueChange(filter.key, newValues);
                        }}
                      />
                      <Label
                        htmlFor={`${filter.key}-${option.value}`}
                        className="text-sm font-normal"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );

        case "boolean":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={filter.key}
                checked={value || false}
                onCheckedChange={(checked) =>
                  handleValueChange(filter.key, checked)
                }
              />
              <Label htmlFor={filter.key} className="text-sm font-normal">
                {filter.label}
              </Label>
            </div>
          );

        case "date":
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    widthClass,
                    "justify-start text-left font-normal"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value
                    ? format(new Date(value), "dd/MM/yyyy", { locale: tr })
                    : filter.placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) =>
                    handleValueChange(filter.key, date?.toISOString())
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          );

        case "daterange":
          const dateRange = value || {};
          return (
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-32 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from
                      ? format(new Date(dateRange.from), "dd/MM/yyyy", {
                          locale: tr,
                        })
                      : "Başlangıç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      dateRange.from ? new Date(dateRange.from) : undefined
                    }
                    onSelect={(date) =>
                      handleValueChange(filter.key, {
                        ...dateRange,
                        from: date?.toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">-</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-32 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to
                      ? format(new Date(dateRange.to), "dd/MM/yyyy", {
                          locale: tr,
                        })
                      : "Bitiş"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to ? new Date(dateRange.to) : undefined}
                    onSelect={(date) =>
                      handleValueChange(filter.key, {
                        ...dateRange,
                        to: date?.toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          );

        default:
          return null;
      }
    },
    [values, handleValueChange]
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Filtreler</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isCollapsed && "rotate-180"
                  )}
                />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(values)
                .filter(([_, value]) => {
                  if (value === null || value === undefined || value === "")
                    return false;
                  if (Array.isArray(value) && value.length === 0) return false;
                  return true;
                })
                .map(([key, value]) => {
                  const filter = filters.find((f) => f.key === key);
                  if (!filter) return null;

                  let displayValue = "";
                  if (filter.type === "multiselect" && Array.isArray(value)) {
                    displayValue = `${value.length} seçildi`;
                  } else if (
                    filter.type === "daterange" &&
                    value.from &&
                    value.to
                  ) {
                    displayValue = `${format(new Date(value.from), "dd/MM", {
                      locale: tr,
                    })} - ${format(new Date(value.to), "dd/MM", {
                      locale: tr,
                    })}`;
                  } else if (filter.type === "date") {
                    displayValue = format(new Date(value), "dd/MM/yyyy", {
                      locale: tr,
                    });
                  } else if (filter.type === "select") {
                    const option = filter.options?.find(
                      (o) => o.value === value
                    );
                    displayValue = option?.label || value.toString();
                  } else {
                    displayValue = value.toString();
                  }

                  return (
                    <Badge key={key} variant="secondary" className="gap-1">
                      <span className="text-xs font-medium">
                        {filter.label}:
                      </span>
                      <span className="text-xs">{displayValue}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => handleRemoveFilter(key)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
            </div>
          )}

          {activeFiltersCount > 0 && <Separator />}

          {/* Filter Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                {filter.type !== "boolean" && (
                  <Label htmlFor={filter.key} className="text-sm font-medium">
                    {filter.label}
                    {filter.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                )}
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Kayıtlı Filtreler</Label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map((savedFilter) => (
                    <div
                      key={savedFilter.id}
                      className="flex items-center gap-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadSavedFilter?.(savedFilter)}
                        className="text-xs"
                      >
                        {savedFilter.name}
                      </Button>
                      {onDeleteSavedFilter && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSavedFilter(savedFilter.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onReset} size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Temizle
              </Button>
              {onSave && (
                <Popover open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activeFiltersCount === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="filter-name">Filtre Adı</Label>
                        <Input
                          id="filter-name"
                          placeholder="Filtre adını girin"
                          value={saveFilterName}
                          onChange={(e) => setSaveFilterName(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveFilter}
                          disabled={!saveFilterName.trim()}
                          size="sm"
                        >
                          Kaydet
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowSaveDialog(false)}
                          size="sm"
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {activeFiltersCount > 0 && `${activeFiltersCount} filtre aktif`}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Predefined filter definitions for common use cases
export const commonFilters = {
  status: (options: FilterOption[]): FilterDefinition => ({
    key: "status",
    label: "Durum",
    type: "select",
    options,
    placeholder: "Durum seçiniz",
  }),

  dateRange: (): FilterDefinition => ({
    key: "dateRange",
    label: "Tarih Aralığı",
    type: "daterange",
    width: "lg",
  }),

  search: (): FilterDefinition => ({
    key: "search",
    label: "Arama",
    type: "text",
    placeholder: "Arama yapın...",
    width: "lg",
  }),

  category: (options: FilterOption[]): FilterDefinition => ({
    key: "category",
    label: "Kategori",
    type: "multiselect",
    options,
    placeholder: "Kategori seçiniz",
  }),

  active: (): FilterDefinition => ({
    key: "active",
    label: "Sadece aktif kayıtlar",
    type: "boolean",
  }),
};
