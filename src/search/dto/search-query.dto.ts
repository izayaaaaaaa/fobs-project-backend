import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsISO8601, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SortField {
  NAME = 'name',
  PRICE = 'price',
  PUBLISHED_DATE = 'published_date',
  RELEVANCE = 'relevance',
}

export class SearchQueryDto {
  @ApiProperty({ description: 'The search query string', example: 'landing page design' })
  @IsString()
  q!: string;

  @ApiPropertyOptional({ 
    description: 'Filter results by entity type (comma-separated for multiple)', 
    example: 'product,article' 
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ 
    description: 'Filter results by category (comma-separated for multiple)', 
    example: 'Technology,Design' 
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Filter results by tags (comma-separated for multiple; assumes AND logic)', 
    example: 'api,search' 
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by minimum price (inclusive)', 
    example: 50 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price_min?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by maximum price (inclusive)', 
    example: 200 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price_max?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by minimum published date (inclusive, ISO 8601 format: YYYY-MM-DD)', 
    example: '2023-01-01' 
  })
  @IsOptional()
  @IsISO8601()
  date_from?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by maximum published date (inclusive, ISO 8601 format: YYYY-MM-DD)', 
    example: '2023-12-31' 
  })
  @IsOptional()
  @IsISO8601()
  date_to?: string;

  @ApiPropertyOptional({ 
    description: 'Sorting criteria. Field name optionally prefixed with - for descending', 
    example: '-published_date',
    enum: [
      'name', '-name', 
      'price', '-price', 
      'published_date', '-published_date', 
      'relevance', '-relevance'
    ]
  })
  @IsOptional()
  @IsString()
  sort?: string = 'relevance';

  @ApiPropertyOptional({ 
    description: 'Number of results per page. Default: 20. Max: 100', 
    example: 10 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Number of results to skip (for offset-based pagination)', 
    example: 20 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ 
    description: 'ID of the last item from the previous page (for cursor-based pagination)', 
    example: 'a1b2c3d4-...' 
  })
  @IsOptional()
  @IsUUID()
  after_id?: string;
} 