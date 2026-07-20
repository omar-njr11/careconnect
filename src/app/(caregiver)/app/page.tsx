import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CaregiverHome() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'caregiver') redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-light text-slate-700 mb-8">Hello, {session.user.name}</h1>
      
      <a 
        href="/app/triage" 
        className="w-full max-w-md bg-indigo-600 text-white text-2xl font-semibold py-8 rounded-2xl shadow-lg text-center hover:bg-indigo-700 transition-colors mb-4"
      >
        What's wrong?
      </a>
      
      <div className="flex space-x-4 mt-4 text-slate-500 text-sm">
        <a href="/app/care-log" className="hover:text-indigo-600">Care Log</a>
        <span>•</span>
        <a href="/app/summary" className="hover:text-indigo-600">Weekly Summary</a>
        <span>•</span>
        <a href="/app/family" className="hover:text-indigo-600">Family Sharing</a>
      </div>
    </div>
  );
}