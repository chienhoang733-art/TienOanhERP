"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Mail, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: number;
  fullName: string;
  email: string;
  position: string;
  departmentId: number;
  department?: {
    name: string;
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await api.get("/hrm/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center">
          <Users className="mr-3 h-8 w-8 text-violet-500" />
          Employees Directory
        </h2>
        <p className="text-slate-400 mt-2">
          View all registered company personnel and their assigned roles.
        </p>
      </div>

      <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">All Employees</CardTitle>
          <CardDescription className="text-slate-400">
            A complete roster of employees currently active in the ERP system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 w-[250px]">Employee</TableHead>
                <TableHead className="text-slate-400">Contact</TableHead>
                <TableHead className="text-slate-400">Position</TableHead>
                <TableHead className="text-slate-400 text-right">Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9 border border-slate-700">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.fullName}&backgroundColor=6366f1`} />
                          <AvatarFallback className="bg-indigo-600 text-white">
                            {emp.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-200">{emp.fullName}</div>
                          <div className="text-xs text-slate-500">ID: #{emp.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-300 text-sm">
                        <Mail className="mr-2 h-3.5 w-3.5 text-slate-500" />
                        {emp.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-300 text-sm">
                        <Briefcase className="mr-2 h-3.5 w-3.5 text-slate-400" />
                        {emp.position}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {emp.department ? (
                        <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20">
                          {emp.department.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-sm italic">Unassigned</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
