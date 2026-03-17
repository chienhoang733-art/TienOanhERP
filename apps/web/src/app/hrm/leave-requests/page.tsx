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
import { CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaveRequest {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  employee?: {
    fullName: string;
  };
}

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await api.get("/hrm/leave-requests");
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch leave requests", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center">
          <CalendarDays className="mr-3 h-8 w-8 text-amber-500" />
          Leave Requests
        </h2>
        <p className="text-slate-400 mt-2">
          Monitor and manage employee time-off applications.
        </p>
      </div>

      <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Active Requests</CardTitle>
          <CardDescription className="text-slate-400">
            A comprehensive log of all pending and resolved leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Employee</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400">Reason</TableHead>
                <TableHead className="text-slate-400 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow
                    key={req.id}
                    className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-300">
                      {req.employee?.fullName || `ID: ${req.employeeId}`}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </TableCell>
                    <TableCell className="text-slate-400 max-w-[200px] truncate">
                      {req.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(req.status)}
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
