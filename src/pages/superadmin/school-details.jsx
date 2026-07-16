import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeftIcon, PencilIcon, TrashIcon, SchoolIcon, MailIcon, GlobeIcon, MapPinIcon, CalendarIcon, UsersIcon, LockIcon, UnlockIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getSchool,
  removeSchool,
  clearSchoolError,
  editSchool,
  getSchoolCycles,
  toggleSchoolResultsLock,
} from "@/store/superadmin/school-slice"
import { useDispatch, useSelector } from "react-redux"

import SchoolFormModal from "@/components/superadmin/school-form-modal"

export default function SchoolDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { school, loading, error, cycles } = useSelector((state) => state.school)

  const [modalOpen, setModalOpen] = useState(false)
  const [togglingLockId, setTogglingLockId] = useState(null)

  useEffect(() => {
    if (id) {
      dispatch(getSchool(id))
      dispatch(getSchoolCycles(id))
    }
  }, [dispatch, id])

  async function handleToggleCycleLock(cycleId) {
    setTogglingLockId(cycleId)
    try {
      await dispatch(toggleSchoolResultsLock(cycleId)).unwrap()
      toast.success("Cycle lock updated")
    } catch {
      toast.error("Failed to update lock")
    } finally {
      setTogglingLockId(null)
    }
  }

  useEffect(() => {
    if (id) {
      dispatch(getSchool(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearSchoolError())
    }
  }, [error, dispatch])

  async function handleDelete() {
    if (window.confirm("Are you sure you want to delete this school? This action cannot be undone.")) {
      try {
        await dispatch(removeSchool(id)).unwrap()
        toast.success("School deleted successfully")
        navigate("/superadmin/schools")
      } catch (err) {
        toast.error("Failed to delete school")
      }
    }
  }

  async function handleEdit(formData) {
    try {
      await dispatch(editSchool({ id, formData })).unwrap()
      toast.success("School updated successfully")
      setModalOpen(false)
    } catch (err) {
      toast.error("Failed to update school")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-24 w-24 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/superadmin/schools">
            <ArrowLeftIcon className="size-4" />
            Back to schools
          </Link>
        </Button>
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">School not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to="/superadmin/schools" aria-label="Back to schools">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{school.name}</h1>
            <p className="text-sm text-muted-foreground">
              School details and information.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setModalOpen(true)}>
            <PencilIcon className="size-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <TrashIcon className="size-4" />
            Delete
          </Button>
        </div>
      </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-medium mb-4">School Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                    <SchoolIcon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{school.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                    <GlobeIcon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Subdomain</p>
                    <p className="text-sm text-muted-foreground">{school.subDomain}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                    <MailIcon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Support Email</p>
                    <p className="text-sm text-muted-foreground">{school.supportEmail}</p>
                  </div>
                </div>

                {school.address && (
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                      <MapPinIcon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{school.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                    <UsersIcon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Registered Students</p>
                    <p className="text-sm text-muted-foreground">{school.studentCount ?? 0}</p>
                  </div>
                </div>
          </div>
            </div>
          </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subscription</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    school.subscriptionStatus === "active"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {school.subscriptionStatus || "inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {school.createdAt ? new Date(school.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium mb-4">Term Locks</h3>
            <div className="space-y-2">
              {cycles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cycles yet.</p>
              ) : (
                cycles.map((cycle) => (
                  <div key={cycle._id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{cycle.session} — {cycle.term}</p>
                      <p className="text-xs text-muted-foreground">
                        {cycle.isPublished ? "Published" : "Draft"}
                        {cycle.isCurrent ? " • Current" : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCycleLock(cycle._id)}
                      disabled={togglingLockId === cycle._id}
                      className="gap-1.5"
                    >
                      {togglingLockId === cycle._id ? (
                        "Saving…"
                      ) : cycle.resultsLocked ? (
                        <><UnlockIcon className="size-4" /> Unlock</>
                      ) : (
                        <><LockIcon className="size-4" /> Lock</>
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-medium mb-4">Actions</h3>
            <div className="space-y-4">
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setModalOpen(true)}>
                <PencilIcon className="size-4" />
                Edit School
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <TrashIcon className="size-4" />
                Delete School
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SchoolFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingId={id}
        initialData={school}
        onSubmit={handleEdit}
        loading={loading}
      />
    </div>
  )
}
