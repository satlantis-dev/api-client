import type { Location } from './location.ts'

export type Collection = {
	"id": number,
	"accountId": number,
	"name": string,
	"description": string,
	"createdAt": string,
	"updatedAt": string,
	"isPublic": boolean,
	"locations": Location[],
	"numLocations": number,
	"numSaves": number
}

