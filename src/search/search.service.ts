import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SearchableContent } from './entities/searchable-content.entity';
import { SearchQueryDto, SortField } from './dto/search-query.dto';
import { SearchResponseDto, SearchResultItemDto, SearchMetadataDto } from './dto/search-response.dto';
import { CreateSearchableContentDto } from './dto/create-searchable-content.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(SearchableContent)
    private searchableContentRepository: Repository<SearchableContent>,
  ) {}

  async create(createDto: CreateSearchableContentDto): Promise<SearchableContent> {
    // Convert date string to Date object if present
    let entityToCreate: any = { ...createDto };
    
    if (createDto.published_date) {
      entityToCreate.published_date = new Date(createDto.published_date);
    }
    
    const newEntity = this.searchableContentRepository.create(entityToCreate);
    const result = await this.searchableContentRepository.save(newEntity);
    
    // Handle both cases: TypeORM sometimes returns an array, sometimes a single entity
    if (Array.isArray(result)) {
      return result[0];
    }
    
    return result;
  }

  async search(queryDto: SearchQueryDto): Promise<SearchResponseDto> {
    // Create base query builder
    let queryBuilder = this.searchableContentRepository.createQueryBuilder('content');

    // Apply the full-text search if query is provided
    if (queryDto.q) {
      // Convert the search query to a tsquery compatible format
      const searchQuery = this.formatSearchQuery(queryDto.q);
      queryBuilder = queryBuilder
        .addSelect(`ts_rank_cd(content.search_vector, to_tsquery('english', :searchQuery))`, 'relevance_score')
        .where(`content.search_vector @@ to_tsquery('english', :searchQuery)`, { 
          searchQuery 
        });
    }

    // Apply filters
    queryBuilder = this.applyFilters(queryBuilder, queryDto);

    // Get the total count for metadata
    const totalResults = await queryBuilder.getCount();

    // Apply sorting
    queryBuilder = this.applySorting(queryBuilder, queryDto);

    // Apply pagination (support both offset-based and cursor-based)
    queryBuilder = this.applyPagination(queryBuilder, queryDto);

    // Execute query and get results
    const rawResults = await queryBuilder.getRawAndEntities();
    
    // Map entities to DTOs and combine with relevance scores if available
    const results = rawResults.entities.map((entity, index) => {
      const relevanceScore = rawResults.raw[index]?.relevance_score;
      return SearchResultItemDto.fromEntity(
        entity, 
        relevanceScore ? parseFloat(relevanceScore) : undefined
      );
    });

    // Determine the next cursor for cursor-based pagination
    let nextCursor: string | undefined;
    const limit = queryDto.limit || 20;
    if (results.length >= limit) {
      nextCursor = results[results.length - 1].id;
    }

    // Create the response DTO
    const response = new SearchResponseDto();
    response.metadata = {
      query: queryDto.q,
      total_results: totalResults,
      limit: limit,
      offset: queryDto.offset,
      next_cursor: nextCursor,
    };
    response.results = results;

    return response;
  }

  // Format user query string to PostgreSQL tsquery format
  private formatSearchQuery(query: string): string {
    return query
      .trim()
      .replace(/\s+/g, ' ')  // normalize whitespace
      .split(' ')
      .filter(term => term.length > 0)
      .map(term => term + ':*')  // Add prefix matching
      .join(' & ');  // AND operator
  }

  // Apply all filters to the query builder
  private applyFilters(
    queryBuilder: SelectQueryBuilder<SearchableContent>,
    queryDto: SearchQueryDto,
  ): SelectQueryBuilder<SearchableContent> {
    // Filter by entity type
    if (queryDto.type) {
      const types = queryDto.type.split(',').map(t => t.trim());
      queryBuilder = queryBuilder.andWhere('content.entity_type IN (:...types)', { types });
    }

    // Filter by category
    if (queryDto.category) {
      const categories = queryDto.category.split(',').map(c => c.trim());
      queryBuilder = queryBuilder.andWhere('content.category IN (:...categories)', { categories });
    }

    // Filter by tags (AND logic - must have all specified tags)
    if (queryDto.tags) {
      const tags = queryDto.tags.split(',').map(t => t.trim());
      // Use array_overlap for OR logic, or @> for AND logic (contains all)
      queryBuilder = queryBuilder.andWhere('content.tags @> ARRAY[:...tags]', { tags });
    }

    // Filter by price range
    if (queryDto.price_min !== undefined) {
      queryBuilder = queryBuilder.andWhere('content.price >= :priceMin', { priceMin: queryDto.price_min });
    }
    if (queryDto.price_max !== undefined) {
      queryBuilder = queryBuilder.andWhere('content.price <= :priceMax', { priceMax: queryDto.price_max });
    }

    // Filter by date range
    if (queryDto.date_from) {
      queryBuilder = queryBuilder.andWhere('content.published_date >= :dateFrom', { 
        dateFrom: new Date(queryDto.date_from) 
      });
    }
    if (queryDto.date_to) {
      // Add one day to include the entire end date
      const dateTo = new Date(queryDto.date_to);
      dateTo.setDate(dateTo.getDate() + 1);
      queryBuilder = queryBuilder.andWhere('content.published_date < :dateTo', { dateTo });
    }

    return queryBuilder;
  }

  // Apply sorting to the query builder
  private applySorting(
    queryBuilder: SelectQueryBuilder<SearchableContent>,
    queryDto: SearchQueryDto,
  ): SelectQueryBuilder<SearchableContent> {
    let sortField = queryDto.sort || 'relevance';
    let direction: 'ASC' | 'DESC' = 'ASC';

    // Check if the sort field starts with a minus (for descending order)
    if (sortField.startsWith('-')) {
      direction = 'DESC';
      sortField = sortField.substring(1);
    }

    // Apply sort based on field
    switch (sortField) {
      case SortField.NAME:
        queryBuilder = queryBuilder.orderBy('content.name', direction);
        break;
      case SortField.PRICE:
        queryBuilder = queryBuilder.orderBy('content.price', direction);
        break;
      case SortField.PUBLISHED_DATE:
        queryBuilder = queryBuilder.orderBy('content.published_date', direction);
        break;
      case SortField.RELEVANCE:
        // Default to relevance for search queries
        if (queryDto.q) {
          queryBuilder = queryBuilder.orderBy('relevance_score', direction);
        } else {
          // If no search query, default to date
          queryBuilder = queryBuilder.orderBy('content.published_date', 'DESC');
        }
        break;
      default:
        // Default to relevance for search queries
        if (queryDto.q) {
          queryBuilder = queryBuilder.orderBy('relevance_score', 'DESC');
        } else {
          // If no search query, default to date
          queryBuilder = queryBuilder.orderBy('content.published_date', 'DESC');
        }
    }

    // Always add id as secondary sort for deterministic pagination
    queryBuilder = queryBuilder.addOrderBy('content.id', direction);

    return queryBuilder;
  }

  // Apply pagination to the query builder
  private applyPagination(
    queryBuilder: SelectQueryBuilder<SearchableContent>,
    queryDto: SearchQueryDto,
  ): SelectQueryBuilder<SearchableContent> {
    const limit = queryDto.limit || 20;

    // Cursor-based pagination (preferred)
    if (queryDto.after_id) {
      // We need to know the sort field and direction to create the proper cursor query
      let sortField = queryDto.sort || 'relevance';
      let isDesc = false;

      if (sortField.startsWith('-')) {
        isDesc = true;
        sortField = sortField.substring(1);
      }

      // Get the cursor item to determine where to start
      // For simplicity, we'll use a subquery to get the reference values 
      // of the cursor item. In a production system, you would likely want to 
      // optimize this further.
      const whereClause = this.getCursorWhereClause(sortField, isDesc);
      if (whereClause) {
        queryBuilder = queryBuilder.andWhere(whereClause, { after_id: queryDto.after_id });
      }
    } 
    // Offset-based pagination (fallback)
    else if (queryDto.offset !== undefined) {
      queryBuilder = queryBuilder.offset(queryDto.offset);
    }

    // Apply limit
    queryBuilder = queryBuilder.limit(limit);

    return queryBuilder;
  }

  // Helper to get the where clause for cursor-based pagination
  private getCursorWhereClause(sortField: string, isDesc: boolean): string | null {
    // The logic depends on the sort field and direction
    switch (sortField) {
      case SortField.NAME:
        return isDesc 
          ? `(content.name < (SELECT name FROM searchable_content WHERE id = :after_id)) OR 
              (content.name = (SELECT name FROM searchable_content WHERE id = :after_id) AND 
               content.id < :after_id)`
          : `(content.name > (SELECT name FROM searchable_content WHERE id = :after_id)) OR 
              (content.name = (SELECT name FROM searchable_content WHERE id = :after_id) AND 
               content.id > :after_id)`;
      
      case SortField.PRICE:
        return isDesc 
          ? `(content.price < (SELECT price FROM searchable_content WHERE id = :after_id)) OR 
              (content.price = (SELECT price FROM searchable_content WHERE id = :after_id) AND 
               content.id < :after_id)`
          : `(content.price > (SELECT price FROM searchable_content WHERE id = :after_id)) OR 
              (content.price = (SELECT price FROM searchable_content WHERE id = :after_id) AND 
               content.id > :after_id)`;
      
      case SortField.PUBLISHED_DATE:
        return isDesc 
          ? `(content.published_date < (SELECT published_date FROM searchable_content WHERE id = :after_id)) OR 
              (content.published_date = (SELECT published_date FROM searchable_content WHERE id = :after_id) AND 
               content.id < :after_id)`
          : `(content.published_date > (SELECT published_date FROM searchable_content WHERE id = :after_id)) OR 
              (content.published_date = (SELECT published_date FROM searchable_content WHERE id = :after_id) AND 
               content.id > :after_id)`;
      
      case SortField.RELEVANCE:
        // For relevance, we can't easily implement cursor pagination in a generic way
        // since it's a calculated value. We'll fall back to just using ID
        return isDesc 
          ? `content.id < :after_id` 
          : `content.id > :after_id`;
      
      default:
        return null;
    }
  }
} 