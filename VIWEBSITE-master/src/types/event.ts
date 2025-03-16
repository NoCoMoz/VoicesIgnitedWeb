/**
 * Interface representing an event in the Voices Ignited calendar
 */
export interface Event {
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface EventResponse {
  success: boolean;
  message: string;
  data?: Event;
}
