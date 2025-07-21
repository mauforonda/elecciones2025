export function aggregate_sort(array, key) {
  const total = array.length;
  const counts = array.reduce((acc, obj) => {
    const k = obj[key];
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts)
    .map(([k, count]) => ({ [key]: k, count, percent: count / total }))
    .sort((a, b) => b.count - a.count);

  const lookup = Object.fromEntries(
    entries.map((entry) => [entry[key], entry])
  );

  return { array: entries, keys: lookup };
}
