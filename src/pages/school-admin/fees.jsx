import { useEffect, useRef, useState } from "react";
import {
  PlusIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  RepeatIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknoteIcon,
} from "lucide-react";
import API from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/loading";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { formatNaira, toMinorUnit } from "@/lib/utils";

function formatCurrency(amountInKobo) {
  return formatNaira(amountInKobo);
}

function StatusBadge({ status }) {
  const configs = {
    success: "bg-green-500/10 text-green-600",
    pending: "bg-amber-500/10 text-amber-600",
    failed: "bg-red-500/10 text-red-600",
    refunded: "bg-red-500/10 text-red-600",
  };
  const icons = {
    success: <CheckCircle2Icon className="size-3" />,
    pending: <ClockIcon className="size-3" />,
    failed: <XCircleIcon className="size-3" />,
    refunded: <XCircleIcon className="size-3" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        configs[status] || "bg-muted text-muted-foreground"
      }`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

export default function SchoolAdminFees() {
  const [fees, setFees] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    cycleId: "",
    dueDate: "",
    isRecurring: false,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [feeTypeFilter, setFeeTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [showManualSheet, setShowManualSheet] = useState(false);
  const [manualForm, setManualForm] = useState({
    studentId: "",
    studentName: "",
    feeStructureId: "",
    amount: "",
    paymentMethod: "cash",
    payerName: "",
    payerPhone: "",
    note: "",
  });
  const [studentsForManual, setStudentsForManual] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const studentSearchRef = useRef(null);
  const [manualFeeBalances, setManualFeeBalances] = useState({});

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        studentSearchRef.current &&
        !studentSearchRef.current.contains(e.target)
      ) {
        setShowStudentSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadStudentPayments() {
      if (!manualForm.studentId) {
        setManualFeeBalances({});
        return;
      }
      try {
        const res = await API.get("/api/school/manage/payments", {
          params: {
            studentId: manualForm.studentId,
            status: "success",
          },
        });
        const payments = res.data?.data?.payments || [];
        const balances = {};
        for (const p of payments) {
          const key = String(p.feeStructureId?._id || p.feeStructureId);
          if (!key) continue;
          if (!balances[key]) balances[key] = 0;
          balances[key] += p.amount || 0;
        }
        setManualFeeBalances(balances);
      } catch {
        setManualFeeBalances({});
      }
    }
    loadStudentPayments();
  }, [manualForm.studentId]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await API.get("/api/school/manage/students", {
          params: { limit: 1000 },
        });
        setStudentsForManual(res.data?.data || []);
      } catch {
        setStudentsForManual([]);
      }
    }
    loadStudents();
  }, []);

  function getUniqueFeeTitles() {
    const titles = fees.map((f) => f.title).filter(Boolean);
    return Array.from(new Set(titles)).sort();
  }

  function getDisplayPayments() {
    let filtered = [...allPayments];

    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (feeTypeFilter) {
      filtered = filtered.filter(
        (p) => p.feeStructureId?.title === feeTypeFilter,
      );
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const studentName =
          `${p.studentId?.firstName || ""} ${p.studentId?.lastName || ""}`.toLowerCase();
        const parentName = (p.parentId?.name || "").toLowerCase();
        const feeTitle = (p.feeStructureId?.title || "").toLowerCase();
        return (
          studentName.includes(term) ||
          parentName.includes(term) ||
          feeTitle.includes(term)
        );
      });
    }

    const sortField = sortBy || "createdAt";
    const sortDirection = sortDir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      let aVal;
      let bVal;
      switch (sortField) {
        case "amount":
          aVal = a.amount || 0;
          bVal = b.amount || 0;
          break;
        case "status":
          aVal = (a.status || "").toLowerCase();
          bVal = (b.status || "").toLowerCase();
          break;
        case "student":
          aVal =
            `${a.studentId?.firstName || ""} ${a.studentId?.lastName || ""}`.toLowerCase();
          bVal =
            `${b.studentId?.firstName || ""} ${b.studentId?.lastName || ""}`.toLowerCase();
          break;
        case "fee":
          aVal = (a.feeStructureId?.title || "").toLowerCase();
          bVal = (b.feeStructureId?.title || "").toLowerCase();
          break;
        case "parent":
          aVal = (a.parentId?.name || "").toLowerCase();
          bVal = (b.parentId?.name || "").toLowerCase();
          break;
        case "createdAt":
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }
      if (aVal < bVal) return sortDirection === 1 ? -1 : 1;
      if (aVal > bVal) return sortDirection === 1 ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  async function load() {
    setLoading(true);
    try {
      const [fRes, pRes] = await Promise.all([
        API.get("/api/school/manage/fees"),
        API.get("/api/school/manage/payments"),
      ]);
      setFees(fRes.data?.data || []);
      setAllPayments(pRes.data?.data?.payments || []);
    } catch {
      setFees([]);
      setAllPayments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      amount: toMinorUnit(form.amount),
      cycleId: form.cycleId || undefined,
      dueDate: form.dueDate || undefined,
      isRecurring: form.isRecurring,
    };
    try {
      await API.post("/api/school/manage/fees", payload);
      toast.success("Fee structure created successfully");
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        amount: "",
        cycleId: "",
        dueDate: "",
        isRecurring: false,
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create fee");
    }
  }

  async function handleManualPayment(e) {
    e.preventDefault();
    try {
      await API.post("/api/school/manage/payments/manual", {
        studentId: manualForm.studentId,
        feeStructureId: manualForm.feeStructureId,
        amount: toMinorUnit(manualForm.amount),
        paymentMethod: manualForm.paymentMethod,
        payerName: manualForm.payerName,
        payerPhone: manualForm.payerPhone,
        note: manualForm.note,
      });
      toast.success("Manual payment recorded successfully");
      setShowManualSheet(false);
      setManualForm({
        studentId: "",
        studentName: "",
        feeStructureId: "",
        amount: "",
        paymentMethod: "cash",
        payerName: "",
        payerPhone: "",
        note: "",
      });
      setStudentSearch("");
      setShowStudentSuggestions(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  }

  const displayPayments = getDisplayPayments();
  const summary = displayPayments.reduce(
    (acc, p) => {
      acc.total += 1;
      if (p.status === "success") acc.successful += 1;
      if (p.status === "pending") acc.pending += 1;
      if (p.status === "failed") acc.failed += 1;
      if (p.status === "success") acc.amount += p.amount;
      return acc;
    },
    { total: 0, successful: 0, pending: 0, failed: 0, amount: 0 },
  );

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-8">
      <div className="flex items-center flex-col sm:flex-row justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Finance
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            School Fees & Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage fee structures and track payments. Funds are settled to your
            bank via Paystack subaccounts.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <PlusIcon className="size-4" /> <span>Create New Fee</span>
          </Button>
          <Button
            onClick={() => setShowManualSheet(true)}
            variant="outline"
            className="gap-2"
          >
            <BanknoteIcon className="size-4" /> Record Manual Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Total Payments
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {summary.total}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Successful
          </p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {summary.successful}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Pending
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">
            {summary.pending}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Failed
          </p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {summary.failed}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Total Received
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatCurrency(summary.amount)}
          </p>
        </Card>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Create New Fee Structure
          </h2>
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Tuition - Term 1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="100"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="e.g. 50000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isRecurring"
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isRecurring: e.target.checked }))
                }
              />
              <Label htmlFor="isRecurring" className="font-normal">
                Recurring fee
              </Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Create Fee</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Fee Structures
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-premium w-full">
            <thead>
              <tr>
                <th className="text-left">Title</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Due Date</th>
                <th className="text-left">Recurring</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    No fee structures created yet.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee._id}>
                    <td className="font-medium text-foreground">{fee.title}</td>
                    <td className="text-muted-foreground">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="text-muted-foreground">
                      {fee.dueDate
                        ? new Date(fee.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="text-muted-foreground">
                      {fee.isRecurring ? (
                        <RepeatIcon className="size-4 text-brand" />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          fee.isActive
                            ? "bg-green-500/10 text-green-600"
                            : "bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        {fee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Payments
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, parent, or fee..."
                className="h-10 rounded-xl pl-10"
              />
            </div>
            <div className="space-y-1 sm:w-40">
              <Label htmlFor="statusFilter">Status</Label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-brand/40 focus:ring-3 focus:ring-brand/15"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="space-y-1 sm:w-48">
              <Label htmlFor="feeTypeFilter">Fee Type</Label>
              <select
                id="feeTypeFilter"
                value={feeTypeFilter}
                onChange={(e) => setFeeTypeFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-brand/40 focus:ring-3 focus:ring-brand/15"
              >
                <option value="">All types</option>
                {getUniqueFeeTitles().map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-premium w-full">
            <thead>
              <tr>
                <th
                  className="text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortBy("student");
                    setSortDir(
                      sortBy === "student" && sortDir === "asc"
                        ? "desc"
                        : "asc",
                    );
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Student{" "}
                    {sortBy === "student" &&
                      (sortDir === "asc" ? (
                        <ArrowUpIcon className="size-3.5" />
                      ) : (
                        <ArrowDownIcon className="size-3.5" />
                      ))}
                  </span>
                </th>
                <th className="text-left">Parent</th>
                <th
                  className="text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortBy("fee");
                    setSortDir(
                      sortBy === "fee" && sortDir === "asc" ? "desc" : "asc",
                    );
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Fee{" "}
                    {sortBy === "fee" &&
                      (sortDir === "asc" ? (
                        <ArrowUpIcon className="size-3.5" />
                      ) : (
                        <ArrowDownIcon className="size-3.5" />
                      ))}
                  </span>
                </th>
                <th
                  className="text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortBy("amount");
                    setSortDir(
                      sortBy === "amount" && sortDir === "asc" ? "desc" : "asc",
                    );
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Amount{" "}
                    {sortBy === "amount" &&
                      (sortDir === "asc" ? (
                        <ArrowUpIcon className="size-3.5" />
                      ) : (
                        <ArrowDownIcon className="size-3.5" />
                      ))}
                  </span>
                </th>
                <th
                  className="text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortBy("status");
                    setSortDir(
                      sortBy === "status" && sortDir === "asc" ? "desc" : "asc",
                    );
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Status{" "}
                    {sortBy === "status" &&
                      (sortDir === "asc" ? (
                        <ArrowUpIcon className="size-3.5" />
                      ) : (
                        <ArrowDownIcon className="size-3.5" />
                      ))}
                  </span>
                </th>
                <th
                  className="text-left cursor-pointer select-none"
                  onClick={() => {
                    setSortBy("createdAt");
                    setSortDir(
                      sortBy === "createdAt" && sortDir === "asc"
                        ? "desc"
                        : "asc",
                    );
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Date{" "}
                    {sortBy === "createdAt" &&
                      (sortDir === "asc" ? (
                        <ArrowUpIcon className="size-3.5" />
                      ) : (
                        <ArrowDownIcon className="size-3.5" />
                      ))}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    No payments received yet.
                  </td>
                </tr>
              ) : (
                displayPayments.map((p) => (
                  <tr key={p._id}>
                    <td className="font-medium text-foreground">
                      {p.studentId
                        ? `${p.studentId.firstName} ${p.studentId.lastName}`
                        : "—"}
                    </td>
                    <td className="text-muted-foreground">
                      {p.parentId?.name || "—"}
                    </td>
                    <td className="text-muted-foreground">
                      {p.feeStructureId?.title || "—"}
                    </td>
                    <td className="text-muted-foreground">
                      {formatCurrency(p.amount)}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={showManualSheet} onOpenChange={setShowManualSheet}>
        <SheetHeader>
          <SheetTitle>Record Manual Payment</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <SheetContent>
          <form onSubmit={handleManualPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentSearch">Student *</Label>
              <div className="relative" ref={studentSearchRef}>
                <Input
                  id="studentSearch"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowStudentSuggestions(true);
                    if (manualForm.studentId) {
                      setManualForm((p) => ({
                        ...p,
                        studentId: "",
                        studentName: "",
                      }));
                    }
                  }}
                  onFocus={() => setShowStudentSuggestions(true)}
                  placeholder="Search student by name or admission number..."
                  autoComplete="off"
                  required
                />
                {showStudentSuggestions && studentSearch.trim() && (
                  <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
                    {studentsForManual
                      .filter((s) => {
                        const term = studentSearch.toLowerCase();
                        return (
                          `${s.firstName} ${s.lastName}`
                            .toLowerCase()
                            .includes(term) ||
                          (s.admissionNumber || "").toLowerCase().includes(term)
                        );
                      })
                      .map((s) => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => {
                            const fullName = s.firstName + " " + s.lastName;
                            setManualForm((p) => ({
                              ...p,
                              studentId: s._id,
                              studentName: fullName,
                              feeStructureId: "",
                              amount: "",
                            }));
                            setStudentSearch(
                              fullName + " (" + s.admissionNumber + ")",
                            );
                            setShowStudentSuggestions(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <span>
                            {s.firstName} {s.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {s.admissionNumber}
                          </span>
                        </button>
                      ))}
                    {studentsForManual.filter((s) => {
                      const term = studentSearch.toLowerCase();
                      return (
                        `${s.firstName} ${s.lastName}`
                          .toLowerCase()
                          .includes(term) ||
                        (s.admissionNumber || "").toLowerCase().includes(term)
                      );
                    }).length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No students found
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeStructureId">Fee *</Label>
              <select
                id="feeStructureId"
                value={manualForm.feeStructureId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setManualForm((p) => ({
                    ...p,
                    feeStructureId: selectedId,
                    amount: "",
                  }));
                }}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-brand/40 focus:ring-3 focus:ring-brand/15"
                required
              >
                <option value="">Select fee</option>
                {fees.map((f) => {
                  const paid = manualFeeBalances[String(f._id)] || 0;
                  const remaining = Math.max(0, f.amount - paid);
                  const label =
                    remaining > 0
                      ? `${f.title} - Remaining: ${formatCurrency(remaining)}`
                      : `${f.title} - Fully Paid`;
                  return (
                    <option key={f._id} value={f._id} disabled={remaining <= 0}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {manualForm.feeStructureId &&
              (() => {
                const paid = manualFeeBalances[manualForm.feeStructureId] || 0;
                const fee = fees.find(
                  (f) => String(f._id) === String(manualForm.feeStructureId),
                );
                const remaining = fee ? Math.max(0, fee.amount - paid) : 0;
                if (remaining <= 0) return null;
                return (
                  <p className="text-xs text-muted-foreground">
                    Remaining balance: {formatCurrency(remaining)}
                  </p>
                );
              })()}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="100"
                value={manualForm.amount}
                onChange={(e) => {
                  const raw = e.target.value;
                  const fee = fees.find(
                    (f) => String(f._id) === String(manualForm.feeStructureId),
                  );
                  const paid =
                    manualFeeBalances[manualForm.feeStructureId] || 0;
                  const remaining = fee ? Math.max(0, fee.amount - paid) : 0;
                  if (remaining > 0 && Number(raw) > remaining) return;
                  setManualForm((p) => ({ ...p, amount: raw }));
                }}
                placeholder="e.g. 50000"
                required
              />
              {manualForm.feeStructureId &&
                (() => {
                  const paid =
                    manualFeeBalances[manualForm.feeStructureId] || 0;
                  const fee = fees.find(
                    (f) => String(f._id) === String(manualForm.feeStructureId),
                  );
                  const remaining = fee ? Math.max(0, fee.amount - paid) : 0;
                  if (remaining <= 0) return null;
                  return (
                    <p className="text-xs text-muted-foreground">
                      Maximum allowed: {formatCurrency(remaining)}
                    </p>
                  );
                })()}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <select
                id="paymentMethod"
                value={manualForm.paymentMethod}
                onChange={(e) =>
                  setManualForm((p) => ({
                    ...p,
                    paymentMethod: e.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-brand/40 focus:ring-3 focus:ring-brand/15"
                required
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerName">Payer Name</Label>
              <Input
                id="payerName"
                value={manualForm.payerName}
                onChange={(e) =>
                  setManualForm((p) => ({ ...p, payerName: e.target.value }))
                }
                placeholder="Who gave the money"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerPhone">Payer Phone</Label>
              <Input
                id="payerPhone"
                value={manualForm.payerPhone}
                onChange={(e) =>
                  setManualForm((p) => ({ ...p, payerPhone: e.target.value }))
                }
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <textarea
                id="note"
                value={manualForm.note}
                onChange={(e) =>
                  setManualForm((p) => ({ ...p, note: e.target.value }))
                }
                placeholder="Optional note"
                className="h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand/40 focus:ring-3 focus:ring-brand/15"
              />
            </div>
          </form>
        </SheetContent>
        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowManualSheet(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleManualPayment}>
            Record Payment
          </Button>
        </SheetFooter>
      </Sheet>
    </div>
  );
}
