import { env } from 'cloudflare:workers';
import { getChatGPTUser, type ChatGPTUser } from '../app/chatgpt-auth';
export async function isInstructor() {
 return isInstructorUser(await getChatGPTUser());
}
export function isInstructorUser(u: ChatGPTUser | null) {
 return !!u && !!env.INSTRUCTOR_EMAIL && u.email.toLowerCase()===env.INSTRUCTOR_EMAIL.toLowerCase();
}
export const roster: { id: string; name: string; email: string }[] = [];
export function sameOrigin(request:Request) { return request.headers.get('origin')===new URL(request.url).origin; }
