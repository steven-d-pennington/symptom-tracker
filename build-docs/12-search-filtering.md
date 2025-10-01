# Search/Filtering - Implementation Plan

## Overview

The Search/Filtering system provides powerful, flexible search capabilities across all health data with advanced filtering options. This feature includes full-text search, faceted filtering, saved searches, and intelligent query suggestions. The system supports complex boolean queries, fuzzy matching, and relevance ranking to help users quickly find relevant health information.

## Core Requirements

### User Experience Goals
- **Instant Results**: Fast, responsive search with real-time results
- **Flexible Filtering**: Multiple filter types with easy combination
- **Smart Suggestions**: Intelligent query suggestions and auto-complete
- **Saved Searches**: Persistent search configurations for frequent use
- **Visual Feedback**: Clear result highlighting and relevance indicators

### Technical Goals
- **High Performance**: Sub-second search response times
- **Scalable Indexing**: Efficient indexing of large health datasets
- **Advanced Queries**: Complex boolean logic and fuzzy matching
- **Privacy-First**: Secure search without compromising data protection
- **Offline Capable**: Search functionality works without internet

## System Architecture

### Data Model
```typescript
interface SearchQuery {
  id: string;
  userId: string;
  query: string;
  filters: SearchFilter[];
  sortBy: SortOption;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchScope: SearchScope[];
  createdAt: Date;
  lastUsed?: Date;
  isSaved: boolean;
  name?: string;
  description?: string;
}

type SearchScope =
  | 'symptoms'
  | 'medications'
  | 'triggers'
  | 'notes'
  | 'photos'
  | 'appointments'
  | 'lab-results'
  | 'custom-trackables'
  | 'all';

interface SearchFilter {
  type: FilterType;
  field: string;
  operator: FilterOperator;
  value: any;
  enabled: boolean;
  label: string;
}

type FilterType =
  | 'text'
  | 'date-range'
  | 'number-range'
  | 'category'
  | 'severity'
  | 'location'
  | 'tag'
  | 'boolean'
  | 'multi-select';

type FilterOperator =
  | 'equals'
  | 'not-equals'
  | 'contains'
  | 'not-contains'
  | 'starts-with'
  | 'ends-with'
  | 'greater-than'
  | 'less-than'
  | 'between'
  | 'in'
  | 'not-in'
  | 'before'
  | 'after'
  | 'within';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  content: string;
  metadata: ResultMetadata;
  score: number;
  highlights: Highlight[];
  relatedItems: RelatedItem[];
  timestamp: Date;
}

type SearchResultType =
  | 'symptom-entry'
  | 'medication-log'
  | 'trigger-event'
  | 'note'
  | 'photo'
  | 'appointment'
  | 'lab-result'
  | 'custom-trackable'
  | 'flare-event';

interface ResultMetadata {
  severity?: number;
  category?: string;
  tags: string[];
  location?: string;
  duration?: number;
  source: 'user' | 'auto' | 'import';
  confidence?: number;
}

interface Highlight {
  field: string;
  text: string;
  start: number;
  end: number;
  type: 'exact' | 'fuzzy' | 'stemmed';
}

interface RelatedItem {
  id: string;
  type: SearchResultType;
  title: string;
  relationship: 'similar' | 'related' | 'caused-by' | 'relieved-by' | 'correlated';
  strength: number;
}

interface SearchIndex {
  id: string;
  userId: string;
  type: IndexType;
  lastUpdated: Date;
  documentCount: number;
  size: number; // bytes
  status: 'building' | 'ready' | 'updating' | 'failed';
}

type IndexType =
  | 'full-text'
  | 'symptoms'
  | 'medications'
  | 'triggers'
  | 'metadata'
  | 'combined';

interface SearchSuggestion {
  id: string;
  query: string;
  type: SuggestionType;
  confidence: number;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
}

type SuggestionType =
  | 'completion'
  | 'correction'
  | 'related'
  | 'popular'
  | 'recent';

interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description?: string;
  query: SearchQuery;
  isDefault: boolean;
  isPublic: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SearchAnalytics {
  id: string;
  userId: string;
  query: string;
  resultCount: number;
  searchTime: number; // milliseconds
  filtersUsed: string[];
  clickedResults: string[];
  timestamp: Date;
  sessionId: string;
}

interface FacetResult {
  field: string;
  type: 'terms' | 'range' | 'date_histogram';
  values: FacetValue[];
  totalCount: number;
}

interface FacetValue {
  value: string | number;
  count: number;
  selected: boolean;
  label?: string;
}
```

### Component Architecture
```
SearchFilteringSystem/
├── SearchInterface.tsx                 # Main search interface
├── SearchBar.tsx                       # Search input with auto-complete
├── FilterPanel.tsx                     # Advanced filtering controls
├── SearchResults.tsx                   # Results display and navigation
├── SearchSuggestions.tsx               # Query suggestions and corrections
├── SavedSearches.tsx                   # Saved search management
├── SearchAnalytics.tsx                 # Search usage analytics
├── SearchIndexManager.tsx              # Index management and updates
├── FacetedSearch.tsx                   # Faceted navigation system
└── SearchSettings.tsx                  # Search preferences and configuration
```

## Search Interface Implementation

### Main Search Component
```tsx
function SearchInterface({ userId, initialQuery = '', onResultSelect }: SearchInterfaceProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<FacetResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SavedSearch[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchScope, setSearchScope] = useState<SearchScope[]>(['all']);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    loadSearchHistory();
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [userId]);

  useEffect(() => {
    // Debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setFacets([]);
      }
    }, 300);

    // Update suggestions
    if (query.trim()) {
      updateSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query, filters, searchScope]);

  const performSearch = async (searchQuery: string, page = 1) => {
    setLoading(true);

    // Cancel previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const searchParams = {
        query: searchQuery,
        filters,
        sortBy,
        searchScope,
        page,
        limit: 20,
        signal: abortControllerRef.current.signal
      };

      const response = await performSearchQuery(userId, searchParams);

      setResults(response.results);
      setFacets(response.facets);
      setTotalResults(response.totalCount);
      setCurrentPage(page);

      // Log search analytics
      logSearchAnalytics(userId, {
        query: searchQuery,
        resultCount: response.results.length,
        searchTime: response.searchTime,
        filtersUsed: filters.map(f => f.field),
        timestamp: new Date(),
        sessionId: getCurrentSessionId()
      });

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search failed:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestions = async (partialQuery: string) => {
    try {
      const suggestionResults = await getSearchSuggestions(userId, partialQuery);
      setSuggestions(suggestionResults);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const handleFilterChange = (newFilters: SearchFilter[]) => {
    setFilters(newFilters);
  };

  const handleFacetSelect = (facet: FacetResult, value: FacetValue) => {
    const newFilter: SearchFilter = {
      type: facet.type === 'terms' ? 'multi-select' : 'range',
      field: facet.field,
      operator: 'in',
      value: [value.value],
      enabled: true,
      label: `${facet.field}: ${value.label || value.value}`
    };

    setFilters(prev => [...prev, newFilter]);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.query);
    performSearch(suggestion.query);
  };

  const handleSaveSearch = async (name: string, description?: string) => {
    try {
      const savedSearch: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        name,
        description,
        query: {
          id: '',
          userId,
          query,
          filters,
          sortBy,
          searchScope,
          createdAt: new Date()
        },
        isDefault: false,
        isPublic: false,
        usageCount: 0
      };

      await saveSearchConfiguration(savedSearch);
      loadSearchHistory(); // Refresh saved searches
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await getSavedSearches(userId);
      setSearchHistory(history);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query.query);
    setFilters(savedSearch.query.filters);
    setSortBy(savedSearch.query.sortBy);
    setSearchScope(savedSearch.query.searchScope);
    performSearch(savedSearch.query.query);
  };

  return (
    <div className="search-interface">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-input-container">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={(q) => performSearch(q)}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
            loading={loading}
          />
        </div>

        <div className="search-controls">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="severity-desc">Highest Severity</SelectItem>
              <SelectItem value="severity-asc">Lowest Severity</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon />
            Filters
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowSavedSearches(!showSavedSearches)}
          >
            <BookmarkIcon />
            Saved
          </Button>
        </div>
      </div>

      {/* Search Scope */}
      <div className="search-scope">
        <div className="scope-label">Search in:</div>
        <div className="scope-options">
          {(['all', 'symptoms', 'medications', 'triggers', 'notes'] as SearchScope[]).map(scope => (
            <Button
              key={scope}
              variant={searchScope.includes(scope) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (scope === 'all') {
                  setSearchScope(['all']);
                } else {
                  setSearchScope(prev =>
                    prev.includes(scope)
                      ? prev.filter(s => s !== scope && s !== 'all')
                      : prev.filter(s => s !== 'all').concat(scope)
                  );
                }
              }}
            >
              {formatScopeLabel(scope)}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFilterChange}
          availableFields={getAvailableFields()}
          facets={facets}
          onFacetSelect={handleFacetSelect}
        />
      )}

      {/* Saved Searches Panel */}
      {showSavedSearches && (
        <SavedSearches
          searches={searchHistory}
          onLoadSearch={handleLoadSavedSearch}
          onSaveCurrent={handleSaveSearch}
          onDeleteSearch={handleDeleteSavedSearch}
        />
      )}

      {/* Results */}
      <div className="search-results">
        <SearchResults
          results={results}
          loading={loading}
          totalCount={totalResults}
          currentPage={currentPage}
          onPageChange={(page) => performSearch(query, page)}
          onResultClick={onResultSelect}
          query={query}
        />
      </div>
    </div>
  );
}
```

### Search Engine Implementation
```tsx
class SearchEngine {
  private indexManager: IndexManager;
  private queryParser: QueryParser;
  private resultRanker: ResultRanker;
  private analyticsLogger: AnalyticsLogger;

  constructor(userId: string) {
    this.indexManager = new IndexManager(userId);
    this.queryParser = new QueryParser();
    this.resultRanker = new ResultRanker();
    this.analyticsLogger = new AnalyticsLogger();
  }

  async search(searchParams: SearchParams): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // Parse and validate query
      const parsedQuery = this.queryParser.parse(searchParams.query);

      // Get relevant indices
      const indices = await this.indexManager.getIndices(searchParams.searchScope);

      // Execute search across indices
      const rawResults = await this.executeSearch(parsedQuery, indices, searchParams);

      // Apply filters
      const filteredResults = this.applyFilters(rawResults, searchParams.filters);

      // Rank and sort results
      const rankedResults = this.resultRanker.rank(
        filteredResults,
        searchParams.sortBy,
        parsedQuery
      );

      // Paginate results
      const paginatedResults = this.paginateResults(
        rankedResults,
        searchParams.page,
        searchParams.limit
      );

      // Generate facets
      const facets = await this.generateFacets(filteredResults, searchParams);

      // Highlight matches
      const highlightedResults = this.highlightMatches(paginatedResults, parsedQuery);

      // Add related items
      const enrichedResults = await this.enrichWithRelatedItems(highlightedResults);

      const searchTime = Date.now() - startTime;

      // Log analytics
      await this.analyticsLogger.logSearch({
        userId: searchParams.userId,
        query: searchParams.query,
        resultCount: enrichedResults.length,
        searchTime,
        filtersUsed: searchParams.filters.map(f => f.field),
        timestamp: new Date()
      });

      return {
        results: enrichedResults,
        facets,
        totalCount: filteredResults.length,
        searchTime,
        suggestions: await this.generateSuggestions(searchParams.query)
      };

    } catch (error) {
      console.error('Search execution failed:', error);
      throw error;
    }
  }

  private async executeSearch(
    parsedQuery: ParsedQuery,
    indices: SearchIndex[],
    searchParams: SearchParams
  ): Promise<RawSearchResult[]> {
    const results: RawSearchResult[] = [];

    for (const index of indices) {
      const indexResults = await this.searchIndex(index, parsedQuery, searchParams);
      results.push(...indexResults);
    }

    return results;
  }

  private async searchIndex(
    index: SearchIndex,
    query: ParsedQuery,
    searchParams: SearchParams
  ): Promise<RawSearchResult[]> {
    // Use IndexedDB for local search
    const db = await openSearchDatabase(searchParams.userId);

    const transaction = db.transaction([index.id], 'readonly');
    const store = transaction.objectStore(index.id);

    // Build search query
    const searchQuery = this.buildIndexQuery(query, searchParams.filters);

    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      const results: RawSearchResult[] = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;

          if (this.matchesQuery(record, searchQuery)) {
            results.push({
              id: record.id,
              type: record.type,
              content: record.content,
              metadata: record.metadata,
              score: this.calculateBaseScore(record, query)
            });
          }

          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  private matchesQuery(record: any, query: any): boolean {
    // Implement query matching logic
    // Support for exact match, fuzzy match, regex, etc.
    return true; // Placeholder
  }

  private calculateBaseScore(record: any, query: ParsedQuery): number {
    // Calculate relevance score based on:
    // - Exact matches
    // - Fuzzy matches
    // - Field weights
    // - Recency
    // - User preferences
    return 0.5; // Placeholder
  }

  private applyFilters(results: RawSearchResult[], filters: SearchFilter[]): RawSearchResult[] {
    return results.filter(result => {
      return filters.every(filter => {
        if (!filter.enabled) return true;

        const fieldValue = this.getFieldValue(result, filter.field);
        return this.evaluateFilter(fieldValue, filter);
      });
    });
  }

  private getFieldValue(result: RawSearchResult, field: string): any {
    // Navigate to field value in result object
    return field.split('.').reduce((obj, key) => obj?.[key], result);
  }

  private evaluateFilter(value: any, filter: SearchFilter): boolean {
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'contains':
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      case 'greater-than':
        return Number(value) > Number(filter.value);
      case 'less-than':
        return Number(value) < Number(filter.value);
      case 'between':
        const [min, max] = filter.value;
        return Number(value) >= min && Number(value) <= max;
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      default:
        return true;
    }
  }

  private async generateFacets(results: RawSearchResult[], searchParams: SearchParams): Promise<FacetResult[]> {
    const facets: FacetResult[] = [];

    // Generate facets for common fields
    const facetFields = ['type', 'category', 'severity', 'tags'];

    for (const field of facetFields) {
      const facetValues = new Map<string | number, number>();

      results.forEach(result => {
        const value = this.getFieldValue(result, field);
        if (Array.isArray(value)) {
          value.forEach(v => {
            facetValues.set(v, (facetValues.get(v) || 0) + 1);
          });
        } else if (value !== undefined && value !== null) {
          facetValues.set(value, (facetValues.get(value) || 0) + 1);
        }
      });

      if (facetValues.size > 0) {
        facets.push({
          field,
          type: 'terms',
          values: Array.from(facetValues.entries()).map(([value, count]) => ({
            value,
            count,
            selected: searchParams.filters.some(f => f.field === field && f.value.includes(value))
          })),
          totalCount: results.length
        });
      }
    }

    return facets;
  }

  private highlightMatches(results: SearchResult[], query: ParsedQuery): SearchResult[] {
    return results.map(result => ({
      ...result,
      highlights: this.generateHighlights(result, query)
    }));
  }

  private generateHighlights(result: SearchResult, query: ParsedQuery): Highlight[] {
    const highlights: Highlight[] = [];
    const content = result.content.toLowerCase();
    const searchTerms = query.terms.map(t => t.toLowerCase());

    searchTerms.forEach(term => {
      let index = content.indexOf(term);
      while (index !== -1) {
        highlights.push({
          field: 'content',
          text: result.content.substr(index, term.length),
          start: index,
          end: index + term.length,
          type: 'exact'
        });
        index = content.indexOf(term, index + 1);
      }
    });

    return highlights;
  }

  private async enrichWithRelatedItems(results: SearchResult[]): Promise<SearchResult[]> {
    // Find related items based on correlations, similar content, etc.
    return results.map(result => ({
      ...result,
      relatedItems: [] // Implement related item logic
    }));
  }

  private async generateSuggestions(query: string): Promise<SearchSuggestion[]> {
    // Generate query suggestions based on:
    // - Common queries
    // - Spelling corrections
    // - Related terms
    // - Popular searches
    return [];
  }
}
```

## Implementation Checklist

### Search Engine Core
- [ ] Full-text search with fuzzy matching
- [ ] Boolean query support (AND, OR, NOT)
- [ ] Relevance ranking and scoring
- [ ] Real-time search with debouncing
- [ ] Search result highlighting
- [ ] Multi-field search capabilities

### Filtering System
- [ ] Advanced filter builder interface
- [ ] Faceted search navigation
- [ ] Date range filtering
- [ ] Numeric range filtering
- [ ] Multi-select filtering
- [ ] Saved filter combinations

### Search Interface
- [ ] Auto-complete and suggestions
- [ ] Search history and recent queries
- [ ] Saved searches management
- [ ] Search result pagination
- [ ] Export search results
- [ ] Search analytics and insights

### Index Management
- [ ] Automatic index building and updates
- [ ] Incremental indexing for new data
- [ ] Index optimization and maintenance
- [ ] Index backup and recovery
- [ ] Multi-language support
- [ ] Custom field indexing

### Performance Optimization
- [ ] Search result caching
- [ ] Index sharding and partitioning
- [ ] Background indexing jobs
- [ ] Memory-efficient search algorithms
- [ ] Query optimization and planning
- [ ] Result set limiting and sampling

### Advanced Features
- [ ] Semantic search with AI assistance
- [ ] Voice search capabilities
- [ ] Image search for photo entries
- [ ] Location-based search
- [ ] Temporal search patterns
- [ ] Cross-user anonymized search

---

## Related Documents

- [Data Storage Architecture](../16-data-storage.md) - Search index storage
- [Data Analysis](../13-data-analysis.md) - Search-driven analytics
- [Calendar/Timeline](../10-calendar-timeline.md) - Search integration
- [Settings](../15-settings.md) - Search preferences
- [Privacy & Security](../18-privacy-security.md) - Search data protection

---

*Document Version: 1.0 | Last Updated: October 2025*