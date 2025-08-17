import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import BlogForm from '@/components/blog/BlogForm';

export default async function NewBlogPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard/blogs"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Article
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
        <BlogForm />
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Create New Article - Blogen Shopify CMS',
  description: 'Create a new blog article for your Shopify store',
};