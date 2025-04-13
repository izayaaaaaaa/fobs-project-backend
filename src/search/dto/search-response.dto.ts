import { ApiProperty } from '@nestjs/swagger';
import { SearchableContent } from '../entities/searchable-content.entity';

export class SearchResultItemDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @ApiProperty({ example: 'article' })
  entity_type!: string;

  @ApiProperty({ example: 'Effective Landing Page Design Principles' })
  name!: string;

  @ApiProperty({ example: 'A deep dive into creating high-converting landing pages...' })
  description?: string;

  @ApiProperty({ example: 'Design' })
  category?: string;

  @ApiProperty({ example: ['ui', 'ux', 'conversion'] })
  tags?: string[];

  @ApiProperty({ example: 79.99, required: false })
  price?: number;

  @ApiProperty({ example: '2023-11-15T10:00:00Z' })
  published_date?: Date;

  @ApiProperty({ example: '/articles/effective-landing-page-design' })
  url?: string;

  @ApiProperty({ example: 0.85, required: false })
  relevance_score?: number;

  constructor(partial: Partial<SearchResultItemDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: SearchableContent, relevance_score?: number): SearchResultItemDto {
    const dto = new SearchResultItemDto({
      id: entity.id,
      entity_type: entity.entity_type,
      name: entity.name,
      description: entity.description,
      category: entity.category,
      tags: entity.tags,
      price: entity.price,
      published_date: entity.published_date,
      url: entity.url,
    });

    if (relevance_score !== undefined) {
      dto.relevance_score = relevance_score;
    }

    return dto;
  }
}

export class SearchMetadataDto {
  @ApiProperty({ example: 'landing page design' })
  query!: string;

  @ApiProperty({ example: 123 })
  total_results!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 20 })
  offset?: number;

  @ApiProperty({ example: 'next-uuid-string-here', required: false })
  next_cursor?: string;
}

export class SearchResponseDto {
  @ApiProperty()
  metadata!: SearchMetadataDto;

  @ApiProperty({ type: [SearchResultItemDto] })
  results!: SearchResultItemDto[];
} 