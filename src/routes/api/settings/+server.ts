import { json } from '@sveltejs/kit';
import { getPromptSettings, savePromptSettings } from '$lib/server/recipe-store';
import type { RequestHandler } from './$types';
import type { PromptSettings } from '$lib/types';

export const GET: RequestHandler = async () => {
	const settings = await getPromptSettings();
	return json({ settings });
};

export const PUT: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as { settings: PromptSettings };
	const settings = await savePromptSettings(body.settings);
	return json({ settings });
};
