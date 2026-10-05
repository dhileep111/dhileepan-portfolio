export const processSteps = [
  {
    index: "01",
    title: "Understand",
    body: "Understand the business, audience and current digital system.",
    detail:
      "A direct conversation about what you sell, who buys it and what has been tried. I look at your site, ad accounts and analytics before suggesting anything.",
  },
  {
    index: "02",
    title: "Diagnose",
    body: "Identify problems in SEO, advertising, tracking, website and conversion flow.",
    detail:
      "Most growth problems sit between channels: ads sending traffic to weak pages, or tracking that hides what works. I find where the system leaks.",
  },
  {
    index: "03",
    title: "Build",
    body: "Implement the strategy, campaigns, website improvements and tracking.",
    detail:
      "I do the hands-on work myself: campaigns, tags, pages, technical fixes and automation, so nothing is lost in hand-offs.",
  },
  {
    index: "04",
    title: "Optimize",
    body: "Measure performance and continuously improve what matters.",
    detail:
      "Regular reviews against the metrics that matter to your business, then focused changes based on evidence.",
  },
] as const;

export const toolGroups = [
  {
    group: "Advertising",
    tools: ["Google Ads", "Meta Ads"],
  },
  {
    group: "Analytics & SEO",
    tools: [
      "GA4",
      "Google Search Console",
      "Google Tag Manager",
      "Microsoft Clarity",
    ],
  },
  {
    group: "Build & automate",
    tools: ["WordPress", "Python", "GitHub", "AI tools"],
  },
] as const;

export const skillAreas = [
  "SEO",
  "Paid advertising",
  "Analytics",
  "Websites",
  "Automation",
  "AI",
] as const;
