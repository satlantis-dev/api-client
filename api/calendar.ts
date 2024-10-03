import { CalendarEventType } from "../models/calendar.ts";

export const getEventTypeUsingName = (id: string): CalendarEventType => {
    switch (id) {
        case "Conference":
            return CalendarEventType.Conference;
        case "Meetup":
            return CalendarEventType.Meetup;
        case "Hackathon":
            return CalendarEventType.Hackathon;
        case "Concert":
            return CalendarEventType.Concert;
        case "Workshop":
            return CalendarEventType.Workshop;
        case "Party":
            return CalendarEventType.Party;
        case "Play":
            return CalendarEventType.Play;
        case "Sports":
            return CalendarEventType.Sports;
        case "Exhibition":
            return CalendarEventType.Exhibition;
        case "Festival":
            return CalendarEventType.Festival;
        case "Music":
            return CalendarEventType.Music;
        default:
            return CalendarEventType.Other;
    }
};
