import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateExistingSearchVectors1716432002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, check if the function exists
    const functionCheck = await queryRunner.query(`
      SELECT 1 FROM pg_proc WHERE proname = 'search_vector_update';
    `);

    // If function doesn't exist, create temporary versions for this migration
    if (!functionCheck || functionCheck.length === 0) {
      await queryRunner.query(`
        CREATE OR REPLACE FUNCTION safe_array_to_string(arr text[], sep text) RETURNS text AS $$
        BEGIN
          RETURN CASE WHEN arr IS NULL THEN '' ELSE array_to_string(arr, sep) END;
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE FUNCTION search_vector_update() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector :=
            setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
            setweight(to_tsvector('english', safe_array_to_string(NEW.tags, ' ')), 'C') ||
            setweight(to_tsvector('english', COALESCE(NEW.entity_type, '')), 'D');
          
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
    }

    // Directly update all records with the search vector
    await queryRunner.query(`
      UPDATE searchable_content
      SET search_vector = 
        setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
        setweight(to_tsvector('english', 
          CASE WHEN tags IS NULL THEN '' ELSE array_to_string(tags, ' ') END
        ), 'C') ||
        setweight(to_tsvector('english', COALESCE(entity_type, '')), 'D')
    `);

    // Update with JSONB attributes
    await queryRunner.query(`
      UPDATE searchable_content
      SET search_vector = search_vector || 
        setweight(
          to_tsvector('english', 
            COALESCE((attributes->>'author'), '') || ' ' ||
            COALESCE((attributes->>'brand'), '') || ' ' ||
            COALESCE((attributes->>'technical_level'), '') || ' ' ||
            COALESCE((attributes->>'color'), '') || ' ' ||
            COALESCE((attributes->>'material'), '') || ' ' ||
            COALESCE((attributes->>'service_area'), '') || ' ' ||
            COALESCE((attributes->>'pricing_model'), '')
          ),
          'D'
        )
      WHERE attributes IS NOT NULL AND attributes::text != 'null'
    `);

    // Verify if any records still have NULL search_vector
    const nullCheck = await queryRunner.query(`
      SELECT COUNT(*) FROM searchable_content WHERE search_vector IS NULL
    `);

    // If there are still records with NULL search_vector, log it
    if (nullCheck && nullCheck[0] && nullCheck[0].count > 0) {
      console.log(`Warning: ${nullCheck[0].count} records still have NULL search_vector after migration`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Nothing to do for down migration - we can't un-update the search vectors
    // and we want to keep them in sync
  }
} 