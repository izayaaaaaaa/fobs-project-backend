# Database Migrations

This directory contains database migrations for the search application.

## Running Migrations

To run all migrations:

```bash
npm run typeorm:migration:run
```

## Recent Migrations

### EnsureSearchVectorTrigger

This migration:
1. Creates GIN indexes for the search_vector and tags columns
2. Creates a trigger function to update the search_vector whenever records are inserted or updated
3. Sets up weights for different columns:
   - Name (A) - Highest priority
   - Description (B) - High priority
   - Tags and Category (C) - Medium priority
   - Entity type (D) - Lower priority

### UpdateExistingSearchVectors

This migration:
1. Updates all existing search vectors in the database
2. Adds JSONB attribute fields to the search vectors
3. Creates a safe_array_to_string function to handle NULL arrays

## Creating New Migrations

To generate a new migration based on entity changes:

```bash
npm run typeorm:migration:generate YourMigrationName
```

To create an empty migration file:

```bash
npm run typeorm:migration:create YourMigrationName
``` 