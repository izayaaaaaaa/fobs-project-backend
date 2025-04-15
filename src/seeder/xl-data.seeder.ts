import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SearchableContent } from '../search/entities/searchable-content.entity';

// Sample data arrays for generating random content
const PRODUCT_NAMES = [
  'Professional Ergonomic Chair', 'Ultra-Slim Laptop', 'Wireless Headphones', 
  'Smart Watch', 'Bluetooth Speaker', 'Mechanical Keyboard', '4K Monitor', 
  'Wireless Mouse', 'External SSD Drive', 'Graphics Tablet', 'Desk Lamp',
  'Coffee Maker', 'Air Purifier', 'Robot Vacuum', 'Fitness Tracker',
  'Electric Standing Desk', 'Noise-Cancelling Earbuds', 'Portable Charger',
  'Gaming Console', 'Smartphone', 'Tablet', 'E-book Reader', 'Digital Camera',
  'Virtual Reality Headset', 'Smart Home Hub', 'Wireless Router', 'Microphone',
  'Webcam', 'Portable Projector', 'Wireless Printer'
];

const ARTICLE_TITLES = [
  'The Future of Artificial Intelligence', 'Mastering Modern Web Development',
  'Building Scalable Cloud Infrastructure', 'User Experience Design Principles',
  'Mobile App Development Trends', 'Database Optimization Techniques',
  'Machine Learning for Beginners', 'Cybersecurity Best Practices',
  'DevOps Implementation Guide', 'Blockchain Technology Explained',
  'Software Architecture Patterns', 'Frontend Framework Comparison',
  'The State of Remote Work', 'Agile Project Management', 'Data Privacy Regulations',
  'Responsive Design Strategies', 'API Development Best Practices',
  'Serverless Computing Guide', 'Microservices Architecture Explained',
  'UI Design Trends', 'SEO Optimization Techniques', 'Content Strategy Guide',
  'Digital Marketing Analytics', 'Social Media Management', 'Email Marketing Tips',
  'Product Management Essentials', 'Customer Success Strategies',
  'Business Growth Hacking', 'Startup Funding Guide', 'Leadership Development'
];

const SERVICE_NAMES = [
  'Web Development Consultation', 'Custom Software Development',
  'Mobile App Development', 'UI/UX Design Services', 'Database Optimization',
  'Cloud Migration Service', 'SEO Audit and Optimization', 'Content Marketing Strategy',
  'Social Media Management', 'Email Marketing Campaign', 'Brand Identity Design',
  'Logo Design Package', 'Product Photography', 'Video Production Service',
  'Animation and Motion Graphics', 'IT Infrastructure Setup', 'Network Security Audit',
  'Data Backup and Recovery', 'Business Intelligence Solutions', 'CRM Implementation',
  'ERP System Setup', 'Online Course Creation', 'E-commerce Store Setup',
  'Virtual Assistant Service', 'Customer Support Outsourcing', 'Market Research Service',
  'Financial Analysis', 'Business Plan Development', 'Legal Consultation',
  'HR Consulting Service'
];

const PRODUCT_DESCRIPTIONS = [
  'Premium quality with exceptional performance. Designed for professionals who demand the best.',
  'Innovative design with cutting-edge features. Perfect for early adopters and tech enthusiasts.',
  'Reliable and durable construction built to last. Ideal for everyday use in any environment.',
  'Sleek and modern aesthetic combined with practical functionality. Enhances any workspace.',
  'Highly versatile with multiple use cases. Adapts to your changing needs and requirements.',
  'Energy-efficient design helps reduce costs and environmental impact without sacrificing performance.',
  'Intuitive interface makes operation simple and straightforward. No lengthy manuals needed.',
  'Compact and portable design perfect for travel and mobile use. Take it anywhere you go.',
  'Expandable and upgradable to meet your future needs. A long-term investment in productivity.',
  'Precision-engineered for optimal performance in demanding situations and professional environments.'
];

const ARTICLE_DESCRIPTIONS = [
  'An in-depth exploration of emerging technologies and their potential impact on the industry.',
  'Practical guide with step-by-step instructions and real-world examples for immediate implementation.',
  'Comprehensive analysis of current trends and future predictions based on market research.',
  'Case study examining successful implementations and lessons learned from industry leaders.',
  'Expert interview featuring insights and advice from recognized authorities in the field.',
  'Comparative review of popular tools and frameworks to help inform your technology choices.',
  'Beginner-friendly introduction to complex concepts with simplified explanations and tutorials.',
  'Technical deep-dive for experienced practitioners looking to expand their knowledge.',
  'Research-based findings that challenge conventional wisdom and offer new perspectives.',
  'Strategic overview providing a roadmap for planning and execution of major initiatives.'
];

const SERVICE_DESCRIPTIONS = [
  'Expert consultation services tailored to your specific needs and business objectives.',
  'End-to-end solution from planning and design through implementation and ongoing support.',
  'Results-oriented approach focused on delivering measurable improvements and ROI.',
  'Collaborative partnership that leverages our expertise while respecting your vision.',
  'Scalable service packages that can grow with your business and evolving requirements.',
  'Transparent process with regular updates and clear communication throughout the project.',
  'Innovative methodology combining industry best practices with creative problem-solving.',
  'Comprehensive analysis and recommendations based on data-driven insights and trends.',
  'Strategic guidance to help navigate complex challenges and identify new opportunities.',
  'Rapid deployment options for time-sensitive projects without compromising quality.'
];

const CATEGORIES = {
  product: [
    'Electronics', 'Office Equipment', 'Home Appliances', 'Computer Accessories',
    'Audio Equipment', 'Smart Home', 'Photography', 'Health & Fitness', 
    'Kitchen Appliances', 'Gaming Accessories'
  ],
  article: [
    'Technology', 'Development', 'Design', 'Business', 'Marketing', 'Data Science',
    'Security', 'Cloud Computing', 'Mobile', 'Productivity', 'Career Development'
  ],
  service: [
    'Consulting', 'Development', 'Design', 'Marketing', 'Content Creation',
    'Business Services', 'IT Services', 'Financial Services', 'Training',
    'Support Services'
  ]
};

const TAG_POOLS = {
  product: [
    'wireless', 'bluetooth', 'smart', 'portable', 'professional', 'premium',
    'high-performance', 'ergonomic', 'durable', 'compact', 'lightweight',
    'rechargeable', 'adjustable', 'foldable', 'waterproof', 'noise-cancelling',
    'energy-efficient', 'programmable', 'touchscreen', '4k', 'HD', 'ultra-slim', 
    'fast-charging', 'budget-friendly', 'luxury', 'gaming', 'office', 'travel'
  ],
  article: [
    'tutorial', 'guide', 'how-to', 'explainer', 'case-study', 'analysis',
    'research', 'trends', 'best-practices', 'tips', 'strategies', 'comparison',
    'review', 'beginner', 'advanced', 'expert', 'technical', 'business',
    'career', 'productivity', 'leadership', 'innovation', 'digital-transformation',
    'cloud', 'mobile', 'web', 'security', 'performance', 'optimization'
  ],
  service: [
    'consulting', 'implementation', 'development', 'design', 'support',
    'maintenance', 'training', 'audit', 'strategy', 'management',
    'outsourcing', 'custom', 'enterprise', 'small-business', 'startup',
    'subscription', 'one-time', 'retainer', 'project-based', 'hourly',
    'monthly', 'annual', 'premium', 'basic', 'professional', 'expert',
    'certified', 'guaranteed', 'fast-turnaround', 'remote'
  ]
};

const BRANDS = [
  'TechMaster', 'ElitePro', 'InnovateTech', 'PrimeTech', 'NextGen',
  'FutureWave', 'SmartLife', 'OptimaPro', 'VitalEdge', 'ZenithTech',
  'AlphaCore', 'EcoPrime', 'VisionTech', 'DynamicEdge', 'PrecisionCraft'
];

const AUTHORS = [
  'Emma Thompson', 'James Wilson', 'Sophia Chen', 'Michael Rodriguez',
  'Olivia Johnson', 'David Kim', 'Ava Patel', 'Daniel Lee', 'Isabella Martinez',
  'Alexander Davis', 'Mia Taylor', 'Ethan Brown', 'Charlotte Williams',
  'Benjamin Moore', 'Amelia Garcia', 'Samuel White', 'Aria Jackson',
  'Matthew Miller', 'Harper Anderson', 'Joseph Thomas'
];

@Injectable()
export class XLDataSeeder {
  constructor(
    @InjectRepository(SearchableContent)
    private searchableContentRepository: Repository<SearchableContent>,
    private dataSource: DataSource,
  ) {}

  /**
   * Seeds the database with configurable number of records.
   * Default is 300,000 records.
   * Can be overridden with command line argument: --count=1000000
   */
  async seed(totalRecords?: number) {
    // Allow command line override of record count
    if (!totalRecords) {
      // Check for command line arguments like --count=1000000
      const args = process.argv;
      const countArg = args.find(arg => arg.startsWith('--count='));
      if (countArg) {
        const countValue = parseInt(countArg.split('=')[1], 10);
        if (!isNaN(countValue) && countValue > 0) {
          totalRecords = countValue;
        }
      }

      // Default if not specified
      totalRecords = totalRecords || 300000;
    }

    const count = await this.searchableContentRepository.count();
    if (count > 0) {
      console.log('Database already has data, skipping large data seeding');
      return;
    }

    console.log(`Starting to seed ${totalRecords.toLocaleString()} records...`);
    console.time('Seeding time');

    // Use larger batch size for better performance while balancing memory usage
    const batchSize = 1000;
    
    // Use a queryRunner for transaction support and better performance
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let processed = 0;
      const startTime = Date.now();
      let lastReportTime = startTime;

      for (let i = 0; i < totalRecords; i += batchSize) {
        const currentBatchSize = Math.min(batchSize, totalRecords - i);
        const batch = this.generateBatch(i, currentBatchSize);
        
        // Use more efficient bulk insert
        await queryRunner.manager.createQueryBuilder()
          .insert()
          .into(SearchableContent)
          .values(batch)
          .execute();
        
        processed += currentBatchSize;
        
        // Report progress every 30 seconds or 5% of records, whichever comes first
        const currentTime = Date.now();
        if (currentTime - lastReportTime > 30000 || processed % Math.max(Math.floor(totalRecords * 0.05), batchSize) === 0) {
          const elapsedSecs = (currentTime - startTime) / 1000;
          const recordsPerSec = processed / elapsedSecs;
          const remainingRecords = totalRecords - processed;
          const estimatedRemainingSecs = remainingRecords / recordsPerSec;
          
          console.log(`Seeded ${processed.toLocaleString()} of ${totalRecords.toLocaleString()} records (${(processed/totalRecords*100).toFixed(1)}%)`);
          console.log(`Speed: ${Math.round(recordsPerSec)} records/sec, Est. time remaining: ${this.formatTime(estimatedRemainingSecs)}`);
          
          lastReportTime = currentTime;
          
          // Release memory explicitly
          global.gc?.();
        }
      }
      
      // Commit the transaction
      await queryRunner.commitTransaction();
      console.timeEnd('Seeding time');
      console.log(`Successfully seeded ${totalRecords.toLocaleString()} records!`);
      
      // Update search vectors because bulk insert bypasses triggers
      console.log('Updating search vectors...');
      console.time('Search vector update time');
      
      await this.updateSearchVectors();
      
      console.timeEnd('Search vector update time');
      console.log('Search vectors updated successfully!');
      
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Error seeding data:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private generateBatch(startIndex: number, size: number): SearchableContent[] {
    const batch: any[] = [];

    for (let i = 0; i < size; i++) {
      const recordNum = startIndex + i + 1;
      // Distribute the entity types: 50% products, 30% articles, 20% services
      let entityType: 'product' | 'article' | 'service';
      if (recordNum % 10 <= 4) {
        entityType = 'product';
      } else if (recordNum % 10 <= 7) {
        entityType = 'article';
      } else {
        entityType = 'service';
      }

      batch.push(this.generateRecord(entityType, recordNum));
    }

    return batch;
  }

  private generateRecord(entityType: 'product' | 'article' | 'service', recordNum: number): any {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Use a shared date range for better cache locality
    const randomDate = this.cachedRandomDate(oneYearAgo, now);

    // Base content that applies to all entity types
    const record: any = {
      entity_type: entityType,
      name: this.generateName(entityType, recordNum),
      description: this.generateDescription(entityType),
      category: this.pickRandom(CATEGORIES[entityType]),
      tags: this.generateTags(entityType),
      published_date: randomDate,
      url: `/content/${entityType}s/${recordNum}`,
      attributes: {}
    };

    // Add entity-specific fields
    switch (entityType) {
      case 'product':
        record.price = this.generateRandomPrice(19.99, 999.99);
        record.attributes = {
          brand: this.pickRandom(BRANDS),
          color: this.pickRandom(['Black', 'White', 'Silver', 'Blue', 'Red', 'Green', 'Gray', 'Gold']),
          material: this.pickRandom(['Plastic', 'Metal', 'Aluminum', 'Carbon Fiber', 'Wood', 'Glass', 'Silicone']),
          weight: Math.floor(Math.random() * 5000) / 1000 + 0.1, // 0.1 to 5.1 kg
          dimensions: {
            width: Math.floor(Math.random() * 100) + 5,
            height: Math.floor(Math.random() * 50) + 5,
            depth: Math.floor(Math.random() * 30) + 2
          },
          inStock: Math.random() > 0.2, // 80% chance to be in stock
          rating: Math.floor(Math.random() * 20 + 30) / 10 // 3.0 to 5.0 rating
        };
        break;

      case 'article':
        record.attributes = {
          author: this.pickRandom(AUTHORS),
          reading_time: `${Math.floor(Math.random() * 25) + 3} minutes`,
          technical_level: this.pickRandom(['Beginner', 'Intermediate', 'Advanced']),
          featured: Math.random() < 0.1, // 10% chance to be featured
          topics: this.pickNRandomUnique(
            ['Development', 'Design', 'Business', 'Technology', 'Career', 'Productivity', 'Leadership', 'Data Science', 'AI', 'Cloud'],
            Math.floor(Math.random() * 3) + 1
          )
        };
        break;

      case 'service':
        record.price = this.generateRandomPrice(99.99, 2999.99);
        record.attributes = {
          duration: this.pickRandom(['1 hour', '2 hours', '1 day', '1 week', '2 weeks', '1 month', 'Ongoing']),
          service_area: this.pickRandom(['Global', 'North America', 'Europe', 'Asia', 'Local']),
          delivery_method: this.pickRandom(['In-person', 'Remote', 'Hybrid', 'Self-service']),
          pricing_model: this.pickRandom(['Fixed price', 'Hourly', 'Retainer', 'Subscription', 'Value-based']),
          deliverables: this.pickNRandomUnique(
            ['Strategy document', 'Implementation plan', 'Code repository', 'Design files', 'Training materials', 'Support documentation', 'Regular reports', 'Custom software', 'Consultation sessions'],
            Math.floor(Math.random() * 4) + 1
          )
        };
        break;
    }

    return record;
  }

  // Cache random dates for better performance
  private dateCache: Date[] = [];
  private cachedRandomDate(start: Date, end: Date): Date {
    // Generate a batch of dates if needed
    if (this.dateCache.length === 0) {
      const dateCount = 1000;
      for (let i = 0; i < dateCount; i++) {
        this.dateCache.push(this.generateRandomDate(start, end));
      }
    }
    
    // Return and remove a date from the cache
    return this.dateCache.pop() || this.generateRandomDate(start, end);
  }

  private generateRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private generateName(entityType: string, recordNum: number): string {
    let namePools: string[];
    
    switch (entityType) {
      case 'product':
        namePools = PRODUCT_NAMES;
        break;
      case 'article':
        namePools = ARTICLE_TITLES;
        break;
      case 'service':
        namePools = SERVICE_NAMES;
        break;
      default:
        namePools = [...PRODUCT_NAMES, ...ARTICLE_TITLES, ...SERVICE_NAMES];
    }

    // To ensure uniqueness while maintaining performance with large datasets,
    // we'll use a deterministic approach based on record number
    const baseNameIndex = recordNum % namePools.length;
    const baseName = namePools[baseNameIndex];
    
    // Create variations using deterministic modifiers
    if (recordNum <= namePools.length) {
      return baseName;
    } else {
      const suffixes = [
        'Pro', 'Plus', 'Premium', 'Max', 'Ultra', 'Elite', 'Advanced',
        'Basic', 'Standard', 'Professional', 'Enterprise', 'Essential'
      ];
      
      const adjectives = [
        'Smart', 'Innovative', 'Efficient', 'Modern', 'Classic', 'Versatile',
        'Custom', 'Expert', 'Complete', 'Dynamic', 'Optimal', 'Strategic'  
      ];
      
      // Use different variation strategies based on record number
      const modulus = recordNum % 4;
      
      if (modulus === 0) {
        const suffixIndex = Math.floor(recordNum / namePools.length) % suffixes.length;
        return `${baseName} ${suffixes[suffixIndex]}`;
      } else if (modulus === 1) {
        const adjectiveIndex = Math.floor(recordNum / namePools.length) % adjectives.length;
        return `${adjectives[adjectiveIndex]} ${baseName}`;
      } else if (modulus === 2) {
        return `${baseName} ${Math.ceil(recordNum / 10000)}.0`;
      } else {
        return `${baseName} (${recordNum % 1000})`;
      }
    }
  }

  // Cache descriptions to reduce memory pressure
  private descriptionCache: Record<string, string[]> = {
    'product': [],
    'article': [],
    'service': []
  };

  private generateDescription(entityType: string): string {
    // Fill cache if empty
    if (this.descriptionCache[entityType].length === 0) {
      let descriptionPool: string[];
      
      switch (entityType) {
        case 'product':
          descriptionPool = PRODUCT_DESCRIPTIONS;
          break;
        case 'article':
          descriptionPool = ARTICLE_DESCRIPTIONS;
          break;
        case 'service':
          descriptionPool = SERVICE_DESCRIPTIONS;
          break;
        default:
          descriptionPool = [...PRODUCT_DESCRIPTIONS, ...ARTICLE_DESCRIPTIONS, ...SERVICE_DESCRIPTIONS];
      }
      
      // Pre-generate 100 descriptions for each type
      const cacheSize = 100;
      for (let i = 0; i < cacheSize; i++) {
        // Generate a more detailed description using 2-3 sentences
        const numSentences = (i % 2) + 2; // Alternate between 2-3 sentences for variety
        const sentences: string[] = [];
        
        for (let j = 0; j < numSentences; j++) {
          sentences.push(descriptionPool[Math.floor(Math.random() * descriptionPool.length)]);
        }
        
        this.descriptionCache[entityType].push(sentences.join(' '));
      }
    }
    
    // Get a random description from cache
    const index = Math.floor(Math.random() * this.descriptionCache[entityType].length);
    return this.descriptionCache[entityType][index];
  }

  // Cache tag combinations
  private tagCache: Record<string, string[][]> = {
    'product': [],
    'article': [],
    'service': []
  };

  private generateTags(entityType: string): string[] {
    // Fill cache if empty
    if (this.tagCache[entityType].length === 0) {
      const tagPool = TAG_POOLS[entityType as keyof typeof TAG_POOLS];
      const cacheSize = 50;
      
      // Pre-generate tag combinations
      for (let i = 0; i < cacheSize; i++) {
        const tagCount = Math.floor(Math.random() * 5) + 2; // 2-6 tags
        this.tagCache[entityType].push(this.pickNRandomUnique(tagPool, tagCount));
      }
    }
    
    // Get random tags from cache
    const index = Math.floor(Math.random() * this.tagCache[entityType].length);
    return [...this.tagCache[entityType][index]]; // Return a copy to prevent mutation
  }

  private generateRandomPrice(min: number, max: number): number {
    // Generate a price and round to 2 decimal places
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
  }

  private pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private pickNRandomUnique<T>(array: T[], n: number): T[] {
    // For performance with large datasets, use a more efficient algorithm
    // that doesn't require copying the entire array
    const count = Math.min(n, array.length);
    const result: T[] = [];
    const used = new Set<number>();
    
    while (result.length < count) {
      const index = Math.floor(Math.random() * array.length);
      if (!used.has(index)) {
        used.add(index);
        result.push(array[index]);
      }
    }
    
    return result;
  }

  /**
   * Updates search vectors for all records where search_vector is null
   * This is needed because bulk insert operations bypass database triggers
   * Can be called separately to fix null search vectors in the database
   */
  public async updateSearchVectors(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Count how many records have null search vectors
      const nullVectorsResult = await queryRunner.query(`
        SELECT COUNT(*) FROM searchable_content WHERE search_vector IS NULL
      `);
      
      const nullVectorsCount = parseInt(nullVectorsResult[0].count, 10);
      if (nullVectorsCount === 0) {
        console.log('All search vectors are already populated.');
        return;
      }
      
      console.log(`Updating ${nullVectorsCount.toLocaleString()} search vectors...`);
      
      // Update search vectors in batches to avoid memory issues
      const batchSize = 10000;
      let updated = 0;
      
      while (updated < nullVectorsCount) {
        // Use a CTE (Common Table Expression) with a window function to get a limited subset of records
        // This approach works in PostgreSQL instead of using LIMIT in UPDATE
        const updateQuery = `
          WITH records_to_update AS (
            SELECT id FROM searchable_content 
            WHERE search_vector IS NULL
            ORDER BY id
            LIMIT ${batchSize}
          )
          UPDATE searchable_content
          SET search_vector = 
            setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
            setweight(to_tsvector('english', 
              CASE WHEN tags IS NULL THEN '' ELSE array_to_string(tags, ' ') END
            ), 'C') ||
            setweight(to_tsvector('english', COALESCE(entity_type, '')), 'D')
          WHERE id IN (SELECT id FROM records_to_update)
        `;
        
        try {
          await queryRunner.query(updateQuery);
        } catch (error) {
          console.log('query failed:', updateQuery);
          throw error;
        }
        
        // Update with JSONB attributes for the same batch
        const attributesUpdateQuery = `
          WITH records_to_update AS (
            SELECT id FROM searchable_content 
            WHERE search_vector IS NOT NULL
            AND attributes IS NOT NULL 
            AND attributes::text != 'null'
            AND id IN (
              SELECT id FROM searchable_content 
              WHERE search_vector IS NOT NULL
              ORDER BY id
              LIMIT ${batchSize}
            )
          )
          UPDATE searchable_content
          SET search_vector = search_vector || 
            setweight(
              to_tsvector('english', 
                COALESCE((attributes->>'author'), '') || ' ' ||
                COALESCE((attributes->>'brand'), '') || ' ' ||
                COALESCE((attributes->>'technical_level'), '') || ' ' ||
                COALESCE((attributes->>'color'), '') || ' ' ||
                COALESCE((attributes->>'material'), '') || ' ' ||
                COALESCE((attributes->>'service_area'), '') || ' ' ||
                COALESCE((attributes->>'pricing_model'), '')
              ),
              'D'
            )
          WHERE id IN (SELECT id FROM records_to_update)
        `;
        
        try {
          await queryRunner.query(attributesUpdateQuery);
        } catch (error) {
          console.log('attributes query failed:', attributesUpdateQuery);
          throw error;
        }
        
        // Get the count of records still needing updates
        const remainingResult = await queryRunner.query(`
          SELECT COUNT(*) FROM searchable_content WHERE search_vector IS NULL
        `);
        
        const remaining = parseInt(remainingResult[0].count, 10);
        const newUpdated = nullVectorsCount - remaining;
        const batchUpdated = newUpdated - updated;
        updated = newUpdated;
        
        console.log(`Updated ${updated.toLocaleString()} of ${nullVectorsCount.toLocaleString()} search vectors (${(updated/nullVectorsCount*100).toFixed(1)}%), last batch: ${batchUpdated}`);
        
        // If we've updated all vectors, break out of the loop
        if (remaining === 0) break;
      }
      
      // Final count check
      const finalCheck = await queryRunner.query(`
        SELECT COUNT(*) FROM searchable_content WHERE search_vector IS NULL
      `);
      
      if (parseInt(finalCheck[0].count, 10) > 0) {
        console.warn(`Warning: ${finalCheck[0].count} records still have NULL search vectors after update`);
      } else {
        console.log('All search vectors have been successfully updated!');
      }
    } catch (error) {
      console.error('Error updating search vectors:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
} 