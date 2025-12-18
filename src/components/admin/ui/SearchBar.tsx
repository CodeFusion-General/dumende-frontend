import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X, Clock, Filter, ChevronDown, History } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface QuickFilter {
  id: string;
  label: string;
  value: string;
  color?: "default" | "secondary" | "destructive" | "outline";
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultsCount?: number;
}

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch: (query: string) => void;
  onClear?: () => void;
  suggestions?: SearchSuggestion[];
  quickFilters?: QuickFilter[];
  searchHistory?: SearchHistory[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onQuickFilterSelect?: (filter: QuickFilter) => void;
  onHistorySelect?: (history: SearchHistory) => void;
  onHistoryClear?: () => void;
  loading?: boolean;
  disabled?: boolean;
  showSuggestions?: boolean;
  showQuickFilters?: boolean;
  showHistory?: boolean;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
}

export function SearchBar({
  placeholder = "Arama yapın...",
  value = "",
  onChange,
  onSearch,
  onClear,
  suggestions = [],
  quickFilters = [],
  searchHistory = [],
  onSuggestionSelect,
  onQuickFilterSelect,
  onHistorySelect,
  onHistoryClear,
  loading = false,
  disabled = false,
  showSuggestions = true,
  showQuickFilters = true,
  showHistory = true,
  debounceMs = 300,
  className,
  inputClassName,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "suggestions" | "history" | "filters"
  >("suggestions");
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (onChange) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [internalValue, onChange, debounceMs]);

  // Handle input change
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInternalValue(newValue);
      if (newValue.length > 0 && !isOpen) {
        setIsOpen(true);
      }
    },
    [isOpen]
  );

  // Handle search
  const handleSearch = useCallback(() => {
    if (internalValue.trim()) {
      onSearch(internalValue.trim());
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [internalValue, onSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setInternalValue("");
    setIsOpen(false);
    if (onChange) {
      onChange("");
    }
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  }, [onChange, onClear]);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [handleSearch]
  );

  // Handle suggestion select
  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      setInternalValue(suggestion.text);
      setIsOpen(false);
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion);
      } else {
        onSearch(suggestion.text);
      }
    },
    [onSuggestionSelect, onSearch]
  );

  // Handle quick filter select
  const handleQuickFilterSelect = useCallback(
    (filter: QuickFilter) => {
      setInternalValue(filter.value);
      setIsOpen(false);
      if (onQuickFilterSelect) {
        onQuickFilterSelect(filter);
      } else {
        onSearch(filter.value);
      }
    },
    [onQuickFilterSelect, onSearch]
  );

  // Handle history select
  const handleHistorySelect = useCallback(
    (history: SearchHistory) => {
      setInternalValue(history.query);
      setIsOpen(false);
      if (onHistorySelect) {
        onHistorySelect(history);
      } else {
        onSearch(history.query);
      }
    },
    [onHistorySelect, onSearch]
  );

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!internalValue.trim()) return suggestions;
    return suggestions.filter((suggestion) =>
      suggestion.text.toLowerCase().includes(internalValue.toLowerCase())
    );
  }, [suggestions, internalValue]);

  // Group suggestions by category
  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, SearchSuggestion[]> = {};
    filteredSuggestions.forEach((suggestion) => {
      const category = suggestion.category || "Genel";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(suggestion);
    });
    return groups;
  }, [filteredSuggestions]);

  // Determine which tab to show by default
  useEffect(() => {
    if (
      internalValue.trim() &&
      showSuggestions &&
      filteredSuggestions.length > 0
    ) {
      setActiveTab("suggestions");
    } else if (
      !internalValue.trim() &&
      showHistory &&
      searchHistory.length > 0
    ) {
      setActiveTab("history");
    } else if (showQuickFilters && quickFilters.length > 0) {
      setActiveTab("filters");
    }
  }, [
    internalValue,
    showSuggestions,
    showHistory,
    showQuickFilters,
    filteredSuggestions.length,
    searchHistory.length,
    quickFilters.length,
  ]);

  const hasContent =
    (showSuggestions && filteredSuggestions.length > 0) ||
    (showHistory && searchHistory.length > 0) ||
    (showQuickFilters && quickFilters.length > 0);

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isOpen && hasContent} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={internalValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => hasContent && setIsOpen(true)}
              disabled={disabled}
              className={cn("pl-10 pr-20", inputClassName)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
              {internalValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                disabled={!internalValue.trim() || loading}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          sideOffset={4}
        >
          <Command>
            <div className="flex border-b">
              {showSuggestions && filteredSuggestions.length > 0 && (
                <button
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === "suggestions"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveTab("suggestions")}
                >
                  Öneriler ({filteredSuggestions.length})
                </button>
              )}
              {showHistory && searchHistory.length > 0 && (
                <button
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === "history"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveTab("history")}
                >
                  <History className="mr-1 h-3 w-3 inline" />
                  Geçmiş
                </button>
              )}
              {showQuickFilters && quickFilters.length > 0 && (
                <button
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === "filters"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveTab("filters")}
                >
                  <Filter className="mr-1 h-3 w-3 inline" />
                  Filtreler
                </button>
              )}
            </div>

            <CommandList className="max-h-[300px]">
              {/* Suggestions Tab */}
              {activeTab === "suggestions" && showSuggestions && (
                <>
                  {Object.keys(groupedSuggestions).length === 0 ? (
                    <CommandEmpty>Öneri bulunamadı</CommandEmpty>
                  ) : (
                    Object.entries(groupedSuggestions).map(
                      ([category, suggestions]) => (
                        <CommandGroup key={category} heading={category}>
                          {suggestions.map((suggestion) => (
                            <CommandItem
                              key={suggestion.id}
                              value={suggestion.text}
                              onSelect={() =>
                                handleSuggestionSelect(suggestion)
                              }
                              className="cursor-pointer"
                            >
                              <Search className="mr-2 h-4 w-4" />
                              <span>{suggestion.text}</span>
                              {suggestion.metadata?.count && (
                                <Badge
                                  variant="secondary"
                                  className="ml-auto text-xs"
                                >
                                  {suggestion.metadata.count}
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )
                    )
                  )}
                </>
              )}

              {/* History Tab */}
              {activeTab === "history" && showHistory && (
                <>
                  {searchHistory.length === 0 ? (
                    <CommandEmpty>Arama geçmişi bulunamadı</CommandEmpty>
                  ) : (
                    <CommandGroup
                      heading={
                        <div className="flex items-center justify-between">
                          <span>Son Aramalar</span>
                          {onHistoryClear && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onHistoryClear}
                              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            >
                              Temizle
                            </Button>
                          )}
                        </div>
                      }
                    >
                      {searchHistory.map((history) => (
                        <CommandItem
                          key={history.id}
                          value={history.query}
                          onSelect={() => handleHistorySelect(history)}
                          className="cursor-pointer"
                        >
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{history.query}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(history.timestamp).toLocaleDateString(
                                "tr-TR"
                              )}
                              {history.resultsCount !== undefined && (
                                <span className="ml-2">
                                  {history.resultsCount} sonuç
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}

              {/* Quick Filters Tab */}
              {activeTab === "filters" && showQuickFilters && (
                <>
                  {quickFilters.length === 0 ? (
                    <CommandEmpty>Hızlı filtre bulunamadı</CommandEmpty>
                  ) : (
                    <CommandGroup heading="Hızlı Filtreler">
                      {quickFilters.map((filter) => (
                        <CommandItem
                          key={filter.id}
                          value={filter.label}
                          onSelect={() => handleQuickFilterSelect(filter)}
                          className="cursor-pointer"
                        >
                          <Filter className="mr-2 h-4 w-4" />
                          <span>{filter.label}</span>
                          <Badge
                            variant={filter.color || "secondary"}
                            className="ml-auto text-xs"
                          >
                            {filter.value}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Predefined quick filters for common use cases
export const commonQuickFilters = {
  status: {
    active: {
      id: "active",
      label: "Aktif Kayıtlar",
      value: "status:active",
      color: "default" as const,
    },
    inactive: {
      id: "inactive",
      label: "Pasif Kayıtlar",
      value: "status:inactive",
      color: "secondary" as const,
    },
    pending: {
      id: "pending",
      label: "Bekleyen Kayıtlar",
      value: "status:pending",
      color: "outline" as const,
    },
  },

  date: {
    today: {
      id: "today",
      label: "Bugün",
      value: "date:today",
      color: "default" as const,
    },
    thisWeek: {
      id: "thisWeek",
      label: "Bu Hafta",
      value: "date:thisWeek",
      color: "default" as const,
    },
    thisMonth: {
      id: "thisMonth",
      label: "Bu Ay",
      value: "date:thisMonth",
      color: "default" as const,
    },
  },

  type: {
    user: {
      id: "user",
      label: "Kullanıcılar",
      value: "type:user",
      color: "default" as const,
    },
    boat: {
      id: "boat",
      label: "Tekneler",
      value: "type:boat",
      color: "default" as const,
    },
    tour: {
      id: "tour",
      label: "Turlar",
      value: "type:tour",
      color: "default" as const,
    },
    booking: {
      id: "booking",
      label: "Rezervasyonlar",
      value: "type:booking",
      color: "default" as const,
    },
  },
};
