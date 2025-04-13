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

## Important Notes

- The seeders will only populate the database if it's empty (count = 0)
- Running the seeders will not duplicate data if records already exist
- The large data seeder inserts records in batches of 50 to avoid memory issues
- Each entity has appropriate relationships and JSONB attributes
- The seeders maintain realistic distributions of data and relationships

## Use Cases

- **Standard Seeder**: Quick setup for development and basic testing
- **Large Data Seeder**: Performance testing, pagination testing, and more realistic search scenarios

## Generated Data

The large data seeder generates:

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