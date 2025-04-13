import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSearchableContentTable1716432001336 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
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
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_entity_type" ON "searchable_content" ("entity_type")
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_category" ON "searchable_content" ("category")
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_price" ON "searchable_content" ("price")
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_published_date" ON "searchable_content" ("published_date")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_published_date"`);
        await queryRunner.query(`DROP INDEX "idx_price"`);
        await queryRunner.query(`DROP INDEX "idx_category"`);
        await queryRunner.query(`DROP INDEX "idx_entity_type"`);
        await queryRunner.query(`DROP TABLE "searchable_content"`);
    }
} 