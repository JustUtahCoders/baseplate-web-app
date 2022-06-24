import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

export function unmistakablyIntelligibleDateFormat(
  date: Date | string | null | undefined
): string {
  if (!date) {
    return "\u2014";
  } else {
    return dayjs(date).format("YYYY-MM-DD hh:mm z");
  }
}
