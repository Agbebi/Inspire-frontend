import { Navigate, useParams, Outlet } from "react-router-dom"
import SchoolAdminLayout from "@/components/auth/schooladminlayout"

function getSchoolAuth() {
  try {
    const raw = localStorage.getItem("school_auth")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function SchoolAdminAuthGuard() {
  const { slug } = useParams()
  const auth = getSchoolAuth()
  const user = auth?.user

  const isAuthenticated = !!auth?.token && !!user
  const isAdmin = user?.role === "admin"
  const matchesSlug = !user?.subDomain || user.subDomain === slug

  if (!isAuthenticated) {
    return <Navigate to={`/auth/school/${slug}/login`} replace />
  }

  if (!isAdmin) {
    return <Navigate to={`/${slug}/unauthorized`} replace />
  }

  if (!matchesSlug) {
    return <Navigate to={`/auth/school/${slug}/login`} replace />
  }

  return (
    <SchoolAdminLayout>
      <Outlet />
    </SchoolAdminLayout>
  )
}
