import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { XLDataSeeder } from './xl-data.seeder';

async function bootstrap() {
  // Set node memory limits for large operation
  // Increase to 8GB or as needed based on available system memory
  // Note: This is a suggestion and doesn't guarantee the memory will be available
  if (typeof process.env.NODE_OPTIONS !== 'string' || !process.env.NODE_OPTIONS.includes('--max-old-space-size')) {
    process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=8192`;
  }

  console.log('Starting bulk data seeder with Node options:', process.env.NODE_OPTIONS);
  
  const startTime = Date.now();
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  
  try {
    const seeder = appContext.get(XLDataSeeder);
    
    // Get count from command line or default (300,000)
    const args = process.argv;
    const countArg = args.find(arg => arg.startsWith('--count='));
    let count: number | undefined;
    
    if (countArg) {
      count = parseInt(countArg.split('=')[1], 10);
      if (isNaN(count) || count <= 0) {
        throw new Error(`Invalid count value: ${countArg.split('=')[1]}`);
      }
    }
    
    await seeder.seed(count);
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`Bulk data seeding completed successfully in ${totalTime} seconds`);
  } catch (error) {
    console.error('Bulk data seeding failed:', error);
    process.exit(1); // Exit with error code
  } finally {
    await appContext.close();
  }
}

process.on('SIGINT', () => {
  console.log('Bulk seeding interrupted by user');
  process.exit(0);
});

bootstrap().catch(err => {
  console.error('Bootstrap error:', err);
  process.exit(1);
}); 