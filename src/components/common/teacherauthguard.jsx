import { Navigate, useParams, Outlet } from "react-router-dom"
import TeacherLayout from "@/components/auth/teacherlayout"

function getSchoolAuth() {
  try {
    const raw = localStorage.getItem("school_auth")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function TeacherAuthGuard() {
  const { slug } = useParams()
  const auth = getSchoolAuth()
  const user = auth?.user

  const isAuthenticated = !!auth?.token && !!user
  const isTeacher = user?.role === "teacher"
  const matchesSlug = !user?.subDomain || user.subDomain === slug

  if (!isAuthenticated) {
    return <Navigate to={`/auth/school/${slug}/login`} replace />
  }

  if (!isTeacher) {
    return <Navigate to={`/${slug}/unauthorized`} replace />
  }

  if (!matchesSlug) {
    return <Navigate to={`/auth/school/${slug}/login`} replace />
  }

  return (
    <TeacherLayout>
      <Outlet />
    </TeacherLayout>
  )
}
