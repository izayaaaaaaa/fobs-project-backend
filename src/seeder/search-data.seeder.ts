import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchableContent } from '../search/entities/searchable-content.entity';

@Injectable()
export class SearchDataSeeder {
  constructor(
    @InjectRepository(SearchableContent)
    private searchableContentRepository: Repository<SearchableContent>,
  ) {}

  async seed() {
    const count = await this.searchableContentRepository.count();
    if (count > 0) {
      console.log('Database already has data, skipping seeding');
      return;
    }

    console.log('Seeding database with sample content...');
    
    // Sample products
    const products = [
      {
        entity_type: 'product',
        name: 'Ergonomic Office Chair',
        description: 'Premium ergonomic office chair with lumbar support and adjustable height. Perfect for long work sessions.',
        category: 'Office Furniture',
        tags: ['ergonomic', 'office', 'chair', 'furniture'],
        price: 299.99,
        published_date: new Date('2023-05-20'),
        url: '/products/ergonomic-office-chair',
        attributes: {
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
      },
      {
        entity_type: 'product',
        name: 'Mechanical Keyboard',
        description: 'Professional mechanical keyboard with RGB lighting and programmable keys. Features Cherry MX Blue switches for tactile feedback.',
        category: 'Computer Accessories',
        tags: ['keyboard', 'mechanical', 'rgb', 'gaming'],
        price: 149.99,
        published_date: new Date('2023-07-15'),
        url: '/products/mechanical-keyboard',
        attributes: {
          brand: 'TechType',
          color: 'Black/Gray',
          switch_type: 'Cherry MX Blue',
          layout: 'Full size',
          backlight: 'RGB',
          connectivity: 'USB-C'
        }
      },
      {
        entity_type: 'product',
        name: '4K Ultra HD Monitor',
        description: 'Professional 32-inch 4K monitor with vibrant colors and wide viewing angles. Ideal for design work and content creation.',
        category: 'Monitors',
        tags: ['monitor', '4k', 'ultra hd', 'display'],
        price: 499.99,
        published_date: new Date('2023-08-10'),
        url: '/products/4k-ultra-hd-monitor',
        attributes: {
          brand: 'ViewPro',
          resolution: '3840x2160',
          screen_size: '32 inches',
          panel_type: 'IPS',
          refresh_rate: '60Hz',
          connectivity: ['HDMI', 'DisplayPort', 'USB-C']
        }
      }
    ];

    // Sample articles
    const articles = [
      {
        entity_type: 'article',
        name: 'The Future of Remote Work',
        description: 'An in-depth analysis of how remote work is reshaping the modern workplace and what to expect in the coming years.',
        category: 'Business',
        tags: ['remote work', 'work from home', 'business', 'workplace'],
        published_date: new Date('2023-09-05'),
        url: '/articles/future-of-remote-work',
        attributes: {
          author: 'Jane Smith',
          reading_time: '8 minutes',
          featured: true
        }
      },
      {
        entity_type: 'article',
        name: 'Effective Database Optimization Techniques',
        description: 'Learn proven strategies to optimize database performance and reduce query times in high-traffic applications.',
        category: 'Technology',
        tags: ['database', 'sql', 'optimization', 'performance'],
        published_date: new Date('2023-10-12'),
        url: '/articles/database-optimization-techniques',
        attributes: {
          author: 'David Johnson',
          reading_time: '12 minutes',
          technical_level: 'Advanced'
        }
      },
      {
        entity_type: 'article',
        name: 'UI Design Principles for Better User Experience',
        description: 'Explore essential UI design principles that can dramatically improve user experience and engagement in your applications.',
        category: 'Design',
        tags: ['ui', 'design', 'user experience', 'ux'],
        published_date: new Date('2023-11-20'),
        url: '/articles/ui-design-principles',
        attributes: {
          author: 'Sarah Chen',
          reading_time: '10 minutes',
          includes_examples: true
        }
      }
    ];

    // Sample services
    const services = [
      {
        entity_type: 'service',
        name: 'Web Development Consultation',
        description: 'Expert consultation for your web development project. Get professional advice on architecture, technology stack, and best practices.',
        category: 'Development',
        tags: ['web development', 'consultation', 'expert advice'],
        price: 149.99,
        published_date: new Date('2023-06-18'),
        url: '/services/web-development-consultation',
        attributes: {
          duration: '2 hours',
          delivery_method: 'Video call',
          includes_followup: true,
          service_area: 'Global'
        }
      },
      {
        entity_type: 'service',
        name: 'Logo Design Package',
        description: 'Professional logo design service with unlimited revisions. Includes multiple file formats and a brand guidelines document.',
        category: 'Design',
        tags: ['logo', 'branding', 'design', 'graphic design'],
        price: 299.99,
        published_date: new Date('2023-07-25'),
        url: '/services/logo-design-package',
        attributes: {
          turnaround_time: '5-7 days',
          deliverables: ['3 concepts', 'PNG', 'SVG', 'PDF', 'Brand guidelines'],
          revisions: 'Unlimited',
          pricing_model: 'Fixed price'
        }
      },
      {
        entity_type: 'service',
        name: 'SEO Audit and Optimization',
        description: 'Comprehensive SEO audit of your website with actionable recommendations to improve search engine rankings and organic traffic.',
        category: 'Marketing',
        tags: ['seo', 'search engine optimization', 'marketing', 'website traffic'],
        price: 499.99,
        published_date: new Date('2023-08-30'),
        url: '/services/seo-audit-optimization',
        attributes: {
          duration: '2 weeks',
          deliverables: ['Detailed audit report', 'Competitor analysis', 'Keyword research', 'Implementation guide'],
          service_area: 'Global',
          pricing_model: 'Fixed price'
        }
      }
    ];

    // Combine all content
    const allContent = [...products, ...articles, ...services];
    
    // Insert all content into the database
    await this.searchableContentRepository.save(allContent);
    
    console.log(`Seeded ${allContent.length} content items`);
  }
} 