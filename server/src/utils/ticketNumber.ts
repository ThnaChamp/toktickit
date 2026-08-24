import { PrismaClient } from "../../generated/prisma/client.js";
export async function generateTicketNumber(prisma: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TKT-${currentYear}-`;

  const lastTicket = await prisma.ticket.findFirst({
    where: {
      ticketNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      id: "desc",
    },
  });
  let nextSeq = 1;
  if (lastTicket) {
    const lastSeqStr = lastTicket.ticketNumber.replace(prefix, "");
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const paddedSeq = String(nextSeq).padStart(6, "0");
  return `${prefix}${paddedSeq}`;
}
