import { Event } from '../types/event';

// Static events data for the Voices Ignited website
export const events: Event[] = [
  {
    title: "Community Meeting",
    description: "Monthly community gathering to discuss local issues",
    date: new Date("2025-04-01").toISOString(),
    location: "Community Center",
    type: "meeting"
  },
  {
    title: "Fundraising Event",
    description: "Annual fundraiser for local initiatives",
    date: new Date("2025-05-15").toISOString(),
    location: "Town Hall",
    type: "fundraiser"
  }
];
