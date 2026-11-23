// Only known course and review paths may override the normal home-page return.
export function learningReturn(value: unknown) {
  const review = /^\/suggestions\/review(?:\?id=[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})?$/i;
  return typeof value === 'string' && (review.test(value) || /^\/self-paced(?:\/[a-z0-9-]+)?$/.test(value)) ? value : '/';
}
