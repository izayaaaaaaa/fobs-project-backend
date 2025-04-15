import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { XLDataSeeder } from './xl-data.seeder';

async function bootstrap() {
  console.log('Starting search vector update...');
  const startTime = Date.now();
  
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  
  try {
    const seeder = appContext.get(XLDataSeeder);
    
    // Call the public method
    await seeder.updateSearchVectors();
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`Search vector update completed successfully in ${totalTime} seconds`);
  } catch (error) {
    console.error('Search vector update failed:', error);
    process.exit(1); // Exit with error code
  } finally {
    await appContext.close();
  }
}

bootstrap().catch(err => {
  console.error('Bootstrap error:', err);
  process.exit(1);
}); 