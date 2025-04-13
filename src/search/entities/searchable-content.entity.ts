import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('searchable_content')
export class SearchableContent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_entity_type')
  @Column({ type: 'varchar', length: 50, nullable: false })
  entity_type!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index('idx_category')
  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Index('idx_tags', { synchronize: false }) // GIN index will be created manually
  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @Index('idx_price')
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Index('idx_published_date')
  @Column({ type: 'timestamp with time zone', nullable: true })
  published_date?: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  last_updated_date!: Date;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  url?: string;

  @Column({ type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  @Index('idx_search_vector', { synchronize: false }) // GIN index will be created manually
  @Column({
    type: 'tsvector',
    nullable: true,
    select: false, // Don't select by default to save bandwidth
  })
  search_vector?: any; // TypeORM doesn't have a good tsvector type
} 