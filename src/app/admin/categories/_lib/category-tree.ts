import type { Category } from "@/api/generated/types.gen";

export interface CategoryNode extends Category {
  children: CategoryNode[];
  depth: number;
}

/**
 * The flat list `/categories` returns, rebuilt into the tree it describes.
 *
 * A row whose `parent_id` names a category not in the list is treated as a root rather
 * than dropped: the endpoint returns the whole tree, so that can only happen mid-write,
 * and losing a branch off the screen is a worse answer than showing it detached.
 */
export function buildTree(categories: ReadonlyArray<Category>): CategoryNode[] {
  const byId = new Map<string, CategoryNode>();
  for (const category of categories) {
    byId.set(category.id, { ...category, children: [], depth: 0 });
  }

  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parent_id === null ? undefined : byId.get(node.parent_id);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const byName = (a: CategoryNode, b: CategoryNode) => a.name.localeCompare(b.name, "vi");
  const setDepth = (nodes: CategoryNode[], depth: number) => {
    nodes.sort(byName);
    for (const node of nodes) {
      node.depth = depth;
      setDepth(node.children, depth + 1);
    }
  };
  setDepth(roots, 0);
  return roots;
}

/** The tree walked into a list, for a parent picker that has to show the shape. */
export function flatten(nodes: ReadonlyArray<CategoryNode>): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

/** How a node reads in a picker: indentation is the only thing carrying the hierarchy. */
export function indentLabel(node: CategoryNode): string {
  return `${"— ".repeat(node.depth)}${node.name}`;
}
