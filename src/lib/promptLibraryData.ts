export type PromptLibraryCategoryKey =
  | "youtube"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "twitter"
  | "tiktok"
  | "shopify"
  | "amazon"
  | "flipkart"
  | "seo"
  | "blog-writing"
  | "copywriting"
  | "email-writing"
  | "business"
  | "startup"
  | "marketing"
  | "sales"
  | "coding"
  | "python"
  | "javascript"
  | "chatgpt"
  | "claude"
  | "gemini"
  | "image-generation"
  | "education";

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  starterPrompt: string;
  keywords: string[];
  difficulty: "Beginner" | "Intermediate" | "Expert";
  popularity: number;
  trending: boolean;
  new: boolean;
  aiModels: string[];
  icon: string;
}

export interface PromptLibraryCategoryConfig {
  key: PromptLibraryCategoryKey;
  name: string;
  description: string;
  templates: PromptTemplate[];
}

function makeTemplate(
  id: string,
  title: string,
  description: string,
  starterPrompt: string,
  keywords: string[],
  difficulty: "Beginner" | "Intermediate" | "Expert" = "Beginner",
  popularity = 70,
  trending = false,
  isNew = false,
  aiModels: string[] = ["GPT-4.1", "Claude 3.5"],
  icon = "✨",
): PromptTemplate {
  return {
    id,
    title,
    category: "General",
    description,
    starterPrompt,
    keywords,
    difficulty,
    popularity,
    trending,
    new: isNew,
    aiModels,
    icon,
  };
}

export const promptLibraryData: PromptLibraryCategoryConfig[] = [
  {
    key: "youtube",
    name: "YouTube",
    description: "Video hooks, scripts, titles, and descriptions",
    templates: [
      makeTemplate("yt-hook", "YouTube Hook Creator", "Create a powerful video opener", "Create a curiosity-driven YouTube hook for a short video about building a personal brand in 2026.", ["hook", "youtube", "video", "intro"]),
      makeTemplate("yt-script", "Video Script Outline", "Structure a full video with scenes", "Write a clean YouTube video script outline for a tutorial on using AI tools for content creators.", ["script", "outline", "tutorial", "video"]),
      makeTemplate("yt-title", "Title Generator", "Generate click-worthy titles", "Generate 10 binge-worthy YouTube titles for a video about beginner productivity systems.", ["title", "clicks", "viral", "video"]),
      makeTemplate("yt-description", "SEO Description", "Write descriptions that improve discoverability", "Write an SEO-friendly YouTube description for a video about creating content with ChatGPT.", ["description", "seo", "discoverability", "video"]),
      makeTemplate("yt-thumbnail", "Thumbnail Copy", "Create concise thumbnail text", "Write 5 short thumbnail text ideas for a YouTube video about side hustles for students.", ["thumbnail", "text", "click", "video"]),
      makeTemplate("yt-cta", "Call to Action", "Add strong closing prompts", "Write a compelling CTA for the end of a YouTube video about learning digital marketing.", ["cta", "call to action", "end screen", "engagement"]),
      makeTemplate("yt-short", "Shorts Concept", "Create Shorts concepts with hooks", "Create 5 YouTube Shorts concepts for a channel about minimalism and digital decluttering.", ["shorts", "reel", "quick", "content"]),
      makeTemplate("yt-episode", "Episode Planner", "Plan multi-part series content", "Create a 6-part YouTube series plan for teaching beginner coding without overwhelming the audience.", ["series", "plan", "episode", "content"]),
      makeTemplate("yt-review", "Review Prompt", "Create review-style video prompts", "Write a review video prompt for a productivity app that helps people manage daily tasks.", ["review", "app", "comparison", "video"]),
      makeTemplate("yt-community", "Community Post", "Build audience engagement prompts", "Create a YouTube community post that encourages viewers to share their biggest productivity challenge.", ["community", "engagement", "audience", "discussion"]),
    ],
  },
  {
    key: "instagram",
    name: "Instagram",
    description: "Captions, Reels, carousels, and story ideas",
    templates: [
      makeTemplate("ig-caption", "Caption Writer", "Create strong post captions", "Write an Instagram caption for a skincare brand launching a new product for stressed-out professionals.", ["caption", "post", "brand", "engagement"]),
      makeTemplate("ig-reel", "Reel Concept", "Design short-form video ideas", "Create a high-energy Instagram Reel concept for a fitness brand promoting a 7-day challenge.", ["reel", "video", "challenge", "content"]),
      makeTemplate("ig-carousel", "Carousel Builder", "Structure carousel posts", "Create a 7-slide Instagram carousel about beginner tips for building confidence in public speaking.", ["carousel", "slides", "tips", "content"]),
      makeTemplate("ig-story", "Story Sequence", "Plan interactive stories", "Write a 5-frame Instagram story sequence for a coffee shop promoting a weekend special.", ["story", "frames", "promotion", "interactive"]),
      makeTemplate("ig-hook", "Hook Creator", "Craft first-line hooks", "Create 10 attention-grabbing Instagram hooks for a post about productivity habits.", ["hook", "first line", "attention", "social"]),
      makeTemplate("ig-promo", "Promotion Prompt", "Create promotional content", "Write an Instagram promotional post for a fashion brand launching a limited edition collection.", ["promotion", "fashion", "launch", "brand"]),
      makeTemplate("ig-ugc", "UGC Prompt", "Generate user-generated content ideas", "Generate UGC-style Instagram post ideas for a sustainable clothing brand.", ["ugc", "user generated", "social", "brand"]),
      makeTemplate("ig-cta", "Engagement CTA", "Encourage audience responses", "Write an Instagram CTA that encourages followers to comment their favorite study tip.", ["cta", "engagement", "followers", "comment"]),
      makeTemplate("ig-launch", "Launch Post", "Draft launch announcements", "Create an Instagram launch post for a new AI productivity app.", ["launch", "announcement", "app", "product"]),
      makeTemplate("ig-aesthetic", "Aesthetic Prompt", "Create visual mood prompts", "Write an Instagram aesthetic prompt for a luxury skincare brand with calm minimal styling.", ["aesthetic", "visual", "mood", "brand"]),
    ],
  },
  {
    key: "facebook",
    name: "Facebook",
    description: "Community posts, ads, and engagement content",
    templates: [
      makeTemplate("fb-post", "Facebook Post", "Create polished community posts", "Write a Facebook post for a local bakery announcing a weekend discount and community event.", ["post", "community", "local", "event"]),
      makeTemplate("fb-ad", "Ad Copy", "Write ad copy for Facebook campaigns", "Create Facebook ad copy for a SaaS product targeting small business owners.", ["ad", "copy", "campaign", "facebook"]),
      makeTemplate("fb-group", "Group Post", "Create helpful group content", "Write a Facebook group post that offers practical advice on remote work productivity.", ["group", "community", "advice", "work"]),
      makeTemplate("fb-event", "Event Invitation", "Promote events", "Create a Facebook event invitation for a networking meetup for creators.", ["event", "invite", "networking", "meetup"]),
      makeTemplate("fb-story", "Story Prompt", "Create story content", "Write a Facebook story sequence for a bookstore launching a reading challenge.", ["story", "series", "challenge", "engagement"]),
      makeTemplate("fb-feedback", "Feedback Request", "Solicit audience feedback", "Write a Facebook post asking followers for feedback on a new app feature.", ["feedback", "audience", "feature", "survey"]),
      makeTemplate("fb-launch", "Launch Announcement", "Announce new offerings", "Create a Facebook launch announcement for a new online coaching program.", ["launch", "announcement", "program", "coaching"]),
      makeTemplate("fb-sale", "Sales Post", "Create sales-oriented content", "Write a Facebook sales post for a premium planner brand during a seasonal promotion.", ["sales", "promotion", "planner", "offer"]),
      makeTemplate("fb-education", "Educational Post", "Create informative posts", "Create a Facebook educational post explaining the benefits of meditation for busy professionals.", ["educational", "informative", "meditation", "professionals"]),
      makeTemplate("fb-promo", "Promo Bundle", "Bundle offers into one message", "Write a Facebook promotional bundle post for a fitness membership with bonus perks.", ["bundle", "promo", "fitness", "offer"]),
    ],
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    description: "Professional posts, thought leadership, and outreach",
    templates: [
      makeTemplate("li-post", "LinkedIn Post", "Write polished professional posts", "Write a LinkedIn post about how founders can build stronger remote teams.", ["post", "professional", "leadership", "network"]),
      makeTemplate("li-opinion", "Thought Leadership", "Create authority-building content", "Create a thought leadership post on why AI literacy matters for modern teams.", ["thought leadership", "opinion", "ai", "leadership"]),
      makeTemplate("li-connection", "Connection Message", "Write networking outreach", "Write a thoughtful LinkedIn connection request for a marketing professional.", ["connection", "networking", "outreach", "message"]),
      makeTemplate("li-job", "Job Post", "Create job descriptions", "Write a LinkedIn job post for a remote product designer with strong visual storytelling skills.", ["job", "hiring", "designer", "remote"]),
      makeTemplate("li-case", "Case Study", "Draft case study copy", "Create a LinkedIn case study post for a consulting project that improved team productivity.", ["case study", "consulting", "productivity", "results"]),
      makeTemplate("li-event", "Event Promotion", "Promote professional events", "Write a LinkedIn event promotion for a webinar on AI automation for small businesses.", ["event", "webinar", "automation", "business"]),
      makeTemplate("li-announcement", "Company Update", "Share updates professionally", "Write a professional LinkedIn announcement for a new funding round or product launch.", ["announcement", "company", "update", "funding"]),
      makeTemplate("li-mentor", "Mentorship Post", "Share guidance with audiences", "Create a LinkedIn post sharing advice for early-career developers entering the industry.", ["mentorship", "advice", "developer", "career"]),
      makeTemplate("li-hr", "Employer Brand", "Create employer brand messaging", "Write a LinkedIn employer brand post for a company that values learning and flexibility.", ["employer", "brand", "culture", "hiring"]),
      makeTemplate("li-cta", "Engagement CTA", "Encourage meaningful interaction", "Write a LinkedIn CTA inviting professionals to share their favorite productivity tool.", ["cta", "engagement", "discussion", "professional"]),
    ],
  },
  {
    key: "twitter",
    name: "X (Twitter)",
    description: "Short-form posts and thread ideas",
    templates: [
      makeTemplate("x-thread", "Thread Starter", "Create thread openings", "Write a strong X thread opener about the future of AI in education.", ["thread", "x", "social", "opener"]),
      makeTemplate("x-post", "Short Post", "Create concise posts", "Write a concise X post about the best productivity habits for founders.", ["post", "short", "founder", "productivity"]),
      makeTemplate("x-promo", "Promotional Post", "Create high-impact promotion posts", "Write an X promotional post for a new podcast episode on entrepreneurship.", ["promotion", "podcast", "entrepreneur", "social"]),
      makeTemplate("x-reply", "Reply Draft", "Draft smart replies", "Write a thoughtful reply to a follower asking for tips on building a side hustle.", ["reply", "engagement", "follower", "conversation"]),
      makeTemplate("x-news", "News Commentary", "Comment on trends", "Create an X post commenting on the latest trends in creator monetization.", ["news", "commentary", "trend", "creator"]),
      makeTemplate("x-quote", "Quote Post", "Create quote-themed posts", "Write a quote-based X post about discipline and consistency.", ["quote", "inspiration", "motivation", "social"]),
      makeTemplate("x-launch", "Launch Tweet", "Create launch messages", "Write a launch tweet for a new product feature.", ["launch", "tweet", "feature", "product"]),
      makeTemplate("x-campaign", "Campaign Prompt", "Create campaign messaging", "Create a short X campaign series for a new AI note-taking app.", ["campaign", "series", "app", "ai"]),
      makeTemplate("x-hashtag", "Hashtag Set", "Generate hashtag collections", "Generate a focused set of hashtags for a post about remote work.", ["hashtag", "social", "trend", "tags"]),
      makeTemplate("x-engagement", "Engagement Prompt", "Boost interaction", "Write an X post that invites followers to share their favorite learning tool.", ["engagement", "interaction", "followers", "community"]),
    ],
  },
  {
    key: "tiktok",
    name: "TikTok",
    description: "Short-form scripts and trend-based hooks",
    templates: [
      makeTemplate("tt-hook", "TikTok Hook", "Create viral opening lines", "Write a TikTok hook for a video about productivity hacks for students.", ["hook", "viral", "short", "video"]),
      makeTemplate("tt-script", "Short Script", "Draft concise scripts", "Create a 20-second TikTok script for showing a before-and-after transformation.", ["script", "short", "transformation", "video"]),
      makeTemplate("tt-caption", "Caption Creator", "Write short captions", "Write a TikTok caption for a video about morning routines for busy professionals.", ["caption", "short", "routine", "video"]),
      makeTemplate("tt-idea", "Trend Idea", "Create trend-based ideas", "Create three TikTok ideas inspired by everyday productivity humor.", ["trend", "idea", "humor", "content"]),
      makeTemplate("tt-cta", "CTA Builder", "Create strong call-to-actions", "Write a CTA for a TikTok encouraging viewers to follow for more tips.", ["cta", "follow", "engagement", "call"]),
      makeTemplate("tt-story", "Story Prompt", "Create narrative content", "Create a TikTok story prompt about learning a new skill in 7 days.", ["story", "narrative", "challenge", "skill"]),
      makeTemplate("tt-review", "Review Style", "Create review prompts", "Write a TikTok review prompt for a budget travel backpack.", ["review", "product", "travel", "backpack"]),
      makeTemplate("tt-educational", "Educational Clip", "Create educational short clips", "Create a TikTok idea for teaching one concept in under 15 seconds.", ["educational", "clip", "short", "learn"]),
      makeTemplate("tt-collab", "Collab Prompt", "Generate collaboration ideas", "Write a TikTok collaboration concept for two creators in the wellness niche.", ["collaboration", "creator", "wellness", "content"]),
      makeTemplate("tt-showcase", "Showcase Prompt", "Create showcase-style content", "Write a TikTok showcase prompt for a boutique brand featuring new products.", ["showcase", "brand", "products", "video"]),
    ],
  },
  {
    key: "shopify",
    name: "Shopify",
    description: "Product descriptions, emails, and conversion copy",
    templates: [
      makeTemplate("sp-product", "Product Description", "Write persuasive product copy", "Write a compelling Shopify product description for a premium travel backpack.", ["product", "description", "ecommerce", "copy"]),
      makeTemplate("sp-email", "Cart Recovery", "Create abandoned cart emails", "Write a friendly abandoned cart email for a Shopify store selling handmade candles.", ["email", "cart", "recovery", "ecommerce"]),
      makeTemplate("sp-landing", "Landing Page", "Create product landing copy", "Create Shopify landing page copy for a sustainable water bottle.", ["landing", "page", "homepage", "conversion"]),
      makeTemplate("sp-ad", "Ad Copy", "Write paid ad variations", "Write three Shopify ad copy variations for a 20% launch discount.", ["ad", "paid", "discount", "campaign"]),
      makeTemplate("sp-upsell", "Upsell Message", "Drive higher-value purchases", "Write a persuasive upsell message for a Shopify checkout page.", ["upsell", "checkout", "bundle", "conversion"]),
      makeTemplate("sp-collection", "Collection Page", "Create collection descriptions", "Write a collection page description for a Shopify store featuring eco-friendly home goods.", ["collection", "homepage", "store", "category"]),
      makeTemplate("sp-review", "Review Request", "Ask for reviews", "Write a review request email for customers who recently bought from a Shopify store.", ["review", "request", "email", "customer"]),
      makeTemplate("sp-seo", "SEO Product Copy", "Create search-friendly descriptions", "Write SEO-friendly product copy for a Shopify store selling minimalist desk accessories.", ["seo", "product", "search", "ecommerce"]),
      makeTemplate("sp-launch", "Launch Copy", "Draft launch messaging", "Create Shopify launch messaging for a new skincare bundle.", ["launch", "announcement", "bundle", "product"]),
      makeTemplate("sp-retention", "Retention Email", "Encourage repeat purchase", "Write a retention email that encourages repeat purchases from returning Shopify customers.", ["retention", "repeat purchase", "email", "customer"]),
    ],
  },
  {
    key: "amazon",
    name: "Amazon",
    description: "Listing content and seller optimization",
    templates: [
      makeTemplate("amz-listing", "Listing Builder", "Create Amazon listing content", "Write an Amazon product listing for a portable blender targeting busy professionals.", ["listing", "amazon", "product", "seller"]),
      makeTemplate("amz-title", "Title Optimizer", "Create high-performing titles", "Generate Amazon title options for a wireless earbuds product.", ["title", "optimize", "amazon", "keyword"]),
      makeTemplate("amz-bullets", "Bullet Points", "Write key bullet points", "Write Amazon bullet points highlighting durability, design, and value for a travel backpack.", ["bullet", "features", "amazon", "listing"]),
      makeTemplate("amz-review", "Review Response", "Respond to reviews", "Write a professional Amazon review response for a customer who praised shipping and product quality.", ["review", "response", "customer", "amazon"]),
      makeTemplate("amz-qa", "FAQ Builder", "Create product FAQs", "Create FAQ content for an Amazon product page for a smart mug.", ["faq", "questions", "product", "amazon"]),
      makeTemplate("amz-ad", "Ad Copy", "Write Amazon ad copy", "Write Amazon ad copy for a new kitchen gadget aimed at home cooks.", ["ad", "amazon", "copy", "promotion"]),
      makeTemplate("amz-ppc", "PPC Keyword Prompt", "Generate keyword ideas", "Create a list of Amazon PPC keyword ideas for a pet grooming kit.", ["ppc", "keyword", "amazon", "ads"]),
      makeTemplate("amz-aim", "A+ Content", "Create enhanced content", "Write A+ content for an Amazon listing for premium skincare.", ["a plus", "enhanced", "content", "amazon"]),
      makeTemplate("amz-compare", "Comparison Prompt", "Create competitor comparison content", "Write comparison copy for an Amazon listing about a premium bottle versus a budget alternative.", ["compare", "competitor", "amazon", "alternative"]),
      makeTemplate("amz-offer", "Offer Prompt", "Create promo messages", "Write an Amazon promotional offer for a seasonal discount on a home office accessory.", ["offer", "discount", "amazon", "promotion"]),
    ],
  },
  {
    key: "flipkart",
    name: "Flipkart",
    description: "Commerce content and marketplace copy",
    templates: [
      makeTemplate("fk-listing", "Flipkart Listing", "Write marketplace listing content", "Write a Flipkart product listing for a compact blender aimed at small apartments.", ["listing", "flipkart", "marketplace", "product"]),
      makeTemplate("fk-title", "Title Prompt", "Create marketplace titles", "Generate title options for a Flipkart product listing for wireless earphones.", ["title", "flipkart", "earphones", "marketplace"]),
      makeTemplate("fk-features", "Feature Bullets", "Build concise product features", "Write Flipkart feature bullets for a smart water bottle.", ["feature", "bullet", "flipkart", "product"]),
      makeTemplate("fk-catalog", "Catalog Content", "Create catalog descriptions", "Write a catalog description for a Flipkart product collection for home decor.", ["catalog", "description", "flipkart", "collection"]),
      makeTemplate("fk-offer", "Offer Copy", "Create offer messages", "Create a Flipkart offer message for a weekend sale on kitchen tools.", ["offer", "sale", "flipkart", "promotion"]),
      makeTemplate("fk-review", "Review Request", "Ask for customer reviews", "Write a review request message for a customer who bought from a Flipkart store.", ["review", "request", "customer", "flipkart"]),
      makeTemplate("fk-campaign", "Campaign Prompt", "Create ad messaging", "Write a Flipkart-led promotional campaign for a new health supplement.", ["campaign", "promotion", "flipkart", "health"]),
      makeTemplate("fk-compare", "Compare Prompt", "Write comparison copy", "Create comparison copy for a Flipkart product page between a premium and budget version.", ["compare", "flipkart", "product", "alternative"]),
      makeTemplate("fk-qa", "FAQ Builder", "Build FAQ content", "Create FAQ content for a Flipkart product page for a portable charger.", ["faq", "flipkart", "charger", "product"]),
      makeTemplate("fk-retention", "Retention Prompt", "Create repeat-purchase messaging", "Write a retention message encouraging repeat purchases from Flipkart customers.", ["retention", "repeat", "flipkart", "customer"]),
    ],
  },
  {
    key: "seo",
    name: "SEO",
    description: "Search optimization, keywords, and content briefs",
    templates: [
      makeTemplate("seo-keyword", "Keyword Research", "Generate keyword ideas", "Generate a keyword list for a blog about sustainable fashion.", ["keyword", "research", "seo", "content"]),
      makeTemplate("seo-meta", "Meta Description", "Write SEO meta text", "Write a compelling SEO meta description for a page about AI tools for marketers.", ["meta", "description", "seo", "search"]),
      makeTemplate("seo-brief", "Content Brief", "Create briefs for writers", "Create an SEO content brief for a blog post about remote work best practices.", ["brief", "writer", "seo", "content"]),
      makeTemplate("seo-title", "SEO Title", "Write search-friendly titles", "Generate SEO title options for a page on beginner photography tips.", ["title", "seo", "search", "page"]),
      makeTemplate("seo-schema", "Schema Prompt", "Create schema ideas", "Write a schema-focused prompt for improving a product page with structured data.", ["schema", "structured data", "seo", "technical"]),
      makeTemplate("seo-audit", "Audit Prompt", "Evaluate content performance", "Create an SEO audit prompt for a blog that needs better topical coverage.", ["audit", "performance", "seo", "blog"]),
      makeTemplate("seo-link", "Link Strategy", "Plan internal links", "Create an internal linking strategy for a website about personal finance.", ["internal links", "strategy", "seo", "website"]),
      makeTemplate("seo-landing", "Landing Page SEO", "Optimize conversion pages", "Write an SEO prompt for optimizing a landing page for a SaaS product.", ["landing page", "seo", "conversion", "saas"]),
      makeTemplate("seo-local", "Local SEO", "Create local focus copy", "Write a local SEO prompt for a bakery targeting nearby customers.", ["local", "seo", "nearby", "business"]),
      makeTemplate("seo-article", "Article Outline", "Plan SEO articles", "Create an SEO article outline for a guide on healthy meal prep.", ["article", "outline", "seo", "guide"]),
    ],
  },
  {
    key: "blog-writing",
    name: "Blog Writing",
    description: "Blog posts, outlines, and editorial planning",
    templates: [
      makeTemplate("blog-outline", "Blog Outline", "Build article outlines", "Create a blog outline for an article on how to build a daily routine that actually lasts.", ["outline", "blog", "article", "structure"]),
      makeTemplate("blog-intro", "Intro Writer", "Write engaging introductions", "Write a strong introduction for a blog post about balancing work and wellness.", ["intro", "blog", "engagement", "opening"]),
      makeTemplate("blog-cta", "Closing CTA", "Write effective closers", "Write a blog CTA encouraging readers to subscribe for more practical guides.", ["cta", "closing", "blog", "subscribe"]),
      makeTemplate("blog-list", "Listicle Prompt", "Create list-based articles", "Create a listicle-style blog post outline on the best tools for solo founders.", ["listicle", "list", "blog", "tips"]),
      makeTemplate("blog-opinion", "Opinion Piece", "Write opinion-based articles", "Write a blog opinion piece on whether AI should be treated like a personal assistant.", ["opinion", "article", "essay", "blog"]),
      makeTemplate("blog-educational", "Educational Blog", "Create informative posts", "Create an educational blog post about the basics of investing for beginners.", ["educational", "informative", "blog", "investing"]),
      makeTemplate("blog-rewrite", "Rewrite Prompt", "Rework existing content", "Rewrite an existing blog post to make it more concise, clear, and engaging.", ["rewrite", "edit", "clarity", "blog"]),
      makeTemplate("blog-series", "Series Plan", "Map content series", "Create a 5-part blog series plan for teaching digital marketing basics.", ["series", "plan", "content", "blog"]),
      makeTemplate("blog-howto", "How-To Post", "Create practical how-to guides", "Create a how-to blog post for setting up a productive home office.", ["how to", "guide", "blog", "productivity"]),
      makeTemplate("blog-case", "Case Study Blog", "Draft case study content", "Write a case study blog post about a small business improving growth with better systems.", ["case study", "blog", "business", "growth"]),
    ],
  },
  {
    key: "copywriting",
    name: "Copywriting",
    description: "Short-form persuasion and ad copy",
    templates: [
      makeTemplate("copy-ad", "Ad Copy", "Create persuasive ads", "Write ad copy for a premium headphones product aimed at creators.", ["ad", "copy", "persuasive", "marketing"]),
      makeTemplate("copy-landing", "Landing Page Copy", "Create conversion-focused copy", "Write landing page copy for a new budgeting app.", ["landing", "copy", "conversion", "app"]),
      makeTemplate("copy-email", "Email Copy", "Draft email promotions", "Write promotional email copy for a seasonal sale on home essentials.", ["email", "promotion", "copy", "sale"]),
      makeTemplate("copy-value", "Value Proposition", "Create value statements", "Write a value proposition for a remote collaboration platform.", ["value proposition", "statement", "saas", "brand"]),
      makeTemplate("copy-headline", "Headline Generator", "Generate headlines", "Generate 10 headlines for a blog post about AI productivity tools.", ["headline", "copy", "title", "content"]),
      makeTemplate("copy-hero", "Hero Section", "Create hero section messaging", "Write hero section copy for a startup website selling design services.", ["hero", "section", "website", "startup"]),
      makeTemplate("copy-sales", "Sales Page", "Craft sales page copy", "Write sales page copy for a premium planner designed for busy professionals.", ["sales page", "copy", "planner", "conversion"]),
      makeTemplate("copy-objection", "Objection Handler", "Write objection responses", "Write copy that handles common objections for a new online course.", ["objection", "sales", "course", "copy"]),
      makeTemplate("copy-launch", "Launch Copy", "Create launch marketing copy", "Create launch copy for a new notebook subscription service.", ["launch", "copy", "subscription", "marketing"]),
      makeTemplate("copy-rebrand", "Rebrand Message", "Create rebrand messaging", "Write rebrand messaging for a company moving toward a more premium image.", ["rebrand", "message", "brand", "positioning"]),
    ],
  },
  {
    key: "email-writing",
    name: "Email Writing",
    description: "Campaigns, outreach, and follow-ups",
    templates: [
      makeTemplate("email-campaign", "Campaign Email", "Draft campaign emails", "Write a campaign email for a seasonal sale on home decor.", ["campaign", "email", "sale", "marketing"]),
      makeTemplate("email-followup", "Follow-Up Email", "Create follow-up messages", "Write a professional follow-up email after a sales call.", ["follow up", "sales", "email", "client"]),
      makeTemplate("email-welcome", "Welcome Email", "Create onboarding emails", "Write a welcoming onboarding email for new subscribers.", ["welcome", "onboarding", "subscriber", "email"]),
      makeTemplate("email-announce", "Announcement Email", "Draft product updates", "Write an announcement email for a new feature launch.", ["announcement", "feature", "email", "product"]),
      makeTemplate("email-reengage", "Re-Engagement", "Revive inactive users", "Write a re-engagement email for inactive subscribers.", ["reengagement", "inactive", "email", "retention"]),
      makeTemplate("email-newsletter", "Newsletter", "Create newsletter content", "Write a newsletter email for a small business sharing product news and company updates.", ["newsletter", "email", "updates", "business"]),
      makeTemplate("email-outreach", "Outreach Email", "Create cold outreach", "Write a cold outreach email for a software consultancy.", ["outreach", "cold", "email", "consulting"]),
      makeTemplate("email-thankyou", "Thank-You Email", "Create appreciation messages", "Write a thank-you email after a client onboarding session.", ["thank you", "client", "email", "onboarding"]),
      makeTemplate("email-urgent", "Urgency Email", "Create time-sensitive messages", "Write an urgency email for a limited-time offer with clear action steps.", ["urgent", "offer", "deadline", "email"]),
      makeTemplate("email-event", "Event Email", "Promote events", "Write an event invitation email for a webinar on AI automation.", ["event", "webinar", "email", "invite"]),
    ],
  },
  {
    key: "business",
    name: "Business",
    description: "Plans, strategy, and operating guidance",
    templates: [
      makeTemplate("biz-plan", "Business Plan", "Draft business plan sections", "Create a concise business plan summary for a sustainable fashion subscription brand.", ["plan", "business", "summary", "strategy"]),
      makeTemplate("biz-ops", "Operations Plan", "Build operating plans", "Write an operations plan for a small consulting business scaling its services.", ["operations", "plan", "business", "scaling"]),
      makeTemplate("biz-forecast", "Forecast Prompt", "Project growth", "Create a growth forecast prompt for a startup launching in a new market.", ["forecast", "growth", "market", "business"]),
      makeTemplate("biz-risk", "Risk Analysis", "Identify business risks", "Write a risk analysis prompt for a small business entering a new region.", ["risk", "analysis", "business", "expansion"]),
      makeTemplate("biz-competitor", "Competitor Summary", "Summarize competitive landscapes", "Create a competitor summary for a local food delivery business.", ["competitor", "market", "analysis", "business"]),
      makeTemplate("biz-pricing", "Pricing Strategy", "Create pricing prompts", "Write a pricing strategy prompt for a premium service business.", ["pricing", "strategy", "service", "business"]),
      makeTemplate("biz-partnership", "Partnership Idea", "Create partnership opportunities", "Create partnership opportunities for a business that sells wellness products.", ["partnership", "opportunity", "business", "network"]),
      makeTemplate("biz-kpi", "KPI Framework", "Set measurable goals", "Create a KPI framework for a growing e-commerce brand.", ["kpi", "metrics", "ecommerce", "growth"]),
      makeTemplate("biz-cashflow", "Cash Flow", "Create cash flow planning prompts", "Create a cash flow planning prompt for a bootstrapped service brand.", ["cash flow", "finance", "planning", "business"]),
      makeTemplate("biz-report", "Executive Summary", "Write executive summaries", "Write an executive summary for a business report about entering a new market.", ["executive", "summary", "report", "business"]),
    ],
  },
  {
    key: "startup",
    name: "Startup",
    description: "Founder tools, pitches, and positioning",
    templates: [
      makeTemplate("st-pitch", "Pitch Deck", "Draft pitch deck content", "Create a startup pitch deck outline for an AI recruiting platform.", ["pitch", "deck", "startup", "funding"]),
      makeTemplate("st-positioning", "Positioning Statement", "Clarify market position", "Write a positioning statement for a startup helping small teams automate operations.", ["positioning", "statement", "market", "startup"]),
      makeTemplate("st-mvp", "MVP Prompt", "Define core product scope", "Create an MVP prompt for a startup building a budget planner app.", ["mvp", "product", "startup", "scope"]),
      makeTemplate("st-customer", "Customer Persona", "Create audience profiles", "Write a customer persona for a startup selling AI tools to small agencies.", ["persona", "customer", "audience", "startup"]),
      makeTemplate("st-launch", "Launch Plan", "Create launch steps", "Create a launch plan for a startup going live with a new beta product.", ["launch", "plan", "beta", "startup"]),
      makeTemplate("st-traction", "Traction Prompt", "Describe early traction", "Write a traction summary for a startup with early product-market fit signals.", ["traction", "progress", "startup", "growth"]),
      makeTemplate("st-investor", "Investor Email", "Draft investor outreach", "Write an investor outreach email for a startup seeking early-stage funding.", ["investor", "outreach", "funding", "startup"]),
      makeTemplate("st-ops", "Founder Workflow", "Create operating processes", "Create a founder workflow prompt for a startup balancing product and sales.", ["workflow", "founder", "operations", "startup"]),
      makeTemplate("st-competition", "Competitive Analysis", "Analyze market competition", "Write a competitive analysis prompt for a startup in the productivity software market.", ["competitive", "analysis", "market", "startup"]),
      makeTemplate("st-vision", "Vision Statement", "Create founder vision", "Write a founder vision statement for a startup focused on accessible education tools.", ["vision", "founder", "statement", "startup"]),
    ],
  },
  {
    key: "marketing",
    name: "Marketing",
    description: "Campaign strategy and promotional messaging",
    templates: [
      makeTemplate("mk-campaign", "Campaign Brief", "Create campaign briefs", "Write a marketing campaign brief for a new mobile fitness app.", ["campaign", "brief", "marketing", "app"]),
      makeTemplate("mk-email", "Email Sequence", "Create multi-step email prompts", "Create a 3-email marketing sequence for a seasonal sale.", ["email", "sequence", "marketing", "campaign"]),
      makeTemplate("mk-ad", "Ad Copy", "Create channel-specific ads", "Write Facebook ad copy for a productivity app targeting remote workers.", ["ad", "facebook", "app", "marketing"]),
      makeTemplate("mk-positioning", "Positioning", "Define market position", "Create a positioning statement for a premium meal delivery service.", ["positioning", "brand", "market", "marketing"]),
      makeTemplate("mk-landing", "Landing Message", "Write landing page messaging", "Write landing page messaging for an AI writing assistant for small businesses.", ["landing", "page", "message", "marketing"]),
      makeTemplate("mk-idea", "Content Idea", "Generate campaign ideas", "Generate 10 marketing content ideas for a startup launching a new feature.", ["content", "ideas", "marketing", "launch"]),
      makeTemplate("mk-hero", "Hero Message", "Create value-led headlines", "Create hero messaging for a premium skincare launch.", ["hero", "headline", "brand", "marketing"]),
      makeTemplate("mk-journey", "Customer Journey", "Map customer experiences", "Create a customer journey map for a new online education product.", ["journey", "customer", "experience", "marketing"]),
      makeTemplate("mk-retention", "Retention Plan", "Create repeat-customer strategy", "Create a retention plan for a subscription business focused on customer lifetime value.", ["retention", "customer", "subscription", "marketing"]),
      makeTemplate("mk-compare", "Comparison Copy", "Create competitor comparison content", "Write comparison copy for a product versus a top competitor.", ["comparison", "competitor", "marketing", "copy"]),
    ],
  },
  {
    key: "sales",
    name: "Sales",
    description: "Sales outreach and conversion messaging",
    templates: [
      makeTemplate("sl-pitch", "Sales Pitch", "Write persuasive pitches", "Write a concise sales pitch for a B2B software platform.", ["sales", "pitch", "software", "b2b"]),
      makeTemplate("sl-follow", "Follow-Up Message", "Create follow-up messages", "Write a follow-up message after a product demo.", ["follow up", "demo", "sales", "message"]),
      makeTemplate("sl-objection", "Objection Response", "Address deal blockers", "Write a response to a prospect worried about pricing.", ["objection", "pricing", "prospect", "sales"]),
      makeTemplate("sl-demo", "Demo Script", "Write product demo scripts", "Create a product demo script for a new AI project management tool.", ["demo", "script", "product", "sales"]),
      makeTemplate("sl-outreach", "Outreach Message", "Create cold outreach", "Write a cold outreach message to a prospect who visited your pricing page.", ["outreach", "cold", "sales", "prospect"]),
      makeTemplate("sl-quote", "Quote Request", "Ask for next steps", "Write a quote request email for a potential client.", ["quote", "request", "email", "client"]),
      makeTemplate("sl-case", "Case Study Pitch", "Create value evidence", "Write a case study pitch for a consulting service with measurable results.", ["case study", "value", "sales", "consulting"]),
      makeTemplate("sl-promo", "Offer Prompt", "Create limited-time offers", "Write a limited-time offer message for a sales campaign.", ["offer", "limited time", "campaign", "sales"]),
      makeTemplate("sl-questions", "Discovery Questions", "Create discovery prompts", "Create discovery questions for a first sales call with a potential SaaS customer.", ["discovery", "questions", "sales", "call"]),
      makeTemplate("sl-win", "Win-Back Message", "Recover lost customers", "Write a win-back message for a customer who stopped using your service.", ["win back", "retention", "customer", "sales"]),
    ],
  },
  {
    key: "coding",
    name: "Coding",
    description: "Engineering prompts and implementation help",
    templates: [
      makeTemplate("cd-explain", "Code Explanation", "Explain code clearly", "Explain this JavaScript function step by step and suggest one improvement.", ["explain", "javascript", "code", "review"]),
      makeTemplate("cd-refactor", "Refactor Prompt", "Improve code quality", "Refactor this Python script to make it cleaner, more maintainable, and easier to read.", ["refactor", "python", "code", "quality"]),
      makeTemplate("cd-api", "API Design", "Design API interfaces", "Design a REST API for a task management app with users, tasks, and projects.", ["api", "design", "rest", "backend"]),
      makeTemplate("cd-bugfix", "Bug Fix", "Guide debugging", "Help me debug this React component that is throwing a hydration error in Next.js.", ["bug", "fix", "react", "debug"]),
      makeTemplate("cd-test", "Test Generator", "Create test cases", "Generate unit test cases for a function that validates email addresses.", ["tests", "unit", "validation", "code"]),
      makeTemplate("cd-arch", "Architecture Prompt", "Plan system design", "Create a system architecture plan for a multi-tenant SaaS dashboard.", ["architecture", "system", "design", "saas"]),
      makeTemplate("cd-docs", "Documentation Prompt", "Draft technical docs", "Write developer-friendly documentation for a new authentication flow.", ["documentation", "docs", "technical", "auth"]),
      makeTemplate("cd-deploy", "Deployment Prompt", "Create deployment guidance", "Create a deployment checklist for a Next.js app to a production environment.", ["deployment", "production", "nextjs", "checklist"]),
      makeTemplate("cd-db", "Database Prompt", "Design data models", "Design a database schema for a simple e-commerce ordering system.", ["database", "schema", "data", "ecommerce"]),
      makeTemplate("cd-security", "Security Review", "Assess security basics", "Review this API implementation for common security risks and propose improvements.", ["security", "review", "api", "risk"]),
    ],
  },
  {
    key: "python",
    name: "Python",
    description: "Python-specific prompts and solutions",
    templates: [
      makeTemplate("py-script", "Script Builder", "Create Python scripts", "Write a Python script that reads a CSV file and summarizes the data.", ["python", "script", "csv", "automation"]),
      makeTemplate("py-async", "Async Prompt", "Create async solutions", "Write an async Python example for fetching multiple API requests efficiently.", ["async", "python", "api", "requests"]),
      makeTemplate("py-data", "Data Analysis", "Perform data analysis tasks", "Create a Python prompt for analyzing sales trends in a CSV dataset.", ["data", "analysis", "python", "sales"]),
      makeTemplate("py-api", "Flask FastAPI", "Build API backends", "Design a FastAPI backend for a simple todo application.", ["fastapi", "backend", "api", "python"]),
      makeTemplate("py-ml", "ML Starter", "Create machine learning prompts", "Create a Python prompt for building a beginner-friendly machine learning classifier.", ["machine learning", "python", "classifier", "ml"]),
      makeTemplate("py-web", "Web Scraper", "Build scraping scripts", "Write a Python web scraper for collecting article titles from a blog.", ["scraper", "python", "web", "content"]),
      makeTemplate("py-test", "Test Prompt", "Create Python tests", "Generate pytest examples for a Python utility function.", ["pytest", "tests", "python", "utility"]),
      makeTemplate("py-logging", "Logging Prompt", "Improve logging", "Write a Python logging pattern for a production command-line script.", ["logging", "python", "production", "script"]),
      makeTemplate("py-cli", "CLI App", "Design command-line tools", "Create a Python CLI app that organizes files in a folder.", ["cli", "command line", "python", "tool"]),
      makeTemplate("py-opt", "Optimize Script", "Improve performance", "Optimize this Python function for speed and lower memory usage.", ["optimize", "performance", "python", "speed"]),
    ],
  },
  {
    key: "javascript",
    name: "JavaScript",
    description: "JavaScript-specific prompts and solutions",
    templates: [
      makeTemplate("js-component", "Component Prompt", "Create components", "Create a React component for a profile card with editable fields.", ["react", "component", "javascript", "ui"]),
      makeTemplate("js-fetch", "Fetch Helper", "Create API helpers", "Write a JavaScript fetch helper for calling a REST API.", ["fetch", "api", "javascript", "helper"]),
      makeTemplate("js-form", "Form Builder", "Build form logic", "Create a JavaScript form validator for a checkout form.", ["form", "validation", "javascript", "checkout"]),
      makeTemplate("js-state", "State Logic", "Manage app state", "Create a state management pattern for a simple shopping cart using JavaScript.", ["state", "shopping cart", "javascript", "logic"]),
      makeTemplate("js-test", "Test Prompt", "Create tests", "Generate JavaScript tests for a date formatting utility.", ["tests", "javascript", "date", "utility"]),
      makeTemplate("js-async", "Async Pattern", "Write async logic", "Write a modern JavaScript async pattern using promises and async await.", ["async", "promise", "javascript", "await"]),
      makeTemplate("js-dom", "DOM Prompt", "Manipulate the DOM", "Create JavaScript code that updates the DOM based on user input.", ["dom", "javascript", "ui", "input"]),
      makeTemplate("js-esm", "Module Prompt", "Create reusable modules", "Write a modular JavaScript structure for a dashboard frontend.", ["module", "javascript", "frontend", "reusable"]),
      makeTemplate("js-error", "Error Handling", "Handle errors gracefully", "Create error handling logic for a JavaScript client-side app.", ["error", "handling", "javascript", "client"]),
      makeTemplate("js-build", "Build Script", "Create build prompts", "Create a JavaScript build script with linting and formatting steps.", ["build", "lint", "javascript", "tooling"]),
    ],
  },
  {
    key: "chatgpt",
    name: "ChatGPT",
    description: "Prompts for ChatGPT workflows and automation",
    templates: [
      makeTemplate("cg-system", "System Prompt", "Create system prompts", "Create a strong system prompt for a helpful AI assistant in a support workflow.", ["system", "prompt", "assistant", "chatgpt"]),
      makeTemplate("cg-agent", "Agent Prompt", "Design agent strategies", "Write a ChatGPT prompt for a research assistant that summarizes long articles.", ["agent", "research", "assistant", "chatgpt"]),
      makeTemplate("cg-qa", "QA Prompt", "Create quality questions", "Write a prompt to help ChatGPT generate high-quality interview questions.", ["qa", "interview", "questions", "chatgpt"]),
      makeTemplate("cg-creative", "Creative Prompt", "Create imaginative outputs", "Create a creative ChatGPT prompt for generating brand story ideas.", ["creative", "brand", "story", "chatgpt"]),
      makeTemplate("cg-ops", "Workflow Prompt", "Build process prompts", "Write a prompt for ChatGPT to help manage a small team’s weekly planning.", ["workflow", "planning", "team", "chatgpt"]),
      makeTemplate("cg-translate", "Translation Prompt", "Create multilingual prompts", "Write a prompt that helps ChatGPT translate company content while retaining tone.", ["translation", "multilingual", "tone", "chatgpt"]),
      makeTemplate("cg-email", "Email Prompt", "Write better emails", "Write a ChatGPT prompt for drafting polished client emails.", ["email", "client", "chatgpt", "copy"]),
      makeTemplate("cg-analysis", "Analysis Prompt", "Summarize data", "Create a prompt for ChatGPT to analyze customer feedback and summarize themes.", ["analysis", "feedback", "summary", "chatgpt"]),
      makeTemplate("cg-educate", "Teaching Prompt", "Create educational prompts", "Write a prompt for ChatGPT to explain a topic like a clear and patient teacher.", ["teaching", "education", "explain", "chatgpt"]),
      makeTemplate("cg-multi", "Multi-Step Prompt", "Build complex tasks", "Create a multi-step ChatGPT prompt for researching, writing, and editing an article.", ["multi step", "research", "write", "chatgpt"]),
    ],
  },
  {
    key: "claude",
    name: "Claude",
    description: "Claude prompts for writing and reasoning",
    templates: [
      makeTemplate("cl-analysis", "Reasoning Prompt", "Create structured analysis prompts", "Write a Claude prompt that analyzes a complex business problem and breaks it into clear steps.", ["reasoning", "analysis", "claude", "business"]),
      makeTemplate("cl-writing", "Writing Prompt", "Create polished writing flows", "Write a Claude prompt for drafting a thoughtful article with a clear structure.", ["writing", "article", "claude", "structure"]),
      makeTemplate("cl-summary", "Summary Prompt", "Summarize long content", "Create a Claude prompt for summarizing long reports into executive-ready highlights.", ["summary", "report", "claude", "executive"]),
      makeTemplate("cl-compare", "Comparison Prompt", "Compare options clearly", "Write a Claude prompt for comparing two product strategies with tradeoffs.", ["compare", "strategy", "claude", "tradeoff"]),
      makeTemplate("cl-rewrite", "Rewrite Prompt", "Refine existing text", "Create a Claude prompt that rewrites a rough draft into a polished final version.", ["rewrite", "draft", "claude", "edit"]),
      makeTemplate("cl-qa", "Answer Prompt", "Create strong answers", "Write a Claude prompt for answering customer questions in a supportive tone.", ["answer", "customer", "support", "claude"]),
      makeTemplate("cl-plan", "Planning Prompt", "Generate plans", "Create a Claude prompt for planning a three-month content strategy.", ["plan", "content", "strategy", "claude"]),
      makeTemplate("cl-brief", "Brief Prompt", "Create project briefs", "Write a Claude prompt for generating a concise project brief for a product team.", ["brief", "project", "product", "claude"]),
      makeTemplate("cl-mentor", "Mentor Prompt", "Provide coaching", "Create a Claude prompt that acts like a thoughtful mentor for a growing founder.", ["mentor", "founder", "guidance", "claude"]),
      makeTemplate("cl-legal", "Policy Prompt", "Draft policy text", "Write a Claude prompt to create a clear internal policy for remote team communication.", ["policy", "comms", "internal", "claude"]),
    ],
  },
  {
    key: "gemini",
    name: "Gemini",
    description: "Gemini prompts for multimodal workflows",
    templates: [
      makeTemplate("gm-vision", "Visual Prompt", "Create multimodal prompts", "Write a Gemini prompt for describing an image and turning it into a polished brand concept.", ["vision", "image", "prompt", "gemini"]),
      makeTemplate("gm-research", "Research Prompt", "Support research workflows", "Create a Gemini prompt for gathering and synthesizing research notes from multiple sources.", ["research", "synthesis", "gemini", "notes"]),
      makeTemplate("gm-content", "Content Prompt", "Create content ideas", "Write a Gemini prompt for generating marketing content ideas from a raw topic.", ["content", "marketing", "ideas", "gemini"]),
      makeTemplate("gm-compare", "Comparison Prompt", "Compare two concepts", "Create a Gemini prompt for comparing two product concepts and listing tradeoffs.", ["compare", "product", "tradeoff", "gemini"]),
      makeTemplate("gm-creative", "Creative Brief", "Build creative briefs", "Write a Gemini prompt for generating creative brief ideas for a campaign.", ["creative", "brief", "campaign", "gemini"]),
      makeTemplate("gm-explain", "Explanation Prompt", "Create clear explanations", "Write a Gemini prompt to explain a technical topic in simple language.", ["explain", "technical", "simple", "gemini"]),
      makeTemplate("gm-plan", "Planning Prompt", "Design plans", "Create a Gemini prompt for turning a rough idea into a realistic action plan.", ["plan", "action", "gemini", "strategy"]),
      makeTemplate("gm-code", "Code Prompt", "Create coding prompts", "Write a Gemini prompt for helping a developer debug a small coding issue.", ["code", "debug", "developer", "gemini"]),
      makeTemplate("gm-translate", "Translate Prompt", "Create translation prompts", "Write a Gemini prompt that translates content while preserving style and tone.", ["translate", "tone", "style", "gemini"]),
      makeTemplate("gm-summary", "Summary Prompt", "Create summaries", "Create a Gemini prompt for summarizing user feedback into a concise report.", ["summary", "feedback", "report", "gemini"]),
    ],
  },
  {
    key: "image-generation",
    name: "Image Generation",
    description: "Visual prompts for image models",
    templates: [
      makeTemplate("img-portrait", "Portrait Prompt", "Create portrait imagery", "Create a detailed image prompt for a cinematic portrait of a futuristic city at sunset.", ["portrait", "cinematic", "city", "image"]),
      makeTemplate("img-style", "Style Prompt", "Create style-based prompts", "Write an image prompt inspired by watercolor and minimalist illustration for a cozy bookstore scene.", ["style", "watercolor", "minimalist", "image"]),
      makeTemplate("img-product", "Product Shot", "Create polished product visuals", "Create a polished product shot prompt for a luxury perfume bottle on a marble background.", ["product", "shot", "luxury", "visual"]),
      makeTemplate("img-character", "Character Prompt", "Create character designs", "Write an image prompt for a fantasy warrior character with glowing armor and a dramatic sky.", ["character", "fantasy", "armor", "image"]),
      makeTemplate("img-scene", "Scene Prompt", "Create rich scenes", "Create a vivid image prompt for a surreal floating island with waterfalls and glowing lanterns.", ["scene", "surreal", "island", "image"]),
      makeTemplate("img-ai", "AI Art Prompt", "Create AI art directions", "Write an image prompt for an AI-art poster featuring neon city lights and a reflective ocean.", ["ai art", "poster", "neon", "image"]),
      makeTemplate("img-fashion", "Fashion Prompt", "Create fashion imagery", "Create an editorial fashion image prompt for a bold, high-end streetwear campaign.", ["fashion", "editorial", "streetwear", "image"]),
      makeTemplate("img-architecture", "Architecture Prompt", "Create architectural visuals", "Write a prompt for a modern architecture scene with soft morning light and clean geometry.", ["architecture", "modern", "scene", "image"]),
      makeTemplate("img-nature", "Nature Prompt", "Create environmental imagery", "Create a nature image prompt for a misty forest path at golden hour.", ["nature", "forest", "golden hour", "image"]),
      makeTemplate("img-food", "Food Prompt", "Create food photography prompts", "Write a high-end food photography prompt for a plated gourmet dessert on a dark background.", ["food", "photography", "dessert", "image"]),
    ],
  },
  {
    key: "education",
    name: "Education",
    description: "Lessons, study guides, and educational prompts",
    templates: [
      makeTemplate("ed-lesson", "Lesson Plan", "Create lesson plans", "Create a lesson plan for teaching the basics of financial literacy to high school students.", ["lesson", "plan", "education", "students"]),
      makeTemplate("ed-study", "Study Guide", "Create study guides", "Create a study guide for preparing for an exam on world history.", ["study", "guide", "exam", "education"]),
      makeTemplate("ed-explain", "Concept Explanation", "Explain topics simply", "Explain the concept of photosynthesis in a way that is easy for a 10-year-old to understand.", ["explain", "concept", "kid", "education"]),
      makeTemplate("ed-quiz", "Quiz Builder", "Generate quiz questions", "Create a 10-question quiz for middle school students on the water cycle.", ["quiz", "questions", "education", "students"]),
      makeTemplate("ed-assignment", "Assignment Prompt", "Create classroom assignments", "Create an assignment prompt for students to write a short essay on renewable energy.", ["assignment", "essay", "students", "education"]),
      makeTemplate("ed-syllabus", "Syllabus Prompt", "Create syllabi", "Create a syllabus outline for a short introductory course on digital literacy.", ["syllabus", "course", "digital literacy", "education"]),
      makeTemplate("ed-worksheet", "Worksheet Prompt", "Create practice worksheets", "Create a worksheet with practice questions for learning fractions.", ["worksheet", "practice", "math", "education"]),
      makeTemplate("ed-discussion", "Discussion Prompt", "Create discussion questions", "Create discussion questions for a classroom activity about climate change.", ["discussion", "classroom", "climate", "education"]),
      makeTemplate("ed-summarize", "Summary Prompt", "Summarize learning topics", "Write a summary prompt for a lesson on the causes of world war II.", ["summary", "lesson", "history", "education"]),
      makeTemplate("ed-feedback", "Feedback Prompt", "Create feedback rubrics", "Create a feedback rubric for evaluating student presentations.", ["feedback", "rubric", "student", "education"]),
    ],
  },
];

export function getPromptLibraryCategories() {
  return promptLibraryData;
}

export function getPromptLibraryCategory(key: PromptLibraryCategoryKey) {
  return promptLibraryData.find((category) => category.key === key);
}

export function getAllPromptTemplates() {
  return promptLibraryData.flatMap((category) =>
    category.templates.map((template) => ({
      ...template,
      categoryKey: category.key,
      categoryName: category.name,
    })),
  );
}
