// Canonical internal-link targets.
//
// WHY THIS FILE EXISTS: the repo carries two taxonomies that grew independently.
//
//   - The DIRECTORY layer's ten disciplines are the vendor DB's `category` values. They are
//     data, not editorial choice — a pillar page exists because vendors are filed under that
//     category, so the set cannot be extended without vendors to fill it.
//   - The EDITORIAL layer (questions, comparisons, news) was written against the topic names a
//     buyer actually types: "Marketing Automation", "Paid Advertising", "Analytics/Attribution".
//
// Five editorial topics had no matching pillar slug and one entity naming convention differed
// from the other, so the builders emitted 60 internal links to pages that were never built.
// Every one returned the GitHub Pages 404 — from 46 published pages, silently, for as long as
// those pages have been live.
//
// The alias table below is the single place the two taxonomies are reconciled. Link emission
// goes through it, and audit-seo.mjs fails the build on any internal link that does not
// resolve to a file on disk, so a new alias gap cannot ship unnoticed again.
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

// The ten real disciplines. Mirrors PILLARS[].slug in build-pillars.mjs.
export const PILLARS = ['sales', 'marketing', 'seo', 'thought-leadership', 'creative-strategy',
  'automation', 'demand-gen', 'content-marketing', 'social-media-marketing', 'ai-marketing'];

export const PILLAR_NAME = {
  sales: 'Sales', marketing: 'Marketing', seo: 'SEO', 'thought-leadership': 'Thought Leadership',
  'creative-strategy': 'Creative Strategy', automation: 'Automation', 'demand-gen': 'Demand Gen',
  'content-marketing': 'Content Marketing', 'social-media-marketing': 'Social Media Marketing',
  'ai-marketing': 'AI Marketing'
};

// editorial topic slug -> real discipline slug.
// The first two are exact renames. The last three are judgement calls about which vendor set a
// reader of that topic is actually shopping for, flagged here so they are easy to revisit:
//   sales-automation     -> automation   (the firms doing the work sit in Automation, not Sales)
//   paid-advertising     -> demand-gen   (Demand Gen is where paid acquisition vendors are filed)
//   analytics-attribution-> marketing    (no measurement discipline exists; Marketing is broadest)
export const PILLAR_ALIAS = {
  'social-media': 'social-media-marketing',
  'marketing-automation': 'automation',
  'sales-automation': 'automation',
  'paid-advertising': 'demand-gen',
  'analytics-attribution': 'marketing'
};

// Comparison slugs are written as "a-vs-b" using short tool names; the entity pages are filed
// under the vendor's full product name. Same reconciliation, different layer.
export const ENTITY_ALIAS = {
  chatgpt: 'openai-chatgpt',
  claude: 'anthropic-claude',
  activecampaign: 'active-campaign',
  'meta-ads': 'meta-ads-manager',
  'linkedin-ads': 'linkedin-campaign-manager'
};

// Tools referenced in comparison copy that have no entity page. Linking them 404s; inventing
// the pages would mean publishing profiles nobody wrote. They render as plain text until the
// pages exist, and are listed here so the backlog is visible rather than lost.
export const ENTITY_MISSING = ['airtable', 'notion', 'rudderstack', 'salesloft'];

/** Resolve an editorial pillar slug to the real discipline. Returns {slug, name}. */
export function pillar(s) {
  const slug = PILLAR_ALIAS[s] || s;
  if (!PILLARS.includes(slug)) throw new Error(`slugs: no discipline for "${s}" — add it to PILLAR_ALIAS`);
  return { slug, name: PILLAR_NAME[slug] };
}

/** Resolve an entity slug. Returns the canonical slug, or null when no page exists. */
export function entity(s) {
  const slug = ENTITY_ALIAS[s] || s;
  return existsSync(join(ROOT, 'entities', `${slug}.html`)) ? slug : null;
}
