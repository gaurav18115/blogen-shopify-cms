import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function DashboardPage() {
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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Blogen CMS Dashboard
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
              <form action="/api/auth/logout" method="GET">
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Welcome card */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Welcome to Blogen CMS! 🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  You&apos;ve successfully connected your Shopify store. Your blog management system is ready to use.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        <strong>Store Connected:</strong> {user.shopify_store_name}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Domain: {user.shopify_store_url}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Store info */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Store Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Store Name</dt>
                    <dd className="text-sm text-gray-900">{user.shopify_store_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Domain</dt>
                    <dd className="text-sm text-gray-900">{user.shopify_store_url}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Your Role</dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {user.role.replace('_', ' ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <a href="/dashboard/blogs/new" className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded border border-gray-200 transition-colors">
                    📝 Create New Article
                  </a>
                  <a href="/dashboard/blogs" className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded border border-gray-200 transition-colors">
                    📖 Manage Articles
                  </a>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded border border-gray-200 opacity-50 cursor-not-allowed">
                    📸 Media Library (Coming Soon)
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded border border-gray-200 opacity-50 cursor-not-allowed">
                    ⚙️ Settings (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Blog Management Actions */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Blog Management 📖
                </h3>
                <a 
                  href="/dashboard/blogs" 
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View All →
                </a>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a 
                  href="/dashboard/blogs/new"
                  className="group p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-lg mb-4 group-hover:bg-indigo-700 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Create New Article</h4>
                  <p className="text-sm text-gray-600">
                    Start writing a new blog post for your Shopify store
                  </p>
                </a>
                
                <a 
                  href="/dashboard/blogs"
                  className="group p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4 group-hover:bg-green-700 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Manage Articles</h4>
                  <p className="text-sm text-gray-600">
                    View, edit, and manage all your blog articles
                  </p>
                </a>
                
                <div className="p-6 border border-gray-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 opacity-60">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-400 rounded-lg mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-700 mb-2">Analytics</h4>
                  <p className="text-sm text-gray-500">
                    Track your blog performance (Coming Soon)
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Features */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Coming Soon 🚀
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Rich Text Editor</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    WYSIWYG editor with advanced formatting options
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Media Library</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload and organize images for your blog posts
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">SEO Tools</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Optimize your content for search engines
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Scheduled Publishing</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Schedule articles to publish at specific times
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Dashboard - Blogen Shopify CMS',
  description: 'Manage your Shopify blog content',
};