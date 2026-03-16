import { json } from '@sveltejs/kit';
import { getMealAssignments, saveMealSelection } from '$lib/server/recipe-store';
import type { RequestHandler } from './$types';
import type { MealSelectionPayload } from '$lib/types';

export const GET: RequestHandler = async () => {
	const assignments = await getMealAssignments();
	return json({ assignments });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as MealSelectionPayload;
	const assignment = await saveMealSelection(body);
	return json({ assignment });
};
