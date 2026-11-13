import type { Prisma } from "@prisma/client";

type Database = Pick<Prisma.TransactionClient, "attendance">;

// The ID on each shareholder's paper card owns that ballot. Representation is
// attendance metadata; it never changes ballot ownership or adds another holding.
export async function voterIdentity(_db: Database, _meetingId: string, voterId: string) {
  return { voterId, aliases: [voterId] };
}
