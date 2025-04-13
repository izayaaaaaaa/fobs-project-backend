### TODO
- learn how to setup database etc and test current setup; implement UT
- learn and implement indexing; implement UT / test
- learn and implement caching; implement UT / test

# Live Search API

A NestJS-based REST API for powerful, scalable search functionality across different content types, backed by PostgreSQL full-text search capabilities.

## Features

- Full-text search using PostgreSQL's tsvector and tsquery
- Powerful filtering by entity type, category, tags, price range, and date range
- Sorting by relevance, name, price, and published date
- Support for both offset-based and cursor-based pagination
- Fully documented API with Swagger

## Database Schema

The search functionality is built on a single, flexible table that can store and search across multiple content types:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | UUID | Primary Key |
| entity_type | VARCHAR(50) | Content type (e.g., 'product', 'article', 'service') |
| name | VARCHAR(255) | Name/title of the content |
| description | TEXT | Detailed description |
| category | VARCHAR(100) | Primary category |
| tags | TEXT[] | Array of tags for filtering |
| price | NUMERIC(10, 2) | Price value (for product-type entities) |
| published_date | TIMESTAMP WITH TIME ZONE | Publication date |
| last_updated_date | TIMESTAMP WITH TIME ZONE | Auto-updated modification date |
| url | VARCHAR(2048) | URL to the canonical content page |
| attributes | JSONB | Flexible type-specific attributes |
| search_vector | TSVECTOR | Generated from name, description, tags for full-text search |

## Data Types and Fields

The search functionality supports multiple types of content with a unified schema approach:

### Common Fields for All Content Types
- `id`: Unique identifier (UUID)
- `entity_type`: Discriminator field indicating content type ('product', 'article', 'service')
- `name`: Primary title/name of the content
- `description`: Detailed description
- `category`: Broader classification for filtering
- `tags`: Array of keywords for categorization and filtering
- `published_date`: Publication date (for sorting/filtering)
- `last_updated_date`: Auto-updated modification timestamp
- `url`: Link to the canonical content page
- `attributes`: JSONB field for type-specific flexible attributes

### Product-Specific Fields
These fields are typically stored in the `attributes` JSONB for products:
- `brand`: Product manufacturer/brand
- `color`, `material`, and other physical attributes
- `dimensions`: Size specifications
- `price`: Numeric price value (also available in main schema for sorting/filtering)

### Article-Specific Fields
Article metadata stored in the `attributes` JSONB:
- `author`: Article writer
- `reading_time`: Estimated time to read
- `technical_level`: Difficulty/expertise level
- `featured`: Boolean flag for featured articles

### Service-Specific Fields
Service details stored in the `attributes` JSONB:
- `duration`: Time required for service delivery
- `service_area`: Geographic availability
- `pricing_model`: Fixed-price, hourly, subscription, etc.
- `deliverables`: What the service includes

## Sample Data

The application includes a seeder to populate the database with sample content across all supported types. To seed the database:

1. Ensure your database is configured and running
2. Run migrations to create the table structure:
   ```bash
   npm run typeorm:migration:run
   ```
3. Run the seeder:
   ```bash
   npm run seed
   ```

This will add sample products, articles, and services to demonstrate the search capabilities.

## API Endpoints

### GET /api/v1/search

Search across all content with filtering, sorting, and pagination.

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| q | string | Yes | The search query string | q=landing%20page%20design |
| type | string | No | Filter by entity type (comma-separated) | type=article,service |
| category | string | No | Filter by category (comma-separated) | category=Technology |
| tags | string | No | Filter by tags (comma-separated, AND logic) | tags=api,search |
| price_min | number | No | Minimum price filter | price_min=50 |
| price_max | number | No | Maximum price filter | price_max=200 |
| date_from | string | No | Min published date (YYYY-MM-DD) | date_from=2023-01-01 |
| date_to | string | No | Max published date (YYYY-MM-DD) | date_to=2023-12-31 |
| sort | string | No | Sort field with optional - prefix for descending | sort=-published_date |
| limit | integer | No | Results per page (default: 20, max: 100) | limit=10 |
| offset | integer | No | Results to skip (offset pagination) | offset=20 |
| after_id | string | No | Last item ID (cursor pagination) | after_id=uuid-string-here |

#### Response Structure

```json
{
  "metadata": {
    "query": "landing page design",
    "total_results": 123,
    "limit": 10,
    "offset": 20,
    "next_cursor": "next-uuid-string-here"
  },
  "results": [
    {
      "id": "a1b2c3d4-...",
      "entity_type": "article",
      "name": "Effective Landing Page Design Principles",
      "description": "A deep dive into creating high-converting landing pages...",
      "category": "Design",
      "tags": ["ui", "ux", "conversion"],
      "published_date": "2023-11-15T10:00:00Z",
      "url": "/articles/effective-landing-page-design",
      "relevance_score": 0.85
    },
    // ... more results
  ]
}
```

## Setup & Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials and other settings.

4. **Set up the PostgreSQL database**

   Make sure you have PostgreSQL installed and running. Create a database:
   ```bash
   createdb search_db
   ```

5. **Run database migrations**

   ```bash
   npm run typeorm:migration:run
   ```

6. **Seed the database with sample data**

   ```bash
   npm run seed
   ```

7. **Start the application**

   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

8. **View API documentation**

   Once the application is running, open your browser and navigate to:
   ```
   http://localhost:3000/api
   ```

## Deployment

For production deployment, ensure:

1. `DB_SYNCHRONIZE` is set to `false` in your production environment
2. `DB_MIGRATIONS_RUN` is set to `true` to automatically apply migrations
3. All sensitive information is properly secured in environment variables

## Performance Considerations

- The search implementation uses PostgreSQL's GIN indexes for both full-text search and array operations
- Cursor-based pagination is recommended for better performance with large result sets
- For high-traffic applications, consider adding a caching layer for frequent searches

## Troubleshooting

### TypeORM Migrations

If you encounter issues with migrations, ensure that:

1. **Database connection** is properly configured in the `.env` file
2. **Data source configuration** is set up correctly in `src/database/data-source.ts`
3. **Migration files** are properly created in the `src/migrations` directory

To manually run a migration:

```bash
npm run typeorm:migration:run
```

To generate a new migration based on entity changes:

```bash
npm run typeorm:migration:generate YourMigrationName
```

To create an empty migration file:

```bash
npm run typeorm:migration:create YourMigrationName
```

### Database Setup

If you're new to PostgreSQL:

1. Install PostgreSQL on your machine
2. Create a database for the application:
   ```bash
   createdb search_db
   ```
3. Configure the connection details in your `.env` file
4. Create a test record:
   ```sql
   INSERT INTO searchable_content 
   (entity_type, name, description, category) 
   VALUES 
   ('product', 'Test Product', 'Test description', 'Test Category');
   ```
