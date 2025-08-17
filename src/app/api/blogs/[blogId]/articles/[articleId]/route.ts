import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createShopifySession, getBlogArticle, updateBlogArticle, deleteBlogArticle } from '@/lib/shopify';

export async function GET(
  request: NextRequest,
  { params }: { params: { blogId: string; articleId: string } }
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
    const articleId = parseInt(params.articleId);
    
    if (isNaN(blogId) || isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid blog ID or article ID' },
        { status: 400 }
      );
    }

    // Create Shopify session for API calls
    const shopifySession = createShopifySession({
      shop: session.shopifyShop!,
      accessToken: session.shopifyAccessToken,
      scope: 'write_content,read_content',
    });

    const article = await getBlogArticle(shopifySession, blogId, articleId);

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { blogId: string; articleId: string } }
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
    const articleId = parseInt(params.articleId);
    
    if (isNaN(blogId) || isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid blog ID or article ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, author, tags, summary, published } = body;

    // Create Shopify session for API calls
    const shopifySession = createShopifySession({
      shop: session.shopifyShop!,
      accessToken: session.shopifyAccessToken,
      scope: 'write_content,read_content',
    });

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.body_html = content;
    if (author !== undefined) updateData.author = author;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.join(', ') : tags;
    if (summary !== undefined) updateData.summary = summary;
    if (published !== undefined) updateData.published = published;

    const article = await updateBlogArticle(shopifySession, blogId, articleId, updateData);

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Failed to update article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { blogId: string; articleId: string } }
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
    const articleId = parseInt(params.articleId);
    
    if (isNaN(blogId) || isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid blog ID or article ID' },
        { status: 400 }
      );
    }

    // Create Shopify session for API calls
    const shopifySession = createShopifySession({
      shop: session.shopifyShop!,
      accessToken: session.shopifyAccessToken,
      scope: 'write_content,read_content',
    });

    await deleteBlogArticle(shopifySession, blogId, articleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}