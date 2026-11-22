import { headers } from 'next/headers';
import { readProviderUser } from '../lib/provider-auth';

export type ChatGPTUser = { userId: string; displayName: string; email: string; fullName: string | null };

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  return readProviderUser(await headers());
}
