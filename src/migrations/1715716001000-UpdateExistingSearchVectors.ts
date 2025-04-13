import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateExistingSearchVectors1715716001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure the array_to_string function is available
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION safe_array_to_string(arr text[], sep text)
            RETURNS text AS $$
            BEGIN
                IF arr IS NULL THEN
                    RETURN NULL;
                ELSE
                    RETURN array_to_string(arr, sep);
                END IF;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Update all existing records
        await queryRunner.query(`
            UPDATE searchable_content
            SET search_vector = 
                setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
                setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
                setweight(to_tsvector('english', COALESCE(safe_array_to_string(tags, ' '), '')), 'C') ||
                setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
                setweight(to_tsvector('english', COALESCE(entity_type, '')), 'D')
        `);

        // Let's also update any JSONB attributes field that might contain searchable content
        await queryRunner.query(`
            UPDATE searchable_content
            SET search_vector = search_vector || 
                setweight(
                    to_tsvector('english', 
                        COALESCE(
                            CASE 
                                WHEN attributes IS NOT NULL AND attributes::text != 'null' THEN
                                    COALESCE(attributes->>'author', '') || ' ' || 
                                    COALESCE(attributes->>'brand', '') || ' ' ||
                                    COALESCE(attributes->>'reading_time', '') || ' ' ||
                                    COALESCE(attributes->>'technical_level', '') || ' ' ||
                                    COALESCE(attributes->>'color', '') || ' ' ||
                                    COALESCE(attributes->>'material', '') || ' ' ||
                                    COALESCE(attributes->>'duration', '') || ' ' ||
                                    COALESCE(attributes->>'service_area', '') || ' ' ||
                                    COALESCE(attributes->>'delivery_method', '') || ' ' ||
                                    COALESCE(attributes->>'pricing_model', '')
                                ELSE ''
                            END,
                            ''
                        )
                    ),
                    'D'
                )
            WHERE attributes IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the function we created
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS safe_array_to_string;
        `);

        // There's no way to "undo" the search_vector updates specifically
        // but we can trigger them to be regenerated using the trigger
        await queryRunner.query(`
            UPDATE searchable_content
            SET last_updated_date = NOW()
        `);
    }
} 