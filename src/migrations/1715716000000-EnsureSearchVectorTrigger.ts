import { MigrationInterface, QueryRunner } from "typeorm";

export class EnsureSearchVectorTrigger1715716000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First create GIN indexes if they don't exist
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_search_vector ON searchable_content USING GIN(search_vector);
            CREATE INDEX IF NOT EXISTS idx_tags ON searchable_content USING GIN(tags);
        `);

        // Create or replace the function that updates the search_vector
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_search_vector_trigger()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.search_vector = 
                    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
                    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
                    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
                    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
                    setweight(to_tsvector('english', COALESCE(NEW.entity_type, '')), 'D');
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create or replace the trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_search_vector ON searchable_content;
            CREATE TRIGGER update_search_vector
            BEFORE INSERT OR UPDATE ON searchable_content
            FOR EACH ROW
            EXECUTE FUNCTION update_search_vector_trigger();
        `);

        // Update existing records to populate the search_vector
        await queryRunner.query(`
            UPDATE searchable_content
            SET search_vector = 
                setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
                setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
                setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'C') ||
                setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
                setweight(to_tsvector('english', COALESCE(entity_type, '')), 'D')
            WHERE true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the trigger and function
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_search_vector ON searchable_content;
            DROP FUNCTION IF EXISTS update_search_vector_trigger();
        `);

        // Drop the indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_search_vector;
            DROP INDEX IF EXISTS idx_tags;
        `);
    }
} 