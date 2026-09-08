import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";
import parentAPI from "@/api/parent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import { formatNaira } from "@/lib/utils";

function formatCurrency(amountInKobo) {
  return formatNaira(amountInKobo);
}

function StatusIcon({ status }) {
  switch (status) {
    case "success":
      return <CheckCircle2Icon className="size-4 text-green-500" />;
    case "pending":
      return <ClockIcon className="size-4 text-amber-500" />;
    case "failed":
    case "refunded":
      return <XCircleIcon className="size-4 text-red-500" />;
    default:
      return null;
  }
}

export default function ParentFees() {
  const { slug } = useParams();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await parentAPI.get("/parent/students");
        const studentList = res.data?.data || [];
        setStudents(studentList);
        if (studentList.length > 0) {
          setSelectedStudentId(String(studentList[0]._id));
        }
      } catch {
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    }
    loadStudents();
  }, []);

  useEffect(() => {
    async function load() {
      if (!selectedStudentId) return;
      setLoading(true);
      try {
        const [fRes, pRes] = await Promise.all([
          parentAPI.get("/parent/fees", {
            params: { studentId: selectedStudentId },
          }),
          parentAPI.get("/parent/fees/payments", {
            params: { studentId: selectedStudentId },
          }),
        ]);

        setFees(fRes.data?.data || []);
        setPayments(pRes.data?.data || []);
      } catch {
        setFees([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedStudentId]);

  function getStudentName() {
    const student = students.find(
      (s) => String(s._id) === String(selectedStudentId),
    );
    if (!student) return "";
    return `${student.firstName} ${student.lastName}`;
  }

  function isPaid(fee) {
    return fee.isFullyPaid === true;
  }

  function isPartiallyPaid(fee) {
    return fee.isPartiallyPaid === true;
  }

  function hasPendingPayment(fee) {
    return payments.find(
      (p) => p.feeStructureId?._id === fee._id && p.status === "pending",
    );
  }

  function renderFeeCard(fee) {
    const paid = isPaid(fee);
    const partial = isPartiallyPaid(fee);
    const pending = hasPendingPayment(fee);
    const disabled = payingId === fee._id || paid;

    const remainingAmount = fee.remainingAmount || 0;

    return (
      <Card
        key={fee._id}
        className={`flex items-start justify-between p-5 ${paid ? "opacity-75" : ""}`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">{fee.title}</h3>
            {paid && (
              <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                Paid
              </span>
            )}
            {partial && !paid && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                Partially Paid
              </span>
            )}
            {pending && !paid && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                Pending
              </span>
            )}
          </div>
          {fee.description && (
            <p className="text-sm text-muted-foreground">{fee.description}</p>
          )}
          <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
            {fee.cycleId && (
              <span>
                {fee.cycleId.session} • {fee.cycleId.term}
              </span>
            )}
            {fee.dueDate && (
              <span>Due {new Date(fee.dueDate).toLocaleDateString()}</span>
            )}
            {partial && !paid && (
              <span>Remaining: {formatCurrency(remainingAmount)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-foreground">
            {partial && !paid
              ? formatCurrency(remainingAmount)
              : formatCurrency(fee.amount)}
          </span>
          <Button
            onClick={() => handlePay(fee._id, partial && !paid ? remainingAmount : undefined)}
            disabled={disabled}
            className="min-w-[100px]"
            variant={
              paid ? "secondary" : pending && !paid ? "outline" : "default"
            }
          >
            {payingId === fee._id
              ? "Redirecting…"
              : pending && !paid
                ? "Retry"
                : paid
                  ? "Paid"
                  : partial
                    ? "Pay Remaining"
                    : "Pay Now"}
          </Button>
        </div>
      </Card>
    );
  }

  const outstandingFees = fees.filter((f) => !isPaid(f));
  const paidFees = fees.filter((f) => isPaid(f));

  async function handlePay(feeId, amount) {
    setPayingId(feeId);
    try {
      const res = await parentAPI.post("/parent/fees/initialize", {
        feeStructureId: feeId,
        studentId: selectedStudentId,
        amount,
      });
      if (res.data?.success && res.data?.data?.authorizationUrl) {
        window.location.assign(res.data.data.authorizationUrl);
      } else if (res.data?.success && res.data?.data?.reference) {
        toast.info(
          res.data.data.message ||
            "A pending payment already exists. Please complete or wait a few minutes to retry.",
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPayingId(null);
    }
  }

  if (studentsLoading) return <PageLoading />;

  if (students.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {slug} School Portal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            School Fees
          </h1>
        </header>
        <p className="text-sm text-muted-foreground">
          No students are linked to your account. Please contact the school to
          link a student.
        </p>
      </div>
    );
  }

  if (loading) return <PageLoading />;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          {slug} School Portal
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          School Fees
        </h1>
        <p className="text-base text-muted-foreground">
          Pay your child's school fees securely via Paystack. Funds are settled
          directly into the school's bank account.
        </p>
      </header>

      <section className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Select Child
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => {
            const isSelected = String(s._id) === String(selectedStudentId);
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => setSelectedStudentId(String(s._id))}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-brand bg-brand/5"
                    : "border-border hover:border-brand/60"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">
                  {s.firstName} {s.lastName}
                </p>
                {s.admissionNumber && (
                  <p className="text-xs text-muted-foreground">
                    {s.admissionNumber}
                  </p>
                )}
                {s.className && (
                  <p className="text-xs text-muted-foreground">
                    {s.className}
                    {s.classArm ? ` • ${s.classArm}` : ""}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Outstanding Fees{getStudentName() ? ` for ${getStudentName()}` : ""}
        </h2>
        {outstandingFees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {getStudentName()
              ? `${getStudentName()} has no outstanding fees.`
              : "You have no outstanding fees."}
          </p>
        ) : (
          <div className="grid gap-4">
            {outstandingFees.map((fee) => renderFeeCard(fee))}
          </div>
        )}
      </section>

      {paidFees.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Paid Fees{getStudentName() ? ` for ${getStudentName()}` : ""}
          </h2>
          <div className="grid gap-4">
            {paidFees.map((fee) => renderFeeCard(fee))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Payment History{getStudentName() ? ` for ${getStudentName()}` : ""}
        </h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {getStudentName()
              ? `No payment history yet for ${getStudentName()}.`
              : "No payment history yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">
                    {p.feeStructureId?.title || "Fee Payment"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString()}
                    {p.paymentChannel && ` · ${p.paymentChannel}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "success"
                        ? "bg-green-500/10 text-green-600"
                        : p.status === "pending"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    <StatusIcon status={p.status} />
                    {p.status}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
