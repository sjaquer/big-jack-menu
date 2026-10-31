export function applyComplementRules(items, primaryCategories, complementCategories) {
  const containsPrimary = items.some((entry) => primaryCategories.includes(entry.category));
  if (containsPrimary) return { items, removed: [] };

  const removed = items.filter((entry) => complementCategories.includes(entry.category));
  return {
    items: items.filter((entry) => !complementCategories.includes(entry.category)),
    removed,
  };
}

export function enforceComplementRules(items, primaryCategories, complementCategories) {
  return applyComplementRules(items, primaryCategories, complementCategories).items;
}

