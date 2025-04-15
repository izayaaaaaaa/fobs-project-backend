# Full-Text Search Implementation with PostgreSQL

## Overview

This document describes the implementation of a flexible search functionality using PostgreSQL's full-text search capabilities. The system utilizes `tsvector` and `tsquery` to enable efficient, relevant, and customizable searching across multiple content types in a single, unified searchable table.

## Database Schema

### Main Table: `searchable_content`

```sql
CREATE TABLE "searchable_content" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "entity_type" character varying(50) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" text,
    "category" character varying(100),
    "tags" text[],
    "price" numeric(10,2),
    "published_date" TIMESTAMP WITH TIME ZONE,
    "last_updated_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "url" character varying(2048),
    "attributes" jsonb,
    "search_vector" tsvector,
    CONSTRAINT "PK_searchable_content" PRIMARY KEY ("id")
)
```

### Indexes

The following indexes enhance query performance:

```sql
-- Normal B-tree indexes for direct field access
CREATE INDEX "idx_entity_type" ON "searchable_content" ("entity_type");
CREATE INDEX "idx_category" ON "searchable_content" ("category");
CREATE INDEX "idx_price" ON "searchable_content" ("price");
CREATE INDEX "idx_published_date" ON "searchable_content" ("published_date");

-- GIN indexes for complex data types
CREATE INDEX "idx_search_vector" ON "searchable_content" USING GIN(search_vector);
CREATE INDEX "idx_tags" ON "searchable_content" USING GIN(tags);
```

## Full-Text Search Implementation

### 1. PostgreSQL tsvector Generation

The system automatically generates and maintains a `tsvector` representation for each record in the `searchable_content` table. The `tsvector` combines multiple fields from the record with different weightings to prioritize matches in more important fields.

#### Helper Function for Array Handling

```sql
CREATE OR REPLACE FUNCTION safe_array_to_string(arr text[], sep text) RETURNS text AS $$
BEGIN
  RETURN CASE WHEN arr IS NULL THEN '' ELSE array_to_string(arr, sep) END;
END;
$$ LANGUAGE plpgsql;
```

#### tsvector Generation Function

```sql
CREATE OR REPLACE FUNCTION search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', safe_array_to_string(NEW.tags, ' ')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.entity_type, '')), 'D');
    
  -- Add JSONB attributes to search vector if they exist
  IF NEW.attributes IS NOT NULL AND NEW.attributes::text != 'null' THEN
    NEW.search_vector := NEW.search_vector || 
      setweight(
        to_tsvector('english',
          COALESCE(NEW.attributes->>'author', '') || ' ' ||
          COALESCE(NEW.attributes->>'brand', '') || ' ' ||
          COALESCE(NEW.attributes->>'technical_level', '') || ' ' ||
          COALESCE(NEW.attributes->>'color', '') || ' ' ||
          COALESCE(NEW.attributes->>'material', '') || ' ' ||
          COALESCE(NEW.attributes->>'service_area', '') || ' ' ||
          COALESCE(NEW.attributes->>'pricing_model', '')
        ),
        'D'
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Database Trigger

A trigger automatically updates the search vector whenever a record is created or updated:

```sql
CREATE TRIGGER search_vector_update_trigger
BEFORE INSERT OR UPDATE ON searchable_content
FOR EACH ROW EXECUTE FUNCTION search_vector_update();
```

### 2. Search Query Processing

The backend converts user search queries into PostgreSQL's `tsquery` format to match against the stored `tsvector` values.

#### Query Formatting

```typescript
private formatSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()  // Convert to lowercase for case-insensitive search
    .replace(/\s+/g, ' ')  // normalize whitespace
    .split(' ')
    .filter(term => term.length > 0)
    .map(term => term + ':*')  // Add prefix matching
    .join(' | ');  // Use OR operator for more flexible matching
}
```

#### Relevance Ranking

Results are ranked by relevance using PostgreSQL's `ts_rank_cd` function:

```sql
ts_rank_cd(content.search_vector, to_tsquery('english', :searchQuery))
```

This provides a relevance score based on:
- Word frequency
- Word proximity
- Field weights (A=1.0, B=0.4, C=0.2, D=0.1)

## API Endpoints

### Search Endpoint

```
GET /api/v1/search
```

#### Query Parameters

| Parameter  | Type   | Required | Description |
|------------|--------|----------|-------------|
| q          | string | Yes      | Search query string |
| type       | string | No       | Filter by entity type (comma-separated) |
| category   | string | No       | Filter by category (comma-separated) |
| tags       | string | No       | Filter by tags (comma-separated, AND logic) |
| price_min  | number | No       | Minimum price filter |
| price_max  | number | No       | Maximum price filter |
| date_from  | string | No       | Start date (ISO 8601) |
| date_to    | string | No       | End date (ISO 8601) |
| sort       | string | No       | Sort field with optional - prefix for desc |
| limit      | number | No       | Results per page (default 20, max 100) |
| offset     | number | No       | Number of results to skip |
| after_id   | string | No       | Cursor ID for cursor-based pagination |

#### Response Format

```json
{
  "metadata": {
    "query": "search term",
    "total_results": 42,
    "limit": 20,
    "offset": 0,
    "next_cursor": "uuid-of-last-item"
  },
  "results": [
    {
      "id": "uuid-1",
      "entity_type": "article",
      "name": "Article Title",
      "description": "Article description...",
      "category": "Technology",
      "tags": ["tech", "search"],
      "published_date": "2023-06-15T10:00:00Z",
      "url": "/articles/article-title",
      "relevance_score": 0.95
    },
    // Additional results...
  ]
}
```

### Create Content Endpoint

```
POST /api/v1/search
```

#### Request Body

```json
{
  "entity_type": "product",
  "name": "Ergonomic Office Chair",
  "description": "Premium ergonomic office chair with lumbar support...",
  "category": "Office Furniture",
  "tags": ["ergonomic", "office", "chair"],
  "price": 299.99,
  "published_date": "2023-06-15T10:00:00Z",
  "url": "/products/ergonomic-office-chair",
  "attributes": {
    "brand": "ErgoComfort",
    "color": "Black",
    "material": "Mesh",
    "dimensions": {
      "width": 60,
      "height": 120,
      "depth": 65
    },
    "weight_capacity": "300lbs"
  }
}
```

## Advantages of the Design

1. **Unified Search**: A single table handles multiple content types, enabling cross-entity searches.

2. **Flexible Schema**: The JSONB `attributes` field allows entity-specific data without schema changes.

3. **Weighted Relevance**: Fields have different weights (A-D), prioritizing matches in important fields.

4. **High Performance**: GIN indexes on `tsvector` and `tags` ensure fast searches even with large datasets.

5. **Automatic Maintenance**: Triggers automatically update search vectors on record changes.

6. **Customizable Filters**: Multiple filter options enable precise search refinement.

7. **Prefix Matching**: The `:*` operator supports partial word matches for better usability.

## Implementation Details

1. **Weighting Strategy**:
   - A (1.0): Name/title (highest priority)
   - B (0.4): Full description 
   - C (0.2): Category and tags
   - D (0.1): Entity type and attributes (lowest priority)

2. **Lexemes Processing**: PostgreSQL automatically handles:
   - Word stemming (e.g., "running" → "run")
   - Stop word removal (common words like "the", "and", etc.)
   - Case normalization

3. **Query Processing**: The system converts space-separated terms into OR-connected prefix-matching terms.

4. **Advanced Features**:
   - Both offset-based and cursor-based pagination
   - Multiple sort options
   - Combined text search with relational filtering 