import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { CreateSearchableContentDto } from './dto/create-searchable-content.dto';
import { SearchableContent } from './entities/searchable-content.entity';

@ApiTags('search')
@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search for content across all entity types' })
  @ApiResponse({
    status: 200,
    description: 'The search results',
    type: SearchResponseDto,
  })
  @ApiQuery({ name: 'q', required: true, description: 'The search query string' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by entity type' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags' })
  @ApiQuery({ name: 'price_min', required: false, description: 'Filter by minimum price' })
  @ApiQuery({ name: 'price_max', required: false, description: 'Filter by maximum price' })
  @ApiQuery({ name: 'date_from', required: false, description: 'Filter by minimum date' })
  @ApiQuery({ name: 'date_to', required: false, description: 'Filter by maximum date' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip' })
  @ApiQuery({ name: 'after_id', required: false, description: 'Cursor for pagination' })
  async search(@Query() query: SearchQueryDto): Promise<SearchResponseDto> {
    return this.searchService.search(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new searchable content' })
  @ApiResponse({
    status: 201,
    description: 'The content has been successfully created',
    type: SearchableContent,
  })
  @ApiBody({ type: CreateSearchableContentDto })
  async create(@Body() createSearchableContentDto: CreateSearchableContentDto): Promise<SearchableContent> {
    return this.searchService.create(createSearchableContentDto);
  }
} 