export function enforceComplementRules(items, primaryCategories, complementCategories) {
  const containsPrimary = items.some((entry) => primaryCategories.includes(entry.category));
  if (containsPrimary) return items;
  return items.filter((entry) => !complementCategories.includes(entry.category));
}
