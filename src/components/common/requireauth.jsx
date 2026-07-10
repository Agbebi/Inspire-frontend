import { useSelector } from "react-redux"
import { Navigate, useLocation, Outlet } from "react-router-dom"
import AuthLayout from "../auth/authlayout"
import AdminLayout from "../auth/adminlayout"

export default function SuperAdminAuthGuard() {
  const token = useSelector((state) => state.superadmin.token)
  const user = useSelector((state) => state.superadmin.user)
  const location = useLocation()
  const isAuthenticated = !!token && !!user

  if (!isAuthenticated) {
    const isLoginPage = location.pathname.includes('/login')
    const isRegisterPage = location.pathname.includes('/register')
    if (!isLoginPage && !isRegisterPage) {
      return <Navigate to="/auth/superadmin/login" replace />
    }
  }

  if (isAuthenticated) {
    const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register')
    if (isAuthPage) {
      return <Navigate to="/superadmin/dashboard" replace />
    }

    const isAdminPage = location.pathname.includes('/superadmin')
    if (isAdminPage) {
      return (
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      )
    }
  }

  return <AuthLayout />
}
