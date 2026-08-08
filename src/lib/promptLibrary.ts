export type PromptLibraryCategory =
  | "youtube"
  | "instagram"
  | "shopify"
  | "coding"
  | "image-generation"
  | "marketing"
  | "business"
  | "education";

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  starterPrompt: string;
}

export interface PromptLibraryCategoryConfig {
  key: PromptLibraryCategory;
  name: string;
  templates: PromptTemplate[];
}

const promptLibrary: PromptLibraryCategoryConfig[] = [
  {
    key: "youtube",
    name: "YouTube",
    templates: [
      {
        id: "youtube-hook",
        title: "YouTube Hook Creator",
        description: "Write a strong opening hook for a video.",
        starterPrompt:
          "Create a compelling YouTube video hook for a 60-second video about how to start a freelance design business. Make it engaging and curiosity-driven.",
      },
      {
        id: "youtube-script",
        title: "YouTube Script Outline",
        description: "Turn an idea into a structured video script.",
        starterPrompt:
          "Create a step-by-step YouTube script outline for a video teaching beginners how to use Notion for productivity.",
      },
      {
        id: "youtube-title",
        title: "YouTube Title Generator",
        description: "Create catchy titles that improve clicks.",
        starterPrompt:
          "Generate 10 YouTube title ideas for a video about healthy meal prep for busy professionals.",
      },
      {
        id: "youtube-description",
        title: "YouTube Description Writer",
        description: "Draft SEO-friendly descriptions for video uploads.",
        starterPrompt:
          "Write an SEO-friendly YouTube description for a video about beginner photography tips.",
      },
      {
        id: "youtube-thumbnail",
        title: "YouTube Thumbnail Copy",
        description: "Create persuasive thumbnail text.",
        starterPrompt:
          "Write 5 short thumbnail text options for a YouTube video about the best productivity apps for students.",
      },
    ],
  },
  {
    key: "instagram",
    name: "Instagram",
    templates: [
      {
        id: "instagram-caption",
        title: "Instagram Caption Writer",
        description: "Create engaging caption copy for posts.",
        starterPrompt:
          "Write an Instagram caption for a brand launching a new eco-friendly skincare line. Make it polished and engaging.",
      },
      {
        id: "instagram-reel",
        title: "Instagram Reel Concept",
        description: "Generate a short-form video concept.",
        starterPrompt:
          "Create a short Instagram Reel concept for a fitness brand promoting a 7-day challenge.",
      },
      {
        id: "instagram-carousel",
        title: "Carousel Post Builder",
        description: "Outline a carousel post with slide ideas.",
        starterPrompt:
          "Create a 7-slide Instagram carousel outline for tips on building confidence in public speaking.",
      },
      {
        id: "instagram-story",
        title: "Story Sequence Writer",
        description: "Create a story sequence for engagement.",
        starterPrompt:
          "Write a 5-frame Instagram story sequence for a coffee shop promoting a weekend special.",
      },
      {
        id: "instagram-hooks",
        title: "Instagram Hook Creator",
        description: "Write attention-grabbing first lines.",
        starterPrompt:
          "Create 10 attention-grabbing opening hooks for an Instagram post about productivity habits.",
      },
    ],
  },
  {
    key: "shopify",
    name: "Shopify",
    templates: [
      {
        id: "shopify-product",
        title: "Product Description Writer",
        description: "Write persuasive Shopify product descriptions.",
        starterPrompt:
          "Write a compelling Shopify product description for a premium leather backpack aimed at remote workers.",
      },
      {
        id: "shopify-email",
        title: "Abandoned Cart Email",
        description: "Create recovery emails for ecommerce.",
        starterPrompt:
          "Write a friendly abandoned cart email for a Shopify store selling handmade candles.",
      },
      {
        id: "shopify-landing",
        title: "Landing Page Copy",
        description: "Draft copy for a product landing page.",
        starterPrompt:
          "Create landing page copy for a Shopify store selling eco-friendly water bottles.",
      },
      {
        id: "shopify-ad",
        title: "Shopify Ad Copy",
        description: "Write ad copy for paid campaigns.",
        starterPrompt:
          "Write three ad copy variations for a Shopify product promoting a 20% launch discount.",
      },
      {
        id: "shopify-upsell",
        title: "Upsell Message",
        description: "Create upsell messaging for checkout.",
        starterPrompt:
          "Write a persuasive upsell message for a Shopify checkout page selling a premium skincare bundle.",
      },
    ],
  },
  {
    key: "coding",
    name: "Coding",
    templates: [
      {
        id: "coding-explain",
        title: "Code Explanation",
        description: "Explain code clearly and simply.",
        starterPrompt:
          "Explain this JavaScript function step by step in simple language and suggest one improvement.",
      },
      {
        id: "coding-refactor",
        title: "Code Refactor Request",
        description: "Improve code quality and maintainability.",
        starterPrompt:
          "Refactor this Python script to make it cleaner, more readable, and easier to maintain.",
      },
      {
        id: "coding-api",
        title: "API Design Prompt",
        description: "Design a clean API structure.",
        starterPrompt:
          "Design a REST API for a task management app with endpoints for users, tasks, and projects.",
      },
      {
        id: "coding-bugfix",
        title: "Bug Fix Assistant",
        description: "Guide debugging and fixes.",
        starterPrompt:
          "Help me debug this React component that is throwing a hydration error in Next.js.",
      },
      {
        id: "coding-test",
        title: "Test Case Generator",
        description: "Create meaningful test cases.",
        starterPrompt:
          "Generate unit test cases for a function that validates email addresses.",
      },
    ],
  },
  {
    key: "image-generation",
    name: "Image Generation",
    templates: [
      {
        id: "image-prompt",
        title: "Image Prompt Creator",
        description: "Draft detailed image generation prompts.",
        starterPrompt:
          "Create a detailed image generation prompt for a cinematic portrait of a futuristic city at sunset.",
      },
      {
        id: "image-style",
        title: "Style Reference Prompt",
        description: "Create prompts based on specific art styles.",
        starterPrompt:
          "Write an image prompt inspired by watercolor and minimalist illustration for a cozy bookstore scene.",
      },
      {
        id: "image-product",
        title: "Product Shot Prompt",
        description: "Generate clean product visuals.",
        starterPrompt:
          "Create a polished product shot prompt for a luxury perfume bottle on a marble background.",
      },
      {
        id: "image-character",
        title: "Character Design Prompt",
        description: "Build character art prompts.",
        starterPrompt:
          "Write an image prompt for a fantasy warrior character with glowing armor and a dramatic sky.",
      },
      {
        id: "image-creative",
        title: "Creative Scene Prompt",
        description: "Compose imaginative prompts.",
        starterPrompt:
          "Create a vivid image prompt for a surreal floating island with waterfalls and glowing lanterns.",
      },
    ],
  },
  {
    key: "marketing",
    name: "Marketing",
    templates: [
      {
        id: "marketing-campaign",
        title: "Campaign Brief",
        description: "Create a concise marketing campaign brief.",
        starterPrompt:
          "Write a marketing campaign brief for a new mobile fitness app targeting young professionals.",
      },
      {
        id: "marketing-email",
        title: "Email Campaign Prompt",
        description: "Draft email campaign messaging.",
        starterPrompt:
          "Create a 3-email marketing sequence for promoting a seasonal sale for an online clothing brand.",
      },
      {
        id: "marketing-ad",
        title: "Ad Copy Prompt",
        description: "Create ad copy for channels.",
        starterPrompt:
          "Write Facebook ad copy for a productivity app aimed at remote workers.",
      },
      {
        id: "marketing-positioning",
        title: "Positioning Statement",
        description: "Define a clear positioning statement.",
        starterPrompt:
          "Create a positioning statement for a premium meal delivery service focused on busy families.",
      },
      {
        id: "marketing-landing",
        title: "Landing Page Message",
        description: "Write landing page copy for growth campaigns.",
        starterPrompt:
          "Write landing page messaging for an AI-powered writing assistant for small business owners.",
      },
    ],
  },
  {
    key: "business",
    name: "Business",
    templates: [
      {
        id: "business-plan",
        title: "Business Plan Summary",
        description: "Draft a concise business plan summary.",
        starterPrompt:
          "Create a short business plan summary for a subscription box startup focused on sustainable office supplies.",
      },
      {
        id: "business-pitch",
        title: "Pitch Deck Outline",
        description: "Build a pitch deck outline.",
        starterPrompt:
          "Create a pitch deck outline for a startup seeking pre-seed funding for an AI recruiting platform.",
      },
      {
        id: "business-analysis",
        title: "Market Analysis Prompt",
        description: "Create a simple market analysis.",
        starterPrompt:
          "Write a market analysis for a new online tutoring service aimed at college students.",
      },
      {
        id: "business-opportunity",
        title: "Opportunity Statement",
        description: "Outline a business opportunity.",
        starterPrompt:
          "Create a business opportunity statement for a local cleaning service using eco-friendly products.",
      },
      {
        id: "business-kpis",
        title: "KPI Framework Prompt",
        description: "Define success metrics.",
        starterPrompt:
          "Create a KPI framework for a new e-commerce brand focused on retention and customer lifetime value.",
      },
    ],
  },
  {
    key: "education",
    name: "Education",
    templates: [
      {
        id: "education-lesson",
        title: "Lesson Plan Builder",
        description: "Create a lesson plan prompt.",
        starterPrompt:
          "Create a lesson plan for teaching the basics of financial literacy to high school students.",
      },
      {
        id: "education-study",
        title: "Study Guide Prompt",
        description: "Create a study guide.",
        starterPrompt:
          "Create a study guide for preparing for an exam on world history.",
      },
      {
        id: "education-explain",
        title: "Concept Explanation",
        description: "Explain concepts simply.",
        starterPrompt:
          "Explain the concept of photosynthesis in a way that is easy for a 10-year-old to understand.",
      },
      {
        id: "education-quiz",
        title: "Quiz Generator",
        description: "Generate quiz questions.",
        starterPrompt:
          "Create a 10-question quiz for middle school students on the water cycle.",
      },
      {
        id: "education-assignment",
        title: "Assignment Prompt",
        description: "Create classroom assignment prompts.",
        starterPrompt:
          "Create an assignment prompt for students to write a short essay on the importance of renewable energy.",
      },
    ],
  },
];

export function getPromptLibraryCategories() {
  return promptLibrary;
}

export function getPromptLibraryCategory(key: PromptLibraryCategory) {
  return promptLibrary.find((category) => category.key === key);
}
