// data/landingContent.ts
// Single source of truth for all Nexus landing page copy.
// No string literals should be hardcoded in components — import from here.

export const nav = {
  logo: "Nexus",
  links: [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Pricing", href: "#pricing" },
    { label: "Workspace", href: "/workspace" },
   
  ],
  loginLabel: "Log in",
  signupLabel: "Get started",
} as const;

export const workspaceNav = {
  logo: "Nexus",
  links: [
    { label: "Workspace", href: "/workspace" },
    // { label: "Documents", href: "/workspace/documents" },
    { label: "Search", href: "/workspace/search" },
    { label: "Settings", href: "/workspace/settings" },
  ],
  loginLabel: "Log in",
  signupLabel: "Get started",
} as const;

export const hero = {
  eyebrow: "Nexus Enterprise RAG",
  headlineLines: [
    { text: "Retrieve. Reason." },
    { text: "Respond — at", icon: "zap" },
    { text: "Enterprise Scale." },
  ],
  ctaLabel: "Open workspace",
  ctaHref: "/workspace",
  ratingLabel: "4.8/5 Rating",
  installsLabel: "10k+ Companies",
  mockupImageSrc: "/mockup-ui.png",
} as const;

export const about = {
  eyebrow: "Why Nexus",
  title: "RAG built for teams\nthat can't afford to be wrong.",
  description:
    "Most AI tools hallucinate. Nexus doesn't. Every answer is grounded in your company's own documents, with source citations you can click to verify. Set department-level access controls so HR, Finance, and Legal each see only what they're authorised to — enforced at retrieval, not just the UI.",
} as const;

export const featuresSectionHeading = {
  eyebrow: "Core capabilities",
  title: "Everything an enterprise RAG\npipeline needs — out of the box.",
} as const;

export const features = [
  {
    index: "01",
    title: "Hybrid Search",
    titleHighlight: "Hybrid",
    description:
      "Semantic + keyword retrieval fused with Reciprocal Rank Fusion. No more choosing between recall and precision — you get both, ranked by relevance.",
    visualLabel: "Hybrid Search + RRF",
    icon: "search",
    image: "https://res.cloudinary.com/dl7zmq2d5/image/upload/v1790425147/search_yvqvku.png",
  },
  {
    index: "02",
    title: "Role-Based Access",
    titleHighlight: "Role-Based",
    description:
      "Each department sees only its own documents. RBAC is enforced at the retrieval layer — not just the UI — so employees can't bypass it.",
    visualLabel: "RBAC Enforcement",
    icon: "shield",
    image: "https://res.cloudinary.com/dl7zmq2d5/image/upload/v1790425146/rolebased_ryemqs.png",
  },
  {
    index: "03",
    title: "Smart PDF Navigation",
    titleHighlight: "Smart PDF",
    description:
      "Citations link to the exact page and paragraph. Click a chip in the AI response — the source panel jumps to the highlighted chunk.",
    visualLabel: "PDF Navigation",
    icon: "file-text",
    image: "https://res.cloudinary.com/dl7zmq2d5/image/upload/v1790425145/PDF_navigation_jkmn9d.png",
  },
  {
    index: "04",
    title: "Multimodal RAG",
    titleHighlight: "Multimodal",
    description:
      "Diagrams, charts, and images are indexed alongside text. Answers can cite a figure number as naturally as a paragraph.",
    visualLabel: "Multimodal Index",
    icon: "image",
    image: "https://res.cloudinary.com/dl7zmq2d5/image/upload/v1790425145/MULTI_Model_RAG_qkhuth.png",
  },
] as const;

export const ctaSection = {
  title: "Ready to bring RAG\nto your enterprise?",
  subtitle:
    "Join 200+ teams using Nexus to get accurate, cited answers from their internal knowledge — in minutes, not months.",
  ctaLabel: "Start free trial",
  ctaHref: "/signup",
} as const;

export const footer = {
  logo: "Nexus",
  tagline: "Retrieval-Augmented Generation for the enterprise.",
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Changelog", href: "#changelog" },
        { label: "Roadmap", href: "#roadmap" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#blog" },
        { label: "Careers", href: "#careers" },
        { label: "Press", href: "#press" },
      ],
    },
    {
      heading: "Developers",
      links: [
        { label: "Docs", href: "#docs" },
        { label: "API Reference", href: "#api" },
        { label: "SDKs", href: "#sdks" },
        { label: "Status", href: "#status" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy", href: "#privacy" },
        { label: "Terms", href: "#terms" },
        { label: "Security", href: "#security" },
        { label: "Cookies", href: "#cookies" },
      ],
    },
  ],
  copyright: "© 2026 Nexus AI, Inc. All rights reserved.",
} as const;
