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
import { Building2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Department {
  id: number;
  name: string;
  managerId: number | null;
  employees: any[];
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await api.get("/hrm/departments");
        setDepartments(response.data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center">
          <Building2 className="mr-3 h-8 w-8 text-pink-500" />
          Departments
        </h2>
        <p className="text-slate-400 mt-2">
          Manage company divisions and view their registered employees.
        </p>
      </div>

      <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">All Departments</CardTitle>
          <CardDescription className="text-slate-400">
            A list of all departments active in the ERP system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">ID</TableHead>
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Manager ID</TableHead>
                <TableHead className="text-slate-400 text-right">Headcount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow
                    key={dept.id}
                    className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-300">
                      #{dept.id}
                    </TableCell>
                    <TableCell className="text-white">{dept.name}</TableCell>
                    <TableCell>
                      {dept.managerId ? (
                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                          ID: {dept.managerId}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-slate-300">
                        {dept.employees?.length || 0}
                        <Users className="ml-2 h-4 w-4 text-slate-500" />
                      </div>
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
