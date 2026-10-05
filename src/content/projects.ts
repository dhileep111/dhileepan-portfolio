/**
 * Project data. RULES:
 *  - Only add `metrics` when you have verified numbers (reports, exports).
 *  - Only add `evidence` for real screenshots placed in /public/projects/<slug>/.
 *  - Case-study sections render only when populated, so nothing is invented.
 *  - A project's page is added to the sitemap and made indexable only when
 *    `caseStudy` has real content (see isPublishedCaseStudy).
 */

export type Metric = { value: string; label: string };

export type Evidence = {
  src: string; // e.g. "/projects/vethathiri-sky-yoga/search-console.png"
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export type Site = {
  label: string;
  url: string;
  image: string; // /projects/<slug>/<name>.webp (made by scripts/process-screenshots.py)
  alt: string;
};

export type CaseStudy = {
  overview?: string;
  challenge?: string;
  strategy?: string[];
  implementation?: string[];
  tools?: string[];
  outcome?: string;
  learnings?: string[];
};

export type Project = {
  slug: string;
  name: string;
  industry: string;
  services: string[];
  description: string;
  /** Verified, reported numbers only. */
  metrics?: {
    period: string; // e.g. "May 2026 Campaign"
    note: string;
    items: Metric[];
  };
  /** Live websites built/managed. Screenshots appear automatically once the image file exists. */
  sites?: Site[];
  evidence?: Evidence[];
  caseStudy?: CaseStudy;
};

export const projects: Project[] = [
  {
    slug: "vethathiri-kundalini-yoga",
    name: "Vethathiri SKY Yoga & Kundalini Yoga Academy",
    industry: "Yoga education",
    services: [
      "SEO",
      "Google Ads",
      "Meta Ads",
      "Websites & Landing Pages",
      "Analytics",
      "Lead Generation",
    ],
    description:
      "Two websites for the same yoga education organisation, supported by search optimisation, paid campaigns and analytics and tracking.",
    sites: [
      {
        label: "Vethathiri SKY Yoga",
        url: "https://vethathiriskyyoga.com/",
        image: "/projects/vethathiri-kundalini-yoga/vethathiri.webp",
        alt: "Home page of the Vethathiri SKY Yoga website",
      },
      {
        label: "Kundalini Yoga Academy",
        url: "https://www.kundaliniyoga.edu.in/",
        image: "/projects/vethathiri-kundalini-yoga/kundalini.webp",
        alt: "Home page of the Kundalini Yoga Academy website",
      },
    ],
    // Results are intentionally not shown for now. Verified May 2026 campaign
    // figures (Vethathiri SKY Yoga) can be re-enabled by uncommenting:
    // metrics: {
    //   period: "May 2026 Campaign",
    //   note: "Based on campaign reporting data.",
    //   items: [
    //     { value: "₹19.9K", label: "Ad Spend" },
    //     { value: "₹65K", label: "Revenue" },
    //     { value: "3.26×", label: "ROAS" },
    //     { value: "27", label: "Enrollments" },
    //   ],
    // },
  },
  {
    slug: "raintree-immigration",
    name: "RainTree Immigration",
    industry: "Immigration services",
    services: ["Website Development", "SEO", "Digital Marketing"],
    description:
      "A professional website built for enquiries, with an SEO foundation and supporting digital marketing.",
  },
  {
    slug: "ai-marketing-automation",
    name: "AI & Marketing Automation",
    industry: "Internal systems",
    services: ["AI", "Automation", "Data", "Marketing Systems"],
    description:
      "Workflows that combine data, scripts and AI tools to speed up research, reporting and repetitive marketing tasks.",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function isPublishedCaseStudy(p: Project) {
  const c = p.caseStudy;
  return Boolean(c && (c.overview || c.challenge || c.outcome));
}
