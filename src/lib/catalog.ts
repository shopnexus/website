import { apiClient, type Schemas, unwrap } from './api/client';
import { img } from './format';

// The category tree from GET /v1/categories, read once per 10 minutes per
// process. URLs name a category by its code (/categories/phones); the icons
// and tile photos are the site's own, after the app's editorial looks.

export interface Category {
  code: string;
  name: string;
  icon: string;
  /** The tile's photo URL. */
  photo: string;
  /** Specs a listing here must give, by label. */
  specs: string[];
  children: Category[];
}

const LOOKS: Record<string, [icon: string, photo: string]> = {
  phones: ['mobile-outline-rounded', '1632661674596-df8be070a5c5'],
  laptop: ['laptop-chromebook-outline-rounded', '1611186871348-b1ce696e52c9'],
  fashion: ['apparel-outline-rounded', '1593030761757-71fae45fa0e7'],
  vehicles: ['two-wheeler-outline-rounded', '1558981403-c5f9899a28bc'],
  furniture: ['chair-outline-rounded', '1555041469-a586c61ea9bc'],
  home: ['blender-outline-rounded', '1585515320310-259814833e62'],
  baby: ['child-care-outline-rounded', '1515488042361-ee00e0ddd4e4'],
  sports: ['sports-tennis-outline-rounded', '1554068865-24cecd4e34b8'],
  camera: ['photo-camera-outline-rounded', '1516035069371-29a1b244cc32'],
  books: ['menu-book-outline-rounded', '1495446815901-a7297e633e8d'],
  beauty: ['face-retouching-natural-outline-rounded', '1596462502278-27bfdc403348'],
  hobby: ['sports-esports-outline-rounded', '1510915361894-db8b60106cb1'],
  pets: ['pets-outline-rounded', '1548199973-03cce0bbc87b'],
  other: ['category-outline-rounded', '1526170375885-4d8ecf77b99f'],
};

function tree(items: Schemas['Category'][]): Category[] {
  const node = (c: Schemas['Category'], root?: string): Category => {
    const [icon, photo] = LOOKS[root ?? c.code] ?? LOOKS.other;
    return { code: c.code, name: c.display_name, icon, photo: img(photo, 480, 480), specs: c.spec_labels, children: [] };
  };
  const roots = items.filter((c) => !c.parent_code).map((c) => node(c));
  for (const c of items) {
    const parent = roots.find((r) => r.code === c.parent_code);
    parent?.children.push(node(c, parent.code));
  }
  return roots;
}

let cached: { at: number; run: Promise<Category[]> } | undefined;

/** The roots with their subcategories, in the server's order. */
export function categories(): Promise<Category[]> {
  if (!cached || Date.now() - cached.at > 600_000) {
    const run = unwrap(apiClient().GET('/v1/categories')).then((r) => tree(r.items));
    cached = { at: Date.now(), run };
    run.catch(() => (cached = undefined));
  }
  return cached.run;
}

/** A root by its code. */
export async function byCode(code: string) {
  return (await categories()).find((c) => c.code === code);
}

/** Any category by its code, root or sub. */
export async function findCategory(code: string) {
  for (const r of await categories()) {
    if (r.code === code) return r;
    const sub = r.children.find((c) => c.code === code);
    if (sub) return sub;
  }
  return undefined;
}

/** The display name of any category code, root or sub. */
export const categoryName = async (code: string) => (await findCategory(code))?.name;
