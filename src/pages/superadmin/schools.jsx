import * as React from "react"
import { useState, useEffect } from "react"
import { PlusIcon, PencilIcon, TrashIcon, SchoolIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { useDispatch, useSelector } from "react-redux"
import {
  getSchools,
  registerSchool,
  editSchool,
  removeSchool,
  clearSchoolError,
  resetSchoolState,
} from "@/store/superadmin/school-slice"

import SchoolFormModal from "@/components/superadmin/school-form-modal"

const emptyForm = {
  name: "",
  logoUrl: "",
  address: "",
  supportEmail: "",
}

export default function SuperAdminSchools() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { schools, loading, error, success } = useSelector((state) => state.school)

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState(null)
  const [initialData, setInitialData] = React.useState(null)

  useEffect(() => {
    dispatch(getSchools())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearSchoolError())
    }
    if (success) {
      toast.success(editingId ? "School updated successfully" : "School added successfully")
      setModalOpen(false)
      setEditingId(null)
      setInitialData(null)
      dispatch(resetSchoolState())
    }
  }, [error, success, dispatch, editingId])

  function openAddModal() {
    setEditingId(null)
    setInitialData(null)
    setModalOpen(true)
  }

  function openEditModal(school) {
    setEditingId(school._id)
    setInitialData({
      name: school.name || "",
      logoUrl: school.logoUrl || "",
      address: school.address || "",
      supportEmail: school.supportEmail || "",
    })
    setModalOpen(true)
  }

  function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this school? This action cannot be undone.")) {
      dispatch(removeSchool(id))
    }
  }

  async function handleSubmit(formData) {
    try {
      if (editingId) {
        await dispatch(editSchool({ id: editingId, formData })).unwrap()
      } else {
        await dispatch(registerSchool(formData)).unwrap()
      }
    } catch (err) {
      toast.error(editingId ? "Failed to update school" : "Failed to add school")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Schools</h1>
          <p className="text-sm text-muted-foreground">
            Manage all registered schools on the platform.
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2 w-full sm:w-auto">
          <PlusIcon className="size-4" />
          Add School
        </Button>
      </div>

      {schools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SchoolIcon className="size-6" />
          </div>
          <h3 className="mt-4 text-sm font-medium">No schools yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first school.
          </p>
          <Button onClick={openAddModal} className="mt-4 gap-2">
            <PlusIcon className="size-4" />
            Add School
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">School</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subdomain</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Support Email</th>
                   <th className="px-4 py-3 text-left font-medium text-muted-foreground">Address</th>
                   <th className="px-4 py-3 text-left font-medium text-muted-foreground">Students</th>
                   <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                   <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schools.map((school) => (
                  <tr key={school._id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                          <SchoolIcon className="size-4" />
                        </div>
                        <span className="font-medium">{school.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{school.subDomain}</td>
                    <td className="px-4 py-3 text-muted-foreground">{school.supportEmail}</td>
                    <td className="px-4 py-3 text-muted-foreground">{school.address || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{school.studentCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          school.subscriptionStatus === "active"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {school.subscriptionStatus || "inactive"}
                      </span>
                    </td>
                     <td className="px-4 py-3">
                       <div className="flex items-center justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => navigate(`/superadmin/schools/${school._id}`)}
                         >
                           View Details
                         </Button>
                         <Button
                           variant="ghost"
                           size="icon-sm"
                           onClick={() => openEditModal(school)}
                           aria-label="Edit school"
                         >
                           <PencilIcon className="size-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="icon-sm"
                           onClick={() => handleDelete(school._id)}
                           aria-label="Delete school"
                           className="text-destructive hover:text-destructive"
                         >
                           <TrashIcon className="size-4" />
                         </Button>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SchoolFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingId(null)
          setInitialData(null)
        }}
        editingId={editingId}
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}
