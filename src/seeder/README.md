# Data Seeders

This directory contains seeders for populating the database with sample data.

## Available Seeders

### 1. Standard Seeder (9 records)

The standard seeder creates a small set of sample data with 9 records (3 products, 3 articles, and 3 services).

To run the standard seeder:

```bash
npm run seed
```

### 2. Large Data Seeder (1000 records)

The large data seeder creates a comprehensive set of 1000 records with realistic data across different entity types:

- 500 products (50%)
- 300 articles (30%)
- 200 services (20%)

These records include:
- Varied names, descriptions, and categories
- Randomized tags for better filtering tests
- Diverse prices and date ranges
- Realistic attributes specific to each entity type

To run the large data seeder:

```bash
npm run seed:large
```

### 3. Bulk Data Seeder (300,000+ records)

The bulk data seeder is designed for creating very large datasets for performance testing and benchmarking. It creates hundreds of thousands of records with realistic data distribution.

- Default is 300,000 records (configurable)
- Optimized memory usage with batched inserts
- Progress reporting and estimated time remaining
- Transaction support for better error handling
- **Automatic search vector updates** for full-text search

To run the bulk data seeder with default settings:

```bash
npm run seed:bulk
```

To specify a custom number of records:

```bash
npm run seed:bulk -- --count=1000000
```

Performance tips:
- Increase Node.js memory if needed (automatically set to 8GB)
- For very large datasets (millions), consider running in chunks
- Database indexes should be created after seeding for better performance

## Search Vector Updates

The Bulk Data Seeder includes a special post-processing step to update all search vectors after data insertion. This is necessary because:

1. Bulk insert operations bypass PostgreSQL triggers that normally populate search vectors
2. Search vectors are essential for text search functionality to work properly
3. Search vectors combine data from multiple columns with appropriate weights:
   - Name (weight A) - Highest priority
   - Description (weight B) - High priority
   - Category & Tags (weight C) - Medium priority
   - Entity type & Attributes (weight D) - Lower priority

The search vector update process:
- Processes records in batches to manage memory usage
- Reports progress as it updates vectors
- Verifies all vectors are properly populated when complete

## Important Notes

- The seeders will only populate the database if it's empty (count = 0)
- Running the seeders will not duplicate data if records already exist
- The large data seeder inserts records in batches of 50 to avoid memory issues
- The bulk data seeder inserts records in larger batches (1000) with transaction support
- Each entity has appropriate relationships and JSONB attributes
- The seeders maintain realistic distributions of data and relationships

## Use Cases

- **Standard Seeder**: Quick setup for development and basic testing
- **Large Data Seeder**: Performance testing, pagination testing, and more realistic search scenarios
- **Bulk Data Seeder**: Production-like load testing, performance benchmarking, and stress testing

## Generated Data

The large and bulk data seeders generate:

1. **Products** with:
   - Brand, color, material information
   - Dimensions and weight data
   - Stock status and ratings

2. **Articles** with:
   - Author information
   - Reading time
   - Technical level
   - Featured status
   - Related topics

3. **Services** with:
   - Duration and service area
   - Delivery method
   - Pricing model
   - Deliverables 