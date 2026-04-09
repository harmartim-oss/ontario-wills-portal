# Ontario Wills & Power of Attorney Creator - Development TODO

## Phase 1: Design System & Branding
- [ ] Set up navy and slate color palette in Tailwind CSS
- [ ] Configure global typography and font system
- [ ] Create reusable component library with shadcn/ui
- [ ] Establish spacing, shadows, and border radius system
- [ ] Set up theme configuration and CSS variables

## Phase 2: Marketing Landing Page
- [ ] Build hero section with compelling headline and CTA
- [ ] Create feature highlights section (Interactive Family Tree, AI Clause Optimizer, Live Tax Estimator)
- [ ] Add social proof section (testimonials, user count, trust badges)
- [ ] Implement pricing preview section with link to full pricing page
- [ ] Add FAQ section
- [ ] Create footer with links and company info
- [ ] Optimize for mobile responsiveness

## Phase 3: Authentication & Account Management
- [ ] Implement Manus OAuth login flow
- [ ] Create sign-up page with account creation
- [ ] Build login page
- [ ] Implement logout functionality
- [ ] Create password reset flow (if applicable)
- [ ] Add session management and token handling
- [ ] Build account verification/email confirmation (if needed)

## Phase 4: Pricing & Plans Section
- [ ] Design pricing page layout
- [ ] Create Free tier details and features
- [ ] Create Premium tier details and features
- [ ] Build side-by-side feature comparison table
- [ ] Add upgrade/downgrade buttons
- [ ] Implement plan selection logic
- [ ] Add FAQ for pricing questions

## Phase 5: Authenticated User Dashboard
- [ ] Build dashboard layout with sidebar navigation
- [ ] Create dashboard home page with estate summary
- [ ] Display saved documents list
- [ ] Show re-balancing alerts widget
- [ ] Add quick action buttons
- [ ] Implement document filtering and search
- [ ] Create empty state designs

## Phase 6: Document Management
- [ ] Create document list page with sorting/filtering
- [ ] Build "Create New Document" flow
- [ ] Implement document viewer/editor page
- [ ] Add document download functionality (PDF)
- [ ] Create document sharing/permissions system
- [ ] Build document versioning/history
- [ ] Implement document deletion with confirmation

## Phase 7: AI Legal Assistant Chat
- [ ] Design chat interface layout
- [ ] Implement message input and sending
- [ ] Create message display with formatting
- [ ] Add streaming support for AI responses
- [ ] Build chat history persistence
- [ ] Implement context awareness (document-specific questions)
- [ ] Add chat clearing and new conversation options
- [ ] Style chat messages with proper formatting

## Phase 8: About / How It Works Page
- [ ] Create page layout and navigation
- [ ] Write Ontario legal compliance section
- [ ] Document security practices and data protection
- [ ] Create step-by-step process guide
- [ ] Add feature explanations
- [ ] Include trust and credibility elements
- [ ] Add links to legal resources
- [ ] Optimize for SEO

## Phase 9: User Profile & Settings
- [ ] Build profile page with user information
- [ ] Create account settings page
- [ ] Implement profile picture upload
- [ ] Add notification preferences
- [ ] Create privacy settings
- [ ] Build account deletion option
- [ ] Add two-factor authentication (if applicable)
- [ ] Implement password change functionality

## Phase 10: Responsive Design & Testing
- [ ] Test all pages on mobile devices
- [ ] Verify touch interactions and mobile navigation
- [ ] Test form inputs on mobile
- [ ] Optimize images for mobile
- [ ] Test chat interface on mobile
- [ ] Verify document viewing on mobile
- [ ] Test all CTAs and navigation flows
- [ ] Performance optimization

## Phase 11: Final Polish & Delivery
- [ ] Code cleanup and formatting
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Accessibility audit (WCAG compliance)
- [ ] Cross-browser testing
- [ ] Final visual polish and refinement
- [ ] Documentation and deployment guide
- [ ] Create checkpoint and prepare for launch

## Database Schema
- [ ] Users table with OAuth integration
- [ ] Documents table (Wills, POAs)
- [ ] Document versions table
- [ ] Chat history table
- [ ] User preferences table
- [ ] Subscription/plan table

## Backend API Endpoints (tRPC Procedures)
- [ ] auth.me - Get current user
- [ ] auth.logout - Logout user
- [ ] documents.list - Get user's documents
- [ ] documents.create - Create new document
- [ ] documents.get - Get specific document
- [ ] documents.update - Update document
- [ ] documents.delete - Delete document
- [ ] documents.download - Generate PDF
- [ ] chat.sendMessage - Send chat message
- [ ] chat.getHistory - Get chat history
- [ ] user.getProfile - Get user profile
- [ ] user.updateProfile - Update profile
- [ ] user.updateSettings - Update settings
- [ ] subscription.getCurrentPlan - Get current plan
- [ ] subscription.upgradePlan - Upgrade to premium

## Completed Features
(None yet - tracking as we build)
