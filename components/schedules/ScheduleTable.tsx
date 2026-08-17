import { WEEKDAYS } from "@/lib/constants";
import type { Schedule } from "@/types";
export default function ScheduleTable({ schedules }: { schedules: Schedule[] }) { return <table><thead><tr><th>Day</th><th>Waste type</th><th>Time</th><th>Notes</th></tr></thead><tbody>{WEEKDAYS.map(day => { const row = schedules.find(schedule => schedule.weekday === day); return <tr key={day}><td>{day}</td><td>{row?.wasteType ?? "No collection"}</td><td>{row?.collectionTime ?? "—"}</td><td>{row?.notes ?? "—"}</td></tr>; })}</tbody></table>; }
