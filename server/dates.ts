const COLOMBO_TIME_ZONE = "Asia/Colombo";

export const localDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: COLOMBO_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
};

export const today = () => localDate();

const weekdayName = (voteDate: string) => new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: COLOMBO_TIME_ZONE }).format(new Date(`${voteDate}T00:00:00+05:30`));

export const isCollectionDay = (voteDate: string) => weekdayName(voteDate) !== "Sunday";

const addDays = (offset: number) => {
  const next = new Date();
  next.setUTCDate(next.getUTCDate() + offset);
  return localDate(next);
};

export const recentCollectionDates = () => {
  const dates: string[] = [];
  let offset = 0;
  while (dates.length < 7) {
    const date = addDays(offset);
    if (isCollectionDay(date)) dates.unshift(date);
    offset -= 1;
  }
  return dates;
};
