import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createShopifySession, getBlogArticles, createBlogArticle } from '@/lib/shopify';

export async function GET(
  request: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const session = await getSession();

    if (!session.isAuthenticated || !session.user || !session.shopifyAccessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const blogId = parseInt(params.blogId);
    if (isNaN(blogId)) {
      return NextResponse.json(
        { error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    // Create Shopify session for API calls
    const shopifySession = createShopifySession({
      shop: session.shopifyShop!,
      accessToken: session.shopifyAccessToken,
      scope: 'write_content,read_content',
    });

    const articles = await getBlogArticles(shopifySession, blogId);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const session = await getSession();

    if (!session.isAuthenticated || !session.user || !session.shopifyAccessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const blogId = parseInt(params.blogId);
    if (isNaN(blogId)) {
      return NextResponse.json(
        { error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, author, tags, summary, published = false } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create Shopify session for API calls
    const shopifySession = createShopifySession({
      shop: session.shopifyShop!,
      accessToken: session.shopifyAccessToken,
      scope: 'write_content,read_content',
    });

    const article = await createBlogArticle(shopifySession, blogId, {
      title,
      body_html: content,
      author: author || session.user.full_name || session.user.email,
      tags: Array.isArray(tags) ? tags.join(', ') : tags,
      summary,
      published,
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Failed to create article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}