import { NextRequest, NextResponse } from 'next/server';
import { News } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    console.log('News API called');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    
    console.log('Fetching news with params:', { page, limit, offset });
    
    // Get all published news first
    const allNews = await News.getPublished();
    console.log('All news fetched:', allNews?.length || 0, 'items');
    
    // Ensure allNews is an array
    const newsArray = Array.isArray(allNews) ? allNews : [];
    
    const total = newsArray.length;
    const totalPages = Math.ceil(total / limit);
    
    // Apply pagination
    const news = newsArray.slice(offset, offset + limit);
    
    const result = {
      news,
      total,
      totalPages,
      currentPage: page
    };
    
    //console.log('Returning news result:', {
    //  newsCount: news.length,
    //  total,
    //  totalPages,
    //  currentPage: page
    //});
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching news:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch news',
        details: error instanceof Error ? error.message : 'Unknown error',
        news: [],
        total: 0,
        totalPages: 0
      },
      { status: 500 }
    );
  }
}