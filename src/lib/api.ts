/**
 * Thin API client for the VuliStudy Flask backend.
 *
 * These mirror the existing backend routes one-to-one. No state is cached here
 * and nothing is written to localStorage — callers own any in-memory state.
 */
import { API_BASE_URL } from './config';

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/** POST /check-active — does this username exist, and is it currently active? */
export type CheckActiveResponse = { active: boolean; exists?: boolean };
export function checkActive(username: string) {
  return postJson<CheckActiveResponse>('/check-active', { username });
}

/** POST /rejoin — reactivate a username that had gone inactive. */
export type RejoinResponse = { success: boolean };
export function rejoin(username: string) {
  return postJson<RejoinResponse>('/rejoin', { username });
}

/** POST /set-username — create a brand new user. */
export type SetUsernameResponse = { success: boolean; error?: string };
export function setUsername(username: string) {
  return postJson<SetUsernameResponse>('/set-username', { username });
}
