import React, { useState, useMemo } from "react";
import { Search, X, Filter } from "lucide-react";
import { legalGlossary, searchGlossary, getTermsByDocumentType } from "@/lib/legalGlossary";
import { LegalTermCard } from "./LegalTermTooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LegalHelpPanelProps {
  documentType?: "will" | "poa-property" | "poa-personal";
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Interactive legal help panel with search, filtering, and term definitions
 */
export function LegalHelpPanel({
  documentType,
  isOpen,
  onClose,
}: LegalHelpPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get all relevant terms
  const allTerms = documentType
    ? getTermsByDocumentType(documentType)
    : legalGlossary;

  // Filter by search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTerms;
    }
    return searchGlossary(searchQuery).filter(term =>
      documentType ? term.applicableDocuments.includes(documentType) : true
    );
  }, [searchQuery, allTerms, documentType]);

  // Filter by category
  const filteredTerms = useMemo(() => {
    if (selectedCategory === "all") {
      return searchResults;
    }
    return searchResults.filter(term => term.category === selectedCategory);
  }, [searchResults, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allTerms.map(t => t.category));
    return Array.from(cats).sort();
  }, [allTerms]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Legal Terms & Definitions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {documentType && `For ${documentType === "will" ? "Wills" : documentType === "poa-property" ? "Power of Attorney (Property)" : "Power of Attorney (Personal Care)"}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="border-b p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {filteredTerms.length} of {allTerms.length} terms
          </p>
        </div>

        {/* Terms List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No terms found matching your search.</p>
            </div>
          ) : (
            filteredTerms.map(term => (
              <LegalTermCard key={term.id} termId={term.id} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Help button that opens the legal help panel
 */
export function LegalHelpButton({
  documentType,
}: {
  documentType?: "will" | "poa-property" | "poa-personal";
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <HelpCircle className="w-4 h-4" />
        Legal Terms Help
      </Button>
      <LegalHelpPanel
        documentType={documentType}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

import { HelpCircle } from "lucide-react";
