import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSearchVectorFunction1716432001337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the function to generate the tsvector
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
          setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, ARRAY[]::text[]), ' ')), 'C');
        
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;
    `);

    // Create the trigger on the searchable_content table
    await queryRunner.query(`
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS search_vector_update_trigger ON searchable_content;
    `);

    // Drop the function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS search_vector_update();
    `);

    // Drop the indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_search_vector;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_tags;
    `);
  }
} 