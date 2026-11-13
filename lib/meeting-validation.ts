import { z } from "zod";

const seatCount = z.preprocess(
  (value) => (value === "" ? null : value),
  z.coerce.number().int().positive().max(200).nullable().optional(),
);

export const MeetingSchema = z.object({
  title: z.string().trim().min(1),
  date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
  location: z.string().trim().min(1),
  quorum: z.coerce.number().min(1).max(100),
  firstPassers: seatCount,
  secondPassers: seatCount,
  winnerCount: seatCount,
});

export const UpdateMeetingSchema = MeetingSchema.partial();
