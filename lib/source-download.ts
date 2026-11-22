export const SOURCE_DOWNLOAD = '/downloads/free-florida-hoa-training-source.zip';

// Set this only after the owner verifies that the repository is public and belongs to the project.
export function verifiedRepositoryUrl(value?: string) {
  const url = value?.trim();
  return url && /^https:\/\/github\.com\/[a-z\d][a-z\d-]*\/[a-z\d_.-]+\/?$/i.test(url) ? url : undefined;
}
