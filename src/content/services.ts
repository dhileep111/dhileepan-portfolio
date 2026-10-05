export type Service = {
  slug: string;
  index: string;
  title: string;
  summary: string;
  items: string[];
};

export const services: Service[] = [
  {
    slug: "seo",
    index: "01",
    title: "SEO",
    summary:
      "Search visibility built on a sound technical base, then earned through useful content and clear site structure.",
    items: [
      "Technical SEO",
      "On-page SEO",
      "Keyword research",
      "Content strategy",
      "Search Console analysis",
      "Local SEO",
    ],
  },
  {
    slug: "google-ads",
    index: "02",
    title: "Google Ads",
    summary:
      "Campaigns that are tied to real conversions, sent to pages built to convert, and tuned on what the data shows.",
    items: [
      "Search campaigns",
      "Demand Gen",
      "Conversion tracking",
      "Landing page optimization",
      "Campaign optimization",
    ],
  },
  {
    slug: "meta-ads",
    index: "03",
    title: "Meta Ads",
    summary:
      "Lead generation and retargeting on Facebook and Instagram, with creative tested methodically rather than guessed.",
    items: [
      "Lead generation",
      "Creative testing",
      "Retargeting",
      "Funnel strategy",
      "Conversion tracking",
    ],
  },
  {
    slug: "analytics-tracking",
    index: "04",
    title: "Analytics & Tracking",
    summary:
      "Measurement you can trust: correct tags, meaningful events and reports that answer business questions.",
    items: [
      "GA4",
      "Google Tag Manager",
      "Google Search Console",
      "Conversion tracking",
      "Performance reporting",
    ],
  },
  {
    slug: "websites-landing-pages",
    index: "05",
    title: "Websites & Landing Pages",
    summary:
      "Fast, search-ready sites and landing pages designed around one job: turning visits into enquiries.",
    items: [
      "WordPress",
      "Landing pages",
      "SEO-ready websites",
      "Conversion-focused design",
    ],
  },
  {
    slug: "ai-automation",
    index: "06",
    title: "AI & Automation",
    summary:
      "Practical workflows that remove repetitive marketing work and speed up research and reporting.",
    items: [
      "Marketing automation",
      "Data workflows",
      "AI-assisted research",
      "Reporting automation",
      "Custom workflows",
    ],
  },
];
