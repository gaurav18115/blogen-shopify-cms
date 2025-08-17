'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import BlogForm from '@/components/blog/BlogForm';

interface Article {
  id: number;
  title: string;
  body_html: string;
  author?: string;
  tags?: string;
  summary?: string;
  published?: boolean;
}

interface EditArticlePageProps {
  user: User;
  blogId: number;
  articleId: number;
}

export default function EditArticlePage({ user, blogId, articleId }: EditArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [blogId, articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blogs/${blogId}/articles/${articleId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found');
        } else {
          throw new Error('Failed to fetch article');
        }
        return;
      }

      const data = await response.json();
      setArticle({
        id: data.article.id,
        title: data.article.title,
        body_html: data.article.body_html,
        author: data.article.author,
        tags: data.article.tags,
        summary: data.article.summary,
        published: !!data.article.published_at,
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Loading Article...
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.shopify_store_name}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-medium text-sm">
                      {user.full_name?.charAt(0) || user.email.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user.full_name || user.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading content */}
        <main className="py-6">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Error Loading Article
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.shopify_store_name}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-medium text-sm">
                      {user.full_name?.charAt(0) || user.email.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user.full_name || user.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Error content */}
        <main className="py-6">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-red-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit: {article?.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.shopify_store_name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">
                    {user.full_name?.charAt(0) || user.email.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user.full_name || user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-6">
        <BlogForm 
          initialArticle={article}
          blogId={blogId}
          articleId={articleId}
          isEditing={true}
        />
      </main>
    </div>
  );
}