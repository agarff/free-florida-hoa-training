import { lessonVersion, lessons } from './course';
import { caseExercises, certificationPrimers, selfPacedVersion } from './self-paced';
import { teaching } from './teaching';
import { learningVideos } from './videos';

export const statuses = {
  received: 'Received',
  review: 'Under review',
  awaiting: 'Awaiting maintainer approval',
  published: 'Published',
  declined: 'Declined',
} as const;

export type ContributionStatus = keyof typeof statuses;
export type Track = 'guide' | 'self-paced';
export type ExactChange = { before: string; after: string };
export type PublicSuggestion = {
  id: string; lessonId: string; edition: string; track: Track; issue: string;
  proposal: string; source: string; displayName: string; status: ContributionStatus;
  publicNote: string; createdAt: string; approvedAt: string | null;
  publishedEdition: string | null; publishedAt: string | null;
};
export type PublicComment = { id: string; body: string; displayName: string; createdAt: string };
export type ReviewSuggestion = PublicSuggestion & {
  contact: string; visible: number; revision: number; approvedText: string | null;
};
export type ReviewComment = PublicComment & { moderation: string; revision: number };
export type AuditEvent = { id: string; action: string; details: string; createdAt: string };
export const contributionPageSize = 20;
export const limits = { issue: 1000, proposal: 2400, source: 500, displayName: 60, contact: 254, body: 1200, note: 400 } as const;
export const contributionLessons = lessons.map(lesson => ({
  id: lesson.id, title: lesson.title, guide: lessonVersion(lesson), 'self-paced': selfPacedVersion(lesson),
}));
export const contributionTarget = (id: unknown, track: unknown) =>
  track === 'guide' || track === 'self-paced' ? contributionLessons.find(l => l.id === id)?.[track] : undefined;

export function suggestionLink(id: string, track: Track, edition: string) {
  return '/suggestions?' + new URLSearchParams({ lesson: id, track, edition }).toString() + '#suggest';
}

// Approval verifies exact text against the lesson edition the owner is reviewing.
export function includesCourseText(lessonId: string, track: Track, wording: string): boolean {
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson || !wording) return false;
  const { id, version, ...content } = lesson;
  const fields: unknown[] = [content, teaching[id], learningVideos[id]];
  if (track === 'self-paced') fields.push(caseExercises[id], certificationPrimers[id]);
  const includes = (value: unknown): boolean => {
    if (typeof value === 'string') return value.replace(/\r\n/g, '\n').includes(wording);
    return !!value && typeof value === 'object' && Object.values(value).some(includes);
  };
  return fields.some(includes);
}
