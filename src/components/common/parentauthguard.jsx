import { Navigate, Outlet, useParams } from "react-router-dom"
import { useParentAuth } from "@/context/parent-auth"
import { SocketProvider } from "@/context/socket"

export default function ParentAuthGuard() {
  const { slug } = useParams()
  const { parentAuth } = useParentAuth()

  if (!parentAuth) {
    return <Navigate to={`/${slug}/parent/login`} replace />
  }

  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  )
}
