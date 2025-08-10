import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zeeboost.com';
  
  // Fetch published news
  const news = await prisma.news.findMany({
    where: {
      isPublished: true,
    },
    select: {
      id: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/topup`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // News pages
  const newsPages = news.map((item) => ({
    url: `${baseUrl}/news/${item.id}`,
    lastModified: new Date(item.publishedAt || item.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...newsPages];
}