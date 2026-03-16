import { json } from '@sveltejs/kit';
import { saveRecipeFeedback } from '$lib/server/recipe-store';
import type { RequestHandler } from './$types';
import type { FeedbackPayload } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as FeedbackPayload;
	const recipe = await saveRecipeFeedback(body.recipe, body.action);
	return json({ recipe });
};
