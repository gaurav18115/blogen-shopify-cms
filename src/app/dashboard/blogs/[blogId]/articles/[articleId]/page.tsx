import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import EditArticlePage from './EditArticlePage';

interface PageProps {
  params: {
    blogId: string;
    articleId: string;
  };
}

export default async function EditArticlePageWrapper({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  const blogId = parseInt(params.blogId);
  const articleId = parseInt(params.articleId);

  if (isNaN(blogId) || isNaN(articleId)) {
    redirect('/dashboard/blogs');
  }

  return (
    <EditArticlePage 
      user={user} 
      blogId={blogId} 
      articleId={articleId} 
    />
  );
}

export const metadata = {
  title: 'Edit Article - Blogen Shopify CMS',
  description: 'Edit your blog article',
};