import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchableContent } from '../search/entities/searchable-content.entity';
import { SearchDataSeeder } from './search-data.seeder';
import { LargeDataSeeder } from './large-data.seeder';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from '../database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([SearchableContent]),
  ],
  providers: [SearchDataSeeder, LargeDataSeeder],
  exports: [SearchDataSeeder, LargeDataSeeder],
})
export class SeederModule {} 