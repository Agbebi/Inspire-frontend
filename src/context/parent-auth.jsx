/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react"

function getStored() {
  try {
    const raw = localStorage.getItem("parent_auth")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const ParentAuthContext = createContext(null)

export function ParentAuthProvider({ children }) {
  const [parentAuth, setParentAuth] = useState(getStored())

  useEffect(() => {
    if (parentAuth) {
      localStorage.setItem("parent_auth", JSON.stringify(parentAuth))
    } else {
      localStorage.removeItem("parent_auth")
    }
  }, [parentAuth])

  function login(data) {
    setParentAuth(data)
  }

  function logout() {
    setParentAuth(null)
  }

  function setParentAuthState(updater) {
    setParentAuth((prev) =>
      typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
    )
  }

  return (
    <ParentAuthContext.Provider value={{ parentAuth, login, logout, setParentAuth: setParentAuthState }}>
      {children}
    </ParentAuthContext.Provider>
  )
}

export function useParentAuth() {
  return useContext(ParentAuthContext)
}
