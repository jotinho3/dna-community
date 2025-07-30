import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Users, Clock, BookOpen } from 'lucide-react';
import { WorkshopFilters, WorkshopCategory, WorkshopDifficulty, WorkshopFormat } from '../types/workshop';
import { useWorkshop } from '../hooks/useWorkshops';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WorkshopCard from './WorkshopCard';

interface WorkshopListProps {
  initialFilters?: WorkshopFilters;
  showFilters?: boolean;
  maxItems?: number;
  onWorkshopSelect?: (workshopId: string) => void;
  className?: string;
}

const WorkshopList: React.FC<WorkshopListProps> = ({
  initialFilters = {},
  showFilters = true,
  maxItems,
  onWorkshopSelect,
  className = '',
}) => {
  const [filters, setFilters] = useState<WorkshopFilters>(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    workshops,
    loading,
    error,
    hasMore,
    searchResult,
    getWorkshops,
    enrollInWorkshop,
    unenrollFromWorkshop,
    isEnrolled,
    canEnroll,
    getWorkshopStatus,
    formatWorkshopDate,
    formatWorkshopTime,
    enrollmentLoading,
    clearError,
  } = useWorkshop();

  // Load workshops when filters change
  useEffect(() => {
    const loadWorkshops = async () => {
      await getWorkshops(filters);
    };
    loadWorkshops();
  }, [filters, getWorkshops]);

  // Filter update handlers
  const handleFilterChange = (key: keyof WorkshopFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = (filters.page || 1) + 1;
      setFilters(prev => ({ ...prev, page: nextPage }));
    }
  };

  // Workshop action handlers
  const handleEnroll = async (workshopId: string) => {
    const success = await enrollInWorkshop(workshopId);
    if (success) {
      // Workshop list will automatically update through the hook
    }
  };

  const handleUnenroll = async (workshopId: string) => {
    const success = await unenrollFromWorkshop(workshopId);
    if (success) {
      // Workshop list will automatically update through the hook
    }
  };

  const categories: { value: WorkshopCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'machine_learning', label: 'Machine Learning' },
  { value: 'programming', label: 'Programming' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'visualization', label: 'Data Visualization' },
  { value: 'databases', label: 'Databases' },
  { value: 'cloud_computing', label: 'Cloud Computing' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'apis', label: 'APIs' },
  { value: 'other', label: 'Other' },
];

const difficulties: { value: WorkshopDifficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const formats: { value: WorkshopFormat | 'all'; label: string }[] = [
  { value: 'all', label: 'All Formats' },
  { value: 'online', label: 'Online' },
  { value: 'in_person', label: 'In Person' },
  { value: 'hybrid', label: 'Hybrid' },
];

  const sortOptions = [
    { value: 'scheduled_date', label: 'Date' },
    { value: 'created_at', label: 'Recently Added' },
    { value: 'title', label: 'Title' },
    { value: 'popularity', label: 'Popular' },
    { value: 'rating', label: 'Rating' },
  ];

  // Get displayed workshops (with maxItems limit if specified)
  const displayedWorkshops = maxItems ? workshops.slice(0, maxItems) : workshops;

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4 text-sm">{error}</div>
        <div className="space-x-2">
          <Button variant="outline" onClick={clearError}>
            Dismiss
          </Button>
          <Button onClick={() => getWorkshops(filters)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Find Workshops</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search workshops, topics, or instructors..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Difficulty
              </label>
              <Select
                value={filters.difficulty || 'all'}
                onValueChange={(value) => handleFilterChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Format
              </label>
              <Select
                value={filters.format || 'all'}
                onValueChange={(value) => handleFilterChange('format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sort By
              </label>
              <Select
                value={filters.sortBy || 'scheduled_date'}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t border-slate-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price
                  </label>
                  <Select
                    value={filters.price || 'all'}
                    onValueChange={(value) => handleFilterChange('price', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasAvailableSpots || false}
                      onChange={(e) => handleFilterChange('hasAvailableSpots', e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Available spots</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isRecorded || false}
                      onChange={(e) => handleFilterChange('isRecorded', e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Recorded</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters and Clear */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === 'page' || key === 'limit') return null;
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {key}: {String(value)}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleFilterChange(key as keyof WorkshopFilters, undefined)}
                    />
                  </Badge>
                );
              })}
            </div>

            {Object.keys(filters).length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-600">
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                Loading workshops...
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span>
                  {searchResult?.pagination.totalItems || workshops.length} workshop
                  {(searchResult?.pagination.totalItems || workshops.length) !== 1 ? 's' : ''} found
                </span>
                {searchResult?.pagination && (
                  <span className="text-xs">
                    Page {searchResult.pagination.currentPage} of {searchResult.pagination.totalPages}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workshop Grid */}
      {loading && workshops.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              </div>
              <div className="flex space-x-2 mb-4">
                <div className="h-6 bg-slate-200 rounded w-16"></div>
                <div className="h-6 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : displayedWorkshops.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No workshops found</h3>
          <p className="text-sm text-slate-500 mb-4">
            {Object.keys(filters).some(key => filters[key as keyof WorkshopFilters])
              ? "Try adjusting your filters to see more workshops."
              : "No workshops are currently available."}
          </p>
          {Object.keys(filters).length > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedWorkshops.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                isEnrolled={isEnrolled(workshop.id)}
                canEnroll={canEnroll(workshop)}
                onEnroll={() => handleEnroll(workshop.id)}
                onUnenroll={() => handleUnenroll(workshop.id)}
                onViewDetails={() => onWorkshopSelect?.(workshop.id)}
                status={getWorkshopStatus(workshop)}
                formattedDate={formatWorkshopDate(workshop)}
                formattedTime={formatWorkshopTime(workshop)}
                enrollmentLoading={enrollmentLoading}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !maxItems && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="min-w-32"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkshopList;