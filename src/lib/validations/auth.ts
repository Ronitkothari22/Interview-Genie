import * as z from "zod";

export const verifyOTPSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6),
});
