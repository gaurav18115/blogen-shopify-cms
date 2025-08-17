'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Blog {
  id: number;
  title: string;
  handle: string;
}

interface Article {
  id?: number;
  title: string;
  body_html: string;
  author?: string;
  tags?: string;
  summary?: string;
  published?: boolean;
}

interface BlogFormProps {
  initialArticle?: Article;
  blogId?: number;
  articleId?: number;
  isEditing?: boolean;
}

export default function BlogForm({ 
  initialArticle, 
  blogId: initialBlogId, 
  articleId, 
  isEditing = false 
}: BlogFormProps) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<number>(initialBlogId || 0);
  const [loading, setLoading] = useState(false);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [formData, setFormData] = useState<Article>({
    title: initialArticle?.title || '',
    body_html: initialArticle?.body_html || '',
    author: initialArticle?.author || '',
    tags: initialArticle?.tags || '',
    summary: initialArticle?.summary || '',
    published: initialArticle?.published || false,
  });

  const fetchBlogs = useCallback(async () => {
    try {
      setLoadingBlogs(true);
      const response = await fetch('/api/blogs');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      
      const data = await response.json();
      setBlogs(data.blogs || []);
      
      // If no blog is selected and we have blogs, select the first one
      if (!selectedBlogId && data.blogs && data.blogs.length > 0) {
        setSelectedBlogId(data.blogs[0].id);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      alert('Failed to load blogs. Please try again.');
    } finally {
      setLoadingBlogs(false);
    }
  }, [selectedBlogId]);

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBlogId) {
      alert('Please select a blog');
      return;
    }

    if (!formData.title.trim() || !formData.body_html.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      
      const url = isEditing 
        ? `/api/blogs/${selectedBlogId}/articles/${articleId}`
        : `/api/blogs/${selectedBlogId}/articles`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.body_html,
          author: formData.author,
          tags: formData.tags,
          summary: formData.summary,
          published: formData.published,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save article');
      }

      const data = await response.json();
      alert(`Article ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Redirect to the blog list or article view
      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('Error saving article:', error);
      alert(error instanceof Error ? error.message : 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Article, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loadingBlogs) {
    return (
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
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Article' : 'Create New Article'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Blog Selection */}
          <div>
            <label htmlFor="blog" className="block text-sm font-medium text-gray-700 mb-2">
              Select Blog
            </label>
            <select
              id="blog"
              value={selectedBlogId}
              onChange={(e) => setSelectedBlogId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isEditing} // Don't allow changing blog when editing
              required
            >
              <option value={0}>Select a blog...</option>
              {blogs.map((blog) => (
                <option key={blog.id} value={blog.id}>
                  {blog.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter article title..."
              required
              data-testid="article-title-input"
            />
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Author name (optional)"
            />
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Summary
            </label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Brief summary of the article (optional)"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              value={formData.body_html}
              onChange={(e) => handleInputChange('body_html', e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="Enter article content (HTML is supported)..."
              required
              data-testid="article-content-textarea"
            />
            <p className="mt-1 text-sm text-gray-500">
              You can use HTML tags for formatting. For example: &lt;h2&gt;Heading&lt;/h2&gt;, &lt;p&gt;Paragraph&lt;/p&gt;, &lt;strong&gt;Bold&lt;/strong&gt;, &lt;em&gt;Italic&lt;/em&gt;
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter tags separated by commas (e.g., web design, tips, tutorial)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => handleInputChange('published', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              data-testid="article-published-checkbox"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Publish immediately
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Cancel
            </button>
            
            <div className="flex space-x-3">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, published: false }));
                    setTimeout(() => {
                      const form = document.querySelector('form') as HTMLFormElement;
                      form?.requestSubmit();
                    }, 100);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={loading}
                  data-testid="save-draft-button"
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </button>
              )}
              
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading}
                data-testid="publish-button"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Article' : 'Publish Article')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}