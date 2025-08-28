
export type Slot = {
    startTime: string;   // ISO string
    endTime: string;     // ISO string
    formatted: string;   // örn: "10:00 AM - 10:30 AM"
    day: string;         // örn: "Monday, August 21"
};

export type AvailableDays = {
    date: string;
    displayDate: string;
    slots: Slot[];
}[];