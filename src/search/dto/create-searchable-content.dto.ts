import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, IsDateString, IsObject, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSearchableContentDto {
  @ApiProperty({ 
    description: 'Content type (e.g., "product", "article", "service")',
    example: 'product' 
  })
  @IsString()
  @IsNotEmpty()
  entity_type!: string;
  
  @ApiProperty({ 
    description: 'The name/title of the content',
    example: 'Ergonomic Office Chair' 
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
  
  @ApiPropertyOptional({ 
    description: 'Detailed description of the content',
    example: 'Premium ergonomic office chair with lumbar support and adjustable height.' 
  })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiPropertyOptional({ 
    description: 'Primary category of the content',
    example: 'Office Furniture' 
  })
  @IsString()
  @IsOptional()
  category?: string;
  
  @ApiPropertyOptional({ 
    description: 'Array of tags for categorization',
    example: ['ergonomic', 'office', 'chair', 'furniture'] 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
  
  @ApiPropertyOptional({ 
    description: 'Price (for product-type entities)',
    example: 299.99 
  })
  @IsNumber()
  @IsOptional()
  price?: number;
  
  @ApiPropertyOptional({ 
    description: 'Publication date',
    example: '2023-06-15T10:00:00Z' 
  })
  @IsDateString()
  @IsOptional()
  published_date?: string;
  
  @ApiPropertyOptional({ 
    description: 'URL to the canonical content page',
    example: '/products/ergonomic-office-chair' 
  })
  @IsString()
  @IsOptional()
  url?: string;
  
  @ApiPropertyOptional({ 
    description: 'Flexible type-specific attributes (JSONB)',
    example: {
      brand: 'ErgoComfort',
      color: 'Black',
      material: 'Mesh',
      dimensions: {
        width: 60,
        height: 120,
        depth: 65
      },
      weight_capacity: '300lbs'
    }
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
} 