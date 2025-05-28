export async function fetchPackages(query = '', signal) {
  const url = query
    ? `/packages/search?query=${encodeURIComponent(query)}`
    : `/packages/default`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || !data.every(pkg => typeof pkg.package_name === 'string')) {
    throw new Error('Invalid packages data format');
  }
  return data;
}

export async function fetchSuggestions(query, signal) {
  const url = `/packages/suggestions?query=${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || !data.every(pkg => typeof pkg.package_name === 'string')) {
    throw new Error('Invalid suggestions data format');
  }
  return data;
}

export async function fetchPackagesByTags(tags, signal) {
  if (!tags.length) return [];
  const url = `/packages/filter?tags=${encodeURIComponent(tags.join(','))}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || !data.every(pkg => typeof pkg.package_name === 'string')) {
    throw new Error('Invalid packages data format');
  }
  return data;
}

export async function fetchTags(signal) {
  const url = `/packages/get_tags`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || !data.every(tag => 'tag' in tag && 'category' in tag)) {
    throw new Error('Invalid tags data format');
  }
  return data;
}