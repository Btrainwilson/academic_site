export interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  url?: string;
  pdf?: string;
}

export interface Conference {
  title: string;
  authors: string;
  venue: string;
  year: number;
  url?: string;
  pdf?: string;
}

/** Uniform row for CV lists (education, service, funding, etc.). */
export interface CvItem {
  title: string;
  subtitle?: string;
  date?: string;
  detail?: string;
}

export interface CvMentee {
  name: string;
  lastKnownLocation?: string;
}

/** Student highlights plus full mentee roster; see `src/data/cv/mentorship.json`. */
export interface CvMentorshipData {
  highlights: CvItem[];
  mentees: CvMentee[];
}

/** @deprecated Legacy single-file CV shape; prefer `src/data/cv/*.json`. */
export interface CvData {
  education: CvItem[];
  positions: CvItem[];
  awards: CvItem[];
}

export interface CvExperienceHead {
  title: string;
  subtitle: string;
  location: string;
  date: string;
  link?: string;
}

export interface CvExperienceBullet {
  text: string;
  links?: string[];
}

export interface CvExperienceRole {
  id: string;
  head: CvExperienceHead;
  bullets: CvExperienceBullet[];
}

export interface CvExperienceData {
  roles: CvExperienceRole[];
  order?: string[];
}

export interface CvPaper {
  authors: string;
  title: string;
  citation: string;
  link?: string;
  additional_info?: string;
}

export interface CvNewsItem {
  title: string;
  location: string;
  date: string;
  link?: string;
}

export interface CvContactBannerItem {
  imgsrc?: string;
  body: string;
  link: string;
}

/** Flagship product or project link, shown prominently on the CV header. */
export interface CvProductHighlight {
  label: string;
  url: string;
  /** Short line beside the link (e.g. one-sentence pitch). */
  subtitle?: string;
}

export interface CvProfile {
  /** Shown as the main CV heading (e.g. full legal name). */
  fullName?: string;
  /** One line under the name (e.g. current role and organization). */
  currentPosition?: string;
  /** Optional prominent product URL (e.g. company flagship). */
  productHighlight?: CvProductHighlight;
  urls: Record<string, string>;
  interests: string[];
  skillList: string[];
  summaries: Record<string, string | undefined>;
  statementsNote?: string;
  contactBanner?: CvContactBannerItem[];
}

export interface CvService {
  leadership: CvItem[];
  speaking: CvItem[];
  refereeRoles: CvItem[];
  teachingRoles: CvItem[];
  competitions: CvItem[];
  extWork: CvItem[];
}

export interface CvFundingData {
  grants: CvItem[];
  fellowships: CvItem[];
  funding: CvItem[];
}

/** Landing page hero — paths are under `public/`. */
/** Short lines under the profile photo on the landing hero. */
export interface LandingHeroSidebarBio {
  education?: string;
  /** Comma-separated or shown as a short list */
  researchInterests?: string;
  role?: string;
  location?: string;
}

export interface LandingHero {
  profileImage: string;
  tagline?: string;
  /** Key into `CvProfile.summaries`; ignored if `description` is set. */
  summaryKey?: string;
  /** Overrides summary from profile when set. */
  description?: string;
  cta?: LandingHeroCta[];
  /** Facts under the profile image and social icons (education, interests, role, location). */
  sidebarBio?: LandingHeroSidebarBio;
}

export interface LandingHeroCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface LandingCollaborator {
  name: string;
  logo: string;
  href?: string;
}

export interface LandingAnnouncement {
  title: string;
  body: string;
  date?: string;
  link?: string;
}

export interface LandingNewsItem {
  headline: string;
  date: string;
  link?: string;
  source?: string;
}

export interface ResearchWork {
  title: string;
  authors?: string;
  venue?: string;
  year?: number;
  url?: string;
  /** "project" for non-publication items; omit for papers. */
  type?: "project";
  description?: string;
}

export interface ResearchDirection {
  id: string;
  title: string;
  /** Short description shown on landing page cards. */
  description: string;
  /** Extended description shown on the detail page. */
  longDescription?: string;
  /** Path to card/banner image (relative to public/). */
  image?: string;
  /** Lucide icon name. */
  icon: string;
  tags: string[];
  works: ResearchWork[];
}
