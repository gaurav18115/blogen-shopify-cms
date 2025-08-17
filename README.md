# Blogen Shopify CMS

A comprehensive Next.js + Supabase blog generation CMS with integrated Shopify publishing capabilities.

## 🚀 Project Overview

Blogen Shopify CMS is a modern, full-stack content management system that enables seamless blog creation and publication with direct integration to Shopify stores. The system leverages Next.js for the frontend, Supabase for backend services, and provides automated publishing workflows to Shopify's blog infrastructure.

## 🏗️ Architecture & Technology Stack

### Frontend

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Framer Motion** - Animation library

### Backend

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Edge functions

### Integrations

- **Shopify Admin API** - Store integration
- **Shopify Storefront API** - Frontend data access
- **Webhooks** - Real-time synchronization
- **Rich Text Editor** - Content creation
- **Image Upload & Management** - Media handling

## 📊 Database Schema

### Core Tables

```sql
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  shopify_store_url text,
  shopify_access_token text encrypted,
  role text default 'editor',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Blog posts table
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id),
  title text not null,
  slug text unique not null,
  excerpt text,
  content jsonb not null, -- Rich text content
  featured_image text,
  status text default 'draft', -- draft, published, scheduled
  tags text[],
  meta_title text,
  meta_description text,
  shopify_blog_id bigint,
  shopify_article_id bigint,
  published_at timestamp with time zone,
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  parent_id uuid references public.categories(id),
  created_at timestamp with time zone default now()
);

-- Media library table
create table public.media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_name text not null,
  mime_type text not null,
  size integer not null,
  url text not null,
  alt_text text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Shopify stores table
create table public.shopify_stores (
  id uuid primary key default gen_random_uuid(),
  store_domain text unique not null,
  access_token text encrypted not null,
  owner_id uuid references public.profiles(id),
  store_name text,
  email text,
  currency text,
  timezone text,
  webhook_verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## 🔐 Authentication & Authorization

### Authentication Methods

- Email/Password authentication
- OAuth providers (Google, GitHub)
- Magic link authentication
- JWT-based session management

### Role-Based Access Control

- **Super Admin**: Full system access
- **Admin**: Store management, user management
- **Editor**: Content creation and editing
- **Contributor**: Content creation only
- **Viewer**: Read-only access

### Row Level Security Policies

```sql
-- Users can only view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Authors can manage their own posts
create policy "Authors can manage own posts" on posts
  for all using (auth.uid() = author_id);

-- Admins can manage all posts
create policy "Admins can manage all posts" on posts
  for all using (exists (
    select 1 from profiles 
    where id = auth.uid() and role in ('admin', 'super_admin')
  ));
```

## 🔄 Shopify Integration

### API Integration

- **Admin API 2024-01** - Store management
- **Storefront API** - Public data access
- **Webhook endpoints** - Real-time updates
- **OAuth 2.0** - Secure authentication

### Supported Operations

- Blog creation and management
- Article publishing and updating
- Image upload to Shopify
- SEO metadata synchronization
- Comment management
- Category/tag synchronization

### Webhook Events

- `blogs/create` - Blog creation
- `blogs/update` - Blog updates
- `blogs/delete` - Blog deletion
- `articles/create` - Article creation
- `articles/update` - Article updates
- `articles/delete` - Article deletion

## 📝 Content Management Features

### Rich Text Editor

- **TipTap** or **Lexical** based editor
- Block-style editing
- Markdown support
- Image embedding
- Code syntax highlighting
- Link management
- Table support

### Content Workflow

1. **Draft Creation** - Initial content creation
2. **Review Process** - Editorial review (optional)
3. **SEO Optimization** - Meta tags, descriptions
4. **Scheduling** - Future publication dates
5. **Publishing** - Live content deployment
6. **Shopify Sync** - Automatic synchronization

### Media Management

- Drag & drop file upload
- Image optimization and resizing
- CDN integration via Supabase Storage
- Alt text and metadata management
- Bulk operations

## 🎨 User Interface & Experience

### Design System

- Consistent color palette
- Typography scale
- Component library
- Responsive breakpoints
- Accessibility (WCAG 2.1 AA)
- Dark/light mode support

### Key Interfaces

- **Dashboard** - Overview and analytics
- **Post Editor** - Content creation interface
- **Media Library** - Asset management
- **Settings** - Configuration panels
- **User Management** - Team collaboration
- **Shopify Integration** - Store connection

## 🔧 Development Setup

### Prerequisites

```bash
Node.js 18+
npm or yarn
Supabase CLI
Git
```

### Environment Variables

```env
# Next.js
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Shopify
SHOPIFY_APP_KEY=your_shopify_app_key
SHOPIFY_APP_SECRET=your_shopify_app_secret
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Encryption
ENCRYPTION_KEY=your_encryption_key

# CDN/Storage
NEXT_PUBLIC_CDN_URL=your_cdn_url
```

### Installation & Setup

```bash
# Clone repository
git clone https://github.com/gaurav18115/blogen-shopify-cms.git
cd blogen-shopify-cms

# Install dependencies
npm install

# Set up Supabase
supabase init
supabase start
supabase db push

# Run development server
npm run dev
```

## 🚀 Deployment

### Production Deployment

- **Vercel** (recommended for Next.js)
- **Netlify** alternative
- **Railway** for full-stack deployment
- **Docker** containerization support

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/action@v25
```

## 📊 Monitoring & Analytics

### Performance Monitoring

- Vercel Analytics
- Core Web Vitals tracking
- Error boundary implementation
- Performance budgets

### Business Analytics

- Post engagement metrics
- User activity tracking
- Content performance analysis
- Shopify synchronization logs

## 🔒 Security Considerations

### Data Protection

- End-to-end encryption for sensitive data
- Secure token storage
- HTTPS enforcement
- CORS configuration
- Rate limiting

### Compliance

- GDPR compliance measures
- Data retention policies
- User consent management
- Audit logging

## 📋 Testing Strategy

### Testing Types

- Unit tests (Jest + Testing Library)
- Integration tests (Cypress)
- E2E tests (Playwright)
- API tests (Postman/Newman)
- Performance tests (Lighthouse CI)

### Quality Assurance

- TypeScript strict mode
- ESLint + Prettier
- Husky pre-commit hooks
- Automated testing in CI
- Code coverage reporting

## 📚 API Documentation

### REST Endpoints

```http
GET    /api/posts              # List posts
POST   /api/posts              # Create post
GET    /api/posts/:id          # Get post
PUT    /api/posts/:id          # Update post
DELETE /api/posts/:id          # Delete post

GET    /api/media              # List media
POST   /api/media/upload       # Upload media
DELETE /api/media/:id          # Delete media

POST   /api/shopify/connect    # Connect Shopify store
POST   /api/shopify/publish    # Publish to Shopify
POST   /api/webhooks/shopify   # Shopify webhooks
```

### GraphQL Queries

```graphql
query GetPosts($limit: Int, $offset: Int) {
  posts(limit: $limit, offset: $offset) {
    id
    title
    slug
    excerpt
    status
    created_at
    author {
      full_name
      avatar_url
    }
  }
}

mutation CreatePost($input: PostInput!) {
  createPost(input: $input) {
    id
    title
    slug
    status
  }
}
```

## 🛣️ Roadmap

### Phase 1 - Core CMS (MVP)

- [ ] User authentication
- [ ] Basic post creation/editing
- [ ] Shopify integration
- [ ] Media management
- [ ] Publishing workflow

### Phase 2 - Enhanced Features

- [ ] Advanced rich text editor
- [ ] SEO optimization tools
- [ ] Content scheduling
- [ ] Multi-user collaboration
- [ ] Analytics dashboard

### Phase 3 - Advanced Capabilities

- [ ] Multi-language support
- [ ] Advanced workflow management
- [ ] Custom fields and templates
- [ ] API rate limiting
- [ ] Advanced analytics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Join our Discord community
- Email: [support@blogen-cms.com](mailto:support@blogen-cms.com)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the excellent backend platform
- Shopify for their comprehensive APIs
- Open source community for inspiration and tools
# Force rebuild Mon Aug 18 00:58:09 IST 2025
