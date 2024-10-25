import type { NostrEvent } from '@blowater/nostr-sdk';
import { copyURL, handleResponse } from '../../helpers/_helper.ts';
import { safeFetch } from '../../helpers/safe-fetch.ts';
import type { Interest } from '../../models/interest.ts';

// CreateInterestsPost
interface CreateInterestsPost {
	event: NostrEvent;
	interestIds: number[];
}

export const getInterests = (urlArg: URL) => async () => {
	const url = copyURL(urlArg);
	url.pathname = `/interests`;

	const response = await safeFetch(url, {
		method: 'GET'
	});
	if (response instanceof Error) {
		return response;
	}
	const results = await handleResponse<Interest[]>(response);
	if (results instanceof Error) {
		return results;
	}
	return results.filter((i) => i.name != 'Default');
};

export const createInterests =
	(urlArg: URL, getJwt: () => string) => async (event: NostrEvent, interests: Interest[]) => {
		const jwtToken = getJwt();
		if (jwtToken == '') {
			return new Error('jwt token is empty');
		}

		const url = copyURL(urlArg);
		url.pathname = `/createInterests`;

		const headers = new Headers();
		headers.set('Authorization', `Bearer ${jwtToken}`);

		const createInterestsPost: CreateInterestsPost = {
			event,
			interestIds: interests.map((i) => i.id)
		};

		const response = await safeFetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(createInterestsPost)
		});
		if (response instanceof Error) {
			return response;
		}
		return handleResponse<Interest[]>(response);
	};
