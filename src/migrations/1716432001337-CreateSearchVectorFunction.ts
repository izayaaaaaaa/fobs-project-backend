import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSearchVectorFunction1716432001337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a helper function for safely converting arrays to strings
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION safe_array_to_string(arr text[], sep text) RETURNS text AS $$
      BEGIN
        RETURN CASE WHEN arr IS NULL THEN '' ELSE array_to_string(arr, sep) END;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create the function to generate the tsvector
    await queryRunner.query(`
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
    `);

    // Create the trigger on the searchable_content table
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS search_vector_update_trigger ON searchable_content;
      CREATE TRIGGER search_vector_update_trigger
      BEFORE INSERT OR UPDATE ON searchable_content
      FOR EACH ROW EXECUTE FUNCTION search_vector_update();
    `);

    // Create GIN index for the search_vector
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_search_vector ON searchable_content USING GIN(search_vector);
    `);

    // Create GIN index for the tags array
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tags ON searchable_content USING GIN(tags);
    `);

    // Update existing data
    await queryRunner.query(`
      UPDATE searchable_content
      SET last_updated_date = NOW()
      WHERE search_vector IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS search_vector_update_trigger ON searchable_content;
    `);

    // Drop the functions
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS search_vector_update();
      DROP FUNCTION IF EXISTS safe_array_to_string();
    `);

    // Drop the indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_search_vector;
      DROP INDEX IF EXISTS idx_tags;
    `);
  }
} 