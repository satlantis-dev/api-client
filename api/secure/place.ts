import { copyURL, handleResponse } from '../../helpers/_helper.ts';
import { safeFetch } from '../../helpers/safe-fetch.ts';
import type { Place } from '../../models/place.ts';

export const updatePlace =
	(urlArg: URL, getJwt: () => string) => async (place: Partial<Place>) => {
		if (!place.id) {
			return new Error('place id is empty');
		}

		const jwtToken = getJwt();
		if (jwtToken == '') {
			return new Error('jwt token is empty');
		}

		const url = copyURL(urlArg);
		url.pathname = `/secure/updatePlace/${place.id}`;

		const headers = new Headers();
		headers.set('Authorization', `Bearer ${jwtToken}`);

		const response = await safeFetch(url, {
			method: 'PUT',
			body: JSON.stringify(place),
			headers
		});
		if (response instanceof Error) {
			return response;
		}
		return handleResponse<Place>(response);
	};
