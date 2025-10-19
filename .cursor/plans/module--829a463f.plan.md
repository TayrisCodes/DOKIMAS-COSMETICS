<!-- 829a463f-3b10-4e05-a844-cfb6f563f577 13d9bebb-5e02-4e07-8b83-c3754aa992b3 -->
# Phase 6: CMS, Blog & Marketing System

## Database Models

### Create `src/models/CMSPage.ts`

- Schema for dynamic pages with sections array
- Each section: key, title, subtitle, content (HTML), image, CTA fields
- `productsQuery` field for featured products integration (byIds or byQuery)
- `sectionsOrder` array for drag-drop ordering
- Fields: slug, title, sections, sectionsOrder, isPublished, metaTitle, metaDescription
- Reference existing Product model for featured products resolution

### Create `src/models/Blog.ts`

- Schema for blog posts with rich content
- Fields: title, slug (auto-generated), author (ref User), content (HTML), excerpt
- Categories: fixed array ["product-education", "beauty-tips", "expert-advice", "routines", "brand-news"]
- Tags: flexible string array
- Flags: isPublished, featureOnHomepage
- SEO fields: metaTitle, metaDescription
- publishedAt date for scheduling

### Create `src/models/Banner.ts`

- Schema for promotional banners
- Fields: title, subtitle, image (Cloudinary URL), link, active status
- position enum: 'hero' | 'mid' | 'footer'
- Timestamps for created/updated tracking

### Create `src/models/Newsletter.ts`

- Simple subscriber collection
- Fields: email (unique), subscribedAt timestamp
- Index on email for fast lookups

### Create `src/models/SEOSettings.ts`

- Global SEO configuration singleton
- Fields: metaTitle, metaDescription, keywords array, socialPreviewImage
- Updated by admin, used as defaults across site

## Utility Functions

### Create `src/lib/slugify.ts`

- Export slugify function: lowercase, remove special chars, hyphenate spaces
- Use for auto-generating blog slugs and page slugs

### Create `src/lib/cms/validateAdmin.ts`

- Export requireAdmin helper using existing auth pattern
- Check session.user.role === 'admin', throw error if not
- Return session for use in route handlers

### Create `src/lib/cms/uploadToCloudinary.ts`

- Export uploadImage function accepting base64 or file path
- Configure cloudinary.v2 with env vars
- Return secure_url after upload
- Handle errors gracefully

### Create `src/lib/cms/seoUtils.ts`

- Export generateMetadata for Next.js Metadata API
- Export generateJsonLd for Schema.org structured data
- Include helpers for blog articles and product pages

### Create `src/lib/cms/sendNewsletter.ts`

- Export sendNewsletter function for batch email sending
- Accept array of emails, subject, html content
- Send in batches of 50 to avoid rate limits
- Use existing sendEmail from `src/lib/email/index.ts`
- Include List-Unsubscribe header

## API Routes - CMS Pages

### Create `src/app/api/cms/pages/[slug]/route.ts`

**GET** - Public endpoint, fetch page by slug

- Find CMSPage by slug, lean query
- Resolve sectionsOrder to get sections in correct order
- For featured_products sections: query Product model using productsQuery
- Return page with resolved products embedded in sections
- Return 404 if page not found

**PUT** - Admin only, update page

- Validate admin with requireAdmin
- Use zod schema: title, sections, sectionsOrder, metaTitle, metaDescription, isPublished
- findOneAndUpdate with upsert option
- Return updated page

### Create `src/app/api/cms/pages/route.ts`

**POST** - Admin only, create new page

- Validate admin
- zod schema: slug (required), title, sections array, sectionsOrder, meta fields
- Create new CMSPage document
- Return created page

**GET** - List all pages (admin only)

- Return array of pages with basic info for admin dashboard

### Create `src/app/api/cms/pages/[slug]/reorder/route.ts`

**PATCH** - Admin only, reorder sections

- Validate admin
- zod schema: sectionsOrder (array of section keys)
- Update only sectionsOrder field
- Return updated page

## API Routes - Blog

### Create `src/app/api/blogs/route.ts`

**GET** - Public, list published blogs with pagination

- Query params: page, perPage, category, tag, featured
- Filter: isPublished: true
- Support category and tag filters
- Support featured flag for homepage
- Sort by publishedAt descending
- Return posts array and pagination meta

**POST** - Admin only, create blog post

- Validate admin
- zod schema: title, content, excerpt, image, categories, tags, isPublished, featureOnHomepage, metaTitle, metaDescription, publishedAt, notifySubscribers
- Auto-generate slug from title using slugify
- Set publishedAt to now if isPublished and not provided
- If notifySubscribers && isPublished: enqueue newsletter email job
- Return created blog

### Create `src/app/api/blogs/[slug]/route.ts`

**GET** - Public, fetch single blog by slug

- Find by slug where isPublished: true
- Populate author name
- Return 404 if not found
- Return blog with full content

**PUT** - Admin only, update blog

- Validate admin
- zod schema: same fields as POST
- Update publishedAt if changing isPublished from false to true
- Handle notifySubscribers flag
- Return updated blog

**DELETE** - Admin only, soft delete (set isPublished: false)

- Validate admin
- Set isPublished: false, featureOnHomepage: false
- Return success

## API Routes - Banners

### Create `src/app/api/banners/route.ts`

**GET** - Public, list active banners

- Filter: active: true
- Sort by createdAt descending
- Return banners array

**POST** - Admin only, create banner

- Validate admin
- zod schema: title, subtitle, image (required), link, position, active
- Assume image already uploaded to Cloudinary by client
- Create banner document
- Return created banner

### Create `src/app/api/banners/[id]/route.ts`

**PUT** - Admin only, update banner

- Validate admin
- Update banner fields
- Return updated banner

**DELETE** - Admin only, soft delete (set active: false)

- Validate admin
- Set active: false
- Return success

## API Routes - Newsletter

### Create `src/app/api/newsletter/route.ts`

**POST** - Public, subscribe to newsletter

- zod schema: email (valid email)
- Check if email already exists (idempotent)
- Create Newsletter document if new
- Return success message

### Create `src/app/api/newsletter/unsubscribe/route.ts`

**POST** - Public, unsubscribe from newsletter

- zod schema: email
- Delete Newsletter document
- Return success

### Create `src/app/api/newsletter/send/route.ts`

**POST** - Admin only, broadcast newsletter

- Validate admin
- zod schema: subject, html, segment ('all' | 'subscribers' | 'top-buyers')
- Fetch email list based on segment
- For 'subscribers': query Newsletter collection
- For 'top-buyers': query CustomerActivity for top spenders (from Module 5)
- Call sendNewsletter in batches
- Return count of emails sent

## API Routes - SEO

### Create `src/app/api/seo/route.ts`

**GET** - Public, fetch global SEO settings

- Find single SEOSettings document
- Return seo object or null

**PUT** - Admin only, update SEO settings

- Validate admin
- zod schema: metaTitle, metaDescription, keywords, socialPreviewImage
- findOneAndUpdate with upsert
- Return updated settings

## Admin Dashboard Pages

### Create `src/app/dashboard/admin/marketing/page.tsx`

- Marketing hub overview page
- Display stats: total pages, published blogs, active banners, newsletter subscribers
- Quick links to homepage editor, blogs, banners, newsletter, SEO manager
- Recent activity feed

### Create `src/app/dashboard/admin/marketing/homepage/page.tsx`

- Homepage editor with drag-and-drop interface
- Fetch CMSPage for slug 'home' on mount
- Left panel: list of sections with drag handles (use @dnd-kit/core)
- Each section card: icon, title, active toggle, edit button, delete button
- Main panel: preview of selected section or full page preview
- Edit section modal/drawer with TipTap editor for content field
- Image upload button calling uploadToCloudinary
- Product picker for featured_products sections (search and multi-select)
- CTA fields editor
- Settings panel for section-specific options
- Save button calls PUT /api/cms/pages/home
- Reorder on drag calls PATCH /api/cms/pages/home/reorder
- Add section button with template selector

### Create `src/app/dashboard/admin/blogs/page.tsx`

- Blog list page with filters
- Tabs: All, Published, Drafts, Featured
- Search by title
- Filter by category dropdown
- Table columns: title, categories, status, publishedAt, actions
- Actions: Edit, Toggle Featured, Delete
- Create New Blog button opening create page

### Create `src/app/dashboard/admin/blogs/[slug]/page.tsx`

- Blog create/edit form page
- Title input (auto-generates slug, show slug preview)
- TipTap rich text editor for content
- Excerpt textarea
- Image upload with preview
- Categories multi-select (fixed options)
- Tags input (comma-separated or tag chips)
- Feature on homepage checkbox
- SEO fields: metaTitle, metaDescription
- Schedule publish date picker
- Notify subscribers checkbox
- Save as Draft vs Publish buttons

### Create `src/app/dashboard/admin/banners/page.tsx`

- Banner management page
- Active/Inactive tabs
- Banner cards with image preview, title, position badge
- Actions: Edit, Toggle Active, Delete
- Create Banner button opening form modal
- Form: title, subtitle, image upload, link, position select
- Preview mode showing banner in context

### Create `src/app/dashboard/admin/newsletter/page.tsx`

- Newsletter management page
- Stats: total subscribers, growth rate
- Compose newsletter section with TipTap editor
- Subject line input
- Segment selector: All, Subscribers Only, Top Buyers
- Preview button showing email preview
- Schedule or Send Now buttons
- Email history table: subject, sent date, recipients count, open rate (if tracking)

### Create `src/app/dashboard/admin/seo/page.tsx`

- SEO Manager page
- Global settings form: default metaTitle, metaDescription, keywords
- Social preview image upload
- Preview cards showing how site appears in Google, Twitter, Facebook
- Per-page SEO overrides list (links to edit pages/blogs)
- Sitemap generation status
- robots.txt editor

## Admin Components

### Create `src/components/cms/TipTapEditor.tsx`

- Client component wrapping TipTap editor
- Props: content, onChange, placeholder
- Toolbar: bold, italic, underline, headings, lists, links, images
- Image upload integration with Cloudinary
- HTML output mode
- Styling with Tailwind to match dashboard theme

### Create `src/components/cms/SectionCard.tsx`

- Display section in list with drag handle
- Props: section, onEdit, onToggle, onDelete, dragHandleProps
- Show icon based on section.key
- Title, active status badge
- Action buttons

### Create `src/components/cms/ProductPicker.tsx`

- Client component for selecting products
- Search input calling GET /api/products?search=...
- Display results with product cards
- Multi-select with checkboxes
- Selected products list with remove buttons
- Props: selectedIds, onChange

### Create `src/components/cms/PreviewPanel.tsx`

- Preview component rendering section as it appears on public site
- Props: section, mode ('desktop' | 'mobile')
- Use same components as public site but in preview container
- Device frame with responsive scaling

### Create `src/components/cms/ImageUpload.tsx`

- Reusable image upload component
- Drag-drop zone or file picker
- Upload to Cloudinary on select
- Show loading state and progress
- Display preview after upload
- Props: value (URL), onChange, onRemove

### Create `src/components/cms/SEOPreview.tsx`

- Visual preview of SEO metadata
- Props: title, description, image, url
- Show Google search result preview
- Show social media card previews (Twitter, Facebook)

## Public Site Pages

### Update `src/app/page.tsx`

- Homepage server component
- Fetch GET /api/cms/pages/home
- Map sections to components based on section.key
- Render sections in sectionsOrder
- Generate metadata using page.metaTitle/metaDescription

### Create `src/app/blog/page.tsx`

- Blog list page server component
- Fetch GET /api/blogs with pagination
- Display blog cards in grid
- Category filter sidebar
- Pagination controls
- Generate metadata for blog listing page

### Create `src/app/blog/[slug]/page.tsx`

- Blog detail page server component
- Fetch GET /api/blogs/[slug]
- Render blog content with rich formatting
- Author info, publish date, categories, tags
- Related posts section
- Share buttons
- Generate metadata using blog.metaTitle/metaDescription
- Include JSON-LD structured data for Article

## Public Site Components

### Create `src/components/public/HeroSection.tsx`

- Render hero section from CMS
- Props: section (title, subtitle, content, image, ctaText, ctaUrl)
- Full-width background image
- Centered text with gradient overlay
- Animated CTA button
- Responsive design

### Create `src/components/public/AboutSection.tsx`

- Render about section from CMS
- Props: section (title, content, image)
- Two-column layout: image + text
- Render HTML content safely
- Responsive stack on mobile

### Create `src/components/public/FeaturedProductsSection.tsx`

- Render products from CMS section
- Props: section (title, products array)
- Product grid using existing ProductCard component
- Show 'View All' link
- Responsive grid (1-2-3-4 columns)

### Create `src/components/public/TestimonialsSection.tsx`

- Render testimonials from CMS
- Props: section (content contains testimonial data)
- Carousel or grid of testimonial cards
- Customer name, photo, quote
- Star ratings

### Create `src/components/public/BannerCarousel.tsx`

- Render banners as carousel
- Fetch from GET /api/banners
- Auto-rotate every 5 seconds
- Navigation dots
- Click to navigate to banner.link

### Create `src/components/public/NewsletterSignup.tsx`

- Newsletter subscription form
- Email input with validation
- Submit to POST /api/newsletter
- Success/error toast notifications
- Privacy notice text

### Create `src/components/public/BlogCard.tsx`

- Blog preview card component
- Props: blog (title, slug, excerpt, image, publishedAt)
- Image, title, excerpt, read more link
- Category badges
- Publish date
- Hover effects

## Email Queue Integration

### Create `src/lib/queue/emailQueue.ts`

- Setup BullMQ queue for newsletter emails
- Export emailQueue instance
- Add jobs: 'newsletter-broadcast', 'blog-notification'
- Connection to existing Redis instance

### Create `src/lib/queue/workers/emailWorker.ts`

- BullMQ worker processing email jobs
- Process newsletter-broadcast: batch send to recipients
- Process blog-notification: send new post to subscribers
- Retry failed sends with exponential backoff
- Log success/failures

## Seed Script

### Create `scripts/seedCms.js`

- Node.js script to import CMS content from JSON
- Accept file path and --dry-run flag as args
- Load .env for MongoDB connection
- Import CMSPage (homepage with 9 sections), Banners, Blogs
- Resolve product slugs to ObjectIds for featured_products sections
- Warn if product slug not found
- Usage: `node scripts/seedCms.js scripts/seedCms.example.json --dry-run`

### Create `scripts/seedCms.example.json`

- Example content JSON with:
- Homepage sections: hero, about, shop_cta, featured_products, blog_highlights, testimonials, promotions, newsletter_signup, footer
- 2-3 sample banners
- 3-5 sample blog posts across different categories
- Product slugs as placeholders (to be resolved by script)

## Integration with Existing Systems

### Update existing Product API

- Ensure GET /api/products supports search param for ProductPicker
- Return minimal fields for picker: _id, name, slug, price, images[0]

### Integration with Module 5 CRM

- Newsletter send to 'top-buyers' segment queries CustomerActivity
- Use existing totalSpent field to identify top customers

## Package Dependencies

### Install new packages

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install bullmq ioredis
npm install sanitize-html
```

## Environment Variables

Add to `.env.local`:

```
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Testing Requirements

- Test homepage CMS: create sections, reorder, publish
- Test blog: create draft, publish, feature on homepage, schedule
- Test banners: create, activate, display on site
- Test newsletter: subscribe, unsubscribe, send broadcast
- Test SEO: update global settings, verify metadata on pages
- Test product picker in CMS
- Test seed script with dry-run and actual import
- Test email queue processing
- Test public pages rendering with CMS content

### To-dos

- [ ] Create Sale model and update Order model with inventory hooks
- [ ] Create inventory API routes (list, update, low-stock, history)
- [ ] Create sales and POS API routes with stock reduction logic
- [ ] Create analytics API routes (dashboard stats, revenue, products)
- [ ] Create cron endpoints for scheduled email reports
- [ ] Create inventory and analytics utility functions
- [ ] Build POS interface for retail managers
- [ ] Create inventory management dashboards (admin and retail)
- [ ] Build analytics dashboards with charts and date filters
- [ ] Create Charts, StatCard, tables, and banner components
- [ ] Create email report templates and automation functions
- [ ] Integrate stock reduction into payment approval flow
- [ ] Create product seeder script for realistic testing
- [ ] Test complete inventory automation and analytics flow