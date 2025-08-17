# Blogen Shopify CMS Documentation

Welcome to the comprehensive documentation for Blogen Shopify CMS - a modern Next.js + Supabase blog generation CMS with integrated Shopify publishing capabilities.

## 📚 Documentation Structure

### Quick Start
- [Environment Variables Setup](./environment-variables.md) - Configure your development environment
- [Supabase Setup](./supabase-setup.md) - Database and backend configuration
- [Vercel Deployment](./vercel-deployment.md) - Production deployment guide

### Operations & Maintenance
- [Deployment Status & Troubleshooting](./deployment-status.md) - Monitor and debug deployments

## 🚀 Getting Started

1. **Prerequisites**
   - Node.js 18+ installed
   - Git for version control
   - Supabase account
   - Shopify Partner account (for store integration)

2. **Quick Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/gaurav18115/blogen-shopify-cms.git
   cd blogen-shopify-cms

   # Install dependencies
   npm install

   # Set up environment variables (see environment-variables.md)
   cp .env.example .env.local

   # Start development server
   npm run dev
   ```

3. **Next Steps**
   - Follow the [Environment Variables Guide](./environment-variables.md)
   - Set up [Supabase backend](./supabase-setup.md)
   - Configure [Shopify integration](./supabase-setup.md#shopify-integration)

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Integration**: Shopify Admin API & Storefront API
- **Deployment**: Vercel (recommended), with Supabase managed services

### Key Features
- Rich text blog post editor
- Shopify store integration
- User authentication and role management
- Media library with image optimization
- SEO optimization tools
- Real-time collaboration
- Automated publishing workflows

## 📖 Documentation Sections

### Setup & Configuration
- **[Environment Variables](./environment-variables.md)** - Complete environment setup
- **[Supabase Setup](./supabase-setup.md)** - Database schema, auth, and configuration
- **[Vercel Deployment](./vercel-deployment.md)** - Production deployment steps

### Operations
- **[Deployment Status](./deployment-status.md)** - Monitoring, troubleshooting, and maintenance

## 🛠️ Development Workflow

1. **Local Development**
   ```bash
   npm run dev          # Start development server
   npm run type-check   # TypeScript type checking
   npm run lint         # Code linting
   ```

2. **Testing**
   ```bash
   npm run test         # Run Playwright tests
   npm run test:headed  # Run tests with browser UI
   npm run test:ui      # Run tests with Playwright UI
   ```

3. **Production Build**
   ```bash
   npm run build        # Build for production
   npm run start        # Start production server locally
   ```

## 🔐 Security & Best Practices

- **Environment Variables**: Never commit sensitive keys to version control
- **Database Security**: Use Row Level Security (RLS) policies in Supabase
- **API Security**: Implement proper authentication and rate limiting
- **Content Security**: Sanitize user input and implement proper validation

## 📞 Support & Resources

### Getting Help
- **Issues**: Create an issue on [GitHub](https://github.com/gaurav18115/blogen-shopify-cms/issues)
- **Discussions**: Join discussions for questions and feature requests
- **Documentation**: Refer to the guides in this documentation folder

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shopify Partner Documentation](https://partners.shopify.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: December 2024
**Version**: 0.1.0

For questions and support, please create an issue on [GitHub](https://github.com/gaurav18115/blogen-shopify-cms/issues).