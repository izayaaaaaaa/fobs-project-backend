import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SearchDataSeeder } from './search-data.seeder';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  
  try {
    const seeder = appContext.get(SearchDataSeeder);
    await seeder.seed();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed', error);
  } finally {
    await appContext.close();
  }
}

bootstrap(); 