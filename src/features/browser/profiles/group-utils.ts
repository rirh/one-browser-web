const groupAliases: Record<string, string> = {
  commerce: '电商',
  work: '工作',
};

export function normalizeProfileGroup(value?: string | null) {
  const trimmed = value?.trim() ?? '';

  return groupAliases[trimmed] ?? trimmed;
}

export function buildProfileGroupOptions(
  groups: Array<string | null | undefined>,
  currentGroup?: string | null,
) {
  const seen = new Set<string>();
  const options: string[] = [];

  function addGroup(value?: string | null) {
    const group = normalizeProfileGroup(value);

    if (!group || seen.has(group)) {
      return;
    }

    seen.add(group);
    options.push(group);
  }

  groups.forEach(addGroup);
  addGroup(currentGroup);

  return options;
}
