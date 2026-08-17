import { User } from "./models/User";
import { ApiError } from "./utils/ApiError";

export async function getResidentZoneId(userId: string) {
  const user = await User.findById(userId).select("zoneId accountStatus");
  if (!user) throw new ApiError(404, "User not found");
  if (user.accountStatus === "suspended") throw new ApiError(403, "This account is suspended");
  if (!user.zoneId) throw new ApiError(400, "Select a zone before using this feature");
  return user.zoneId;
}
