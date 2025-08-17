'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Blog {
  id: number;
  title: string;
  handle: string;
}

interface Article {
  id: number;
  title: string;
  author: string;
  tags: string;
  summary: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  body_html: string;
}

export default function BlogList() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<number>(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      
      const data = await response.json();
      setBlogs(data.blogs || []);
      
      // Auto-select first blog if available
      if (data.blogs && data.blogs.length > 0) {
        setSelectedBlogId(data.blogs[0].id);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      alert('Failed to load blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    if (!selectedBlogId) return;
    
    try {
      setLoadingArticles(true);
      const response = await fetch(`/api/blogs/${selectedBlogId}/articles`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      alert('Failed to load articles. Please try again.');
    } finally {
      setLoadingArticles(false);
    }
  }, [selectedBlogId]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (selectedBlogId > 0) {
      fetchArticles();
    } else {
      setArticles([]);
    }
  }, [selectedBlogId, fetchArticles]);

  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(articleId);
      const response = await fetch(`/api/blogs/${selectedBlogId}/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete article');

      // Remove the article from the list
      setArticles(prev => prev.filter(article => article.id !== articleId));
      alert('Article deleted successfully!');
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Blog Articles</h1>
            <button
              onClick={() => router.push('/dashboard/blogs/new')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              data-testid="create-new-article-button"
            >
              Create New Article
            </button>
          </div>
        </div>

        {/* Blog Selection */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label htmlFor="blog-select" className="text-sm font-medium text-gray-700">
              Select Blog:
            </label>
            <select
              id="blog-select"
              value={selectedBlogId}
              onChange={(e) => setSelectedBlogId(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={0}>Select a blog...</option>
              {blogs.map((blog) => (
                <option key={blog.id} value={blog.id}>
                  {blog.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles List */}
        <div className="p-6">
          {!selectedBlogId ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-lg text-gray-500">Select a blog to view its articles</p>
              </div>
            </div>
          ) : loadingArticles ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="mt-4 text-lg text-gray-500">No articles found</p>
                <p className="text-sm text-gray-400">Create your first article to get started</p>
                <button
                  onClick={() => router.push('/dashboard/blogs/new')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  data-testid="create-first-article-button"
                >
                  Create First Article
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h3>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                        {article.author && (
                          <span>By {article.author}</span>
                        )}
                        <span>
                          {article.published_at ? `Published ${formatDate(article.published_at)}` : 'Draft'}
                        </span>
                        <span>Updated {formatDate(article.updated_at)}</span>
                      </div>

                      {article.summary && (
                        <p className="text-gray-600 mb-3">
                          {truncateText(article.summary, 150)}
                        </p>
                      )}

                      {!article.summary && article.body_html && (
                        <p className="text-gray-600 mb-3">
                          {truncateText(stripHtml(article.body_html), 150)}
                        </p>
                      )}

                      {article.tags && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.split(',').map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          article.published_at 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.published_at ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => router.push(`/dashboard/blogs/${selectedBlogId}/articles/${article.id}`)}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                        data-testid={`edit-article-${article.id}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        disabled={deleteLoading === article.id}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        data-testid={`delete-article-${article.id}`}
                      >
                        {deleteLoading === article.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}