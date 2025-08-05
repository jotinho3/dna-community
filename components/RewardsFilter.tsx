"use client";

import React, { useState } from "react";
import { Filter, X } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface RewardFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export const RewardFilters: React.FC<RewardFiltersProps> = ({
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    minCost: '',
    maxCost: '',
  });

  const categories = [
    { value: 'learning', label: 'Learning' },
    { value: 'merchandise', label: 'Merchandise' },
    { value: 'certification', label: 'Certification' },
    { value: 'exclusive_access', label: 'Exclusive Access' },
    { value: 'other', label: 'Other' },
  ];

  const types = [
    { value: 'digital', label: 'Digital' },
    { value: 'physical', label: 'Physical' },
    { value: 'experience', label: 'Experience' },
    { value: 'discount', label: 'Discount' },
  ];

  const applyFilters = () => {
    const cleanFilters: any = {};
    if (filters.category) cleanFilters.category = filters.category;
    if (filters.type) cleanFilters.type = filters.type;
    if (filters.minCost) cleanFilters.minCost = parseInt(filters.minCost);
    if (filters.maxCost) cleanFilters.maxCost = parseInt(filters.maxCost);
    
    onFiltersChange(cleanFilters);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      type: '',
      minCost: '',
      maxCost: '',
    });
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Rewards</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Category</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Type</SelectItem>
                      {types.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minCost">Min Cost</Label>
                  <Input
                    id="minCost"
                    type="number"
                    placeholder="0"
                    value={filters.minCost}
                    onChange={(e) => setFilters(prev => ({ ...prev, minCost: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxCost">Max Cost</Label>
                  <Input
                    id="maxCost"
                    type="number"
                    placeholder="10"
                    value={filters.maxCost}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxCost: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center space-x-2">
            {filters.category && (
              <Badge variant="secondary">
                Category: {categories.find(c => c.value === filters.category)?.label}
              </Badge>
            )}
            {filters.type && (
              <Badge variant="secondary">
                Type: {types.find(t => t.value === filters.type)?.label}
              </Badge>
            )}
            {(filters.minCost || filters.maxCost) && (
              <Badge variant="secondary">
                Cost: {filters.minCost || '0'}-{filters.maxCost || '∞'} tokens
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};