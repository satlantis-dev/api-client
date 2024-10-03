import { NostrKind, prepareNostrEvent, type NostrEvent } from '@blowater/nostr-sdk';
import { copyURL, handleResponse } from '../../helpers/_helper.ts';
import { safeFetch } from '../../helpers/safe-fetch.ts';
import {
	type Account,
	type func_GetJwt,
	type func_GetNostrSigner,
	type PlaceCalendarEvent
} from '../../sdk.ts';

export interface PlaceCalendarEventPost {
	event: NostrEvent;
	placeId: number;
}

export const postPlaceCalendarEvent =
	(urlArg: URL, getJwt: () => string) => async (args: PlaceCalendarEventPost) => {
		const jwtToken = getJwt();
		if (jwtToken == '') {
			return new Error('jwt token is empty');
		}

		const url = copyURL(urlArg);
		url.pathname = `/secure/createPlaceCalendarEvent`;

		const headers = new Headers();
		headers.set('Authorization', `Bearer ${jwtToken}`);

		const body = JSON.stringify(args);

		const response = await safeFetch(url, {
			method: 'POST',
			body,
			headers
		});
		if (response instanceof Error) {
			return response;
		}
		return handleResponse<PlaceCalendarEvent>(response);
	};

export const postCalendarEventRSVP =
	(urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
	async (args: {
		response: 'accepted' | 'maybe' | 'declined' | 'tentative';
		calendarEvent: {
			accountId: number;
			calendarEventId: number;
			dtag: string;
			pubkey: string;
		};
	}) => {
		const jwtToken = getJwt();
		if (jwtToken == '') {
			return new Error('jwt token is empty');
		}

		const signer = await getSigner();
		if (signer instanceof Error) {
			return signer;
		}

		const uuid = crypto.randomUUID();
		const dTag = args.calendarEvent.dtag;
		const aTag = `${NostrKind.Calendar_Time}:${args.calendarEvent.pubkey}:${dTag}`;

		const event = await prepareNostrEvent(signer, {
			kind: 91925 as NostrKind,
			content: '',
			tags: [
				['a', aTag],
				['d', uuid],
				['status', 'accepted']
			]
		});
		if (event instanceof Error) {
			return event;
		}

		const url = copyURL(urlArg);
		url.pathname = `/secure/postCalendarEventRSVP`;

		const headers = new Headers();
		headers.set('Authorization', `Bearer ${jwtToken}`);

		const response = await safeFetch(url, {
			method: 'POST',
			body: JSON.stringify({
				accountId: args.calendarEvent.accountId,
				calendarEventId: args.calendarEvent.calendarEventId,
				event,
				status: args.response
			}),
			headers
		});
		if (response instanceof Error) {
			return response;
		}
		return handleResponse<Account>(response);
	};
