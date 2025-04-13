import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { LargeDataSeeder } from './large-data.seeder';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  
  try {
    const seeder = appContext.get(LargeDataSeeder);
    await seeder.seed();
    console.log('Large data seeding completed successfully');
  } catch (error) {
    console.error('Large data seeding failed', error);
  } finally {
    await appContext.close();
  }
}

bootstrap(); 