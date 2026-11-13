export const representativeMeetingFilter = (meetingId: string) => ({ OR: [
  { registeredForMeetingId: meetingId },
  { representedBy: { some: { meetingId } } },
  { representations: { some: { meetingId } } },
] });
