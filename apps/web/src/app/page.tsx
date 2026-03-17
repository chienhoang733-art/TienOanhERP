import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CalendarDays } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-slate-400">Welcome back to TienOanh ERP Overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Employees Card */}
        <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-xl hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">256</div>
            <p className="text-xs text-slate-400 mt-1">
              +12 from last month
            </p>
          </CardContent>
        </Card>

        {/* Departments Card */}
        <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-xl hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Departments
            </CardTitle>
            <Building2 className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">8</div>
            <p className="text-xs text-slate-400 mt-1">
              Active divisions
            </p>
          </CardContent>
        </Card>

        {/* Leave Requests Card */}
        <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-xl hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Pending Leave Requests
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">14</div>
            <p className="text-xs text-slate-400 mt-1">
              Needs approval
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
