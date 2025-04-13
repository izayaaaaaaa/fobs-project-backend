import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchableContent } from '../search/entities/searchable-content.entity';
import { SearchDataSeeder } from './search-data.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchableContent]),
  ],
  providers: [SearchDataSeeder],
  exports: [SearchDataSeeder],
})
export class SeederModule {} 