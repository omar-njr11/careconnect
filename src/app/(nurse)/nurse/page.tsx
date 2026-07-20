import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function NurseDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'nurse') redirect('/login');

  const assignments = await prisma.familyNurseAssignment.findMany({
    where: { nurseId: session.user.id, status: 'active' },
    include: { family: true }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Assigned Families</h1>
      <div className="space-y-4">
        {assignments.map(ass => (
          <div key={ass.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Family {ass.familyId.substring(0, 5)}</h3>
              <p className="text-sm text-slate-500">Assigned: {ass.assignedAt.toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">2h SLA</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}