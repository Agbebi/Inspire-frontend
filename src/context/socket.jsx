/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { io } from "socket.io-client"
import { useParentAuth } from "./parent-auth"
import parentAPI from "@/api/parent"

const SocketContext = createContext(null)

const SOCKET_URL = "https://inspire-backend-3zkb.onrender.com"
// const SOCKET_URL = "http://localhost:3000"

export function SocketProvider({ children }) {
  const { parentAuth } = useParentAuth()
  const [notifications, setNotifications] = useState([])
  const [messages, setMessages] = useState([])
  const socketRef = useRef(null)

  // Derived counts so they stay correct on initial load, socket events, and
  // when individual items are marked read.
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )
  const unreadMessages = useMemo(
    // Only messages from the school count as "unread inbox" for the parent.
    () => messages.filter((m) => m.senderType === "school" && !m.read).length,
    [messages]
  )
  const unreadCount = unreadNotifications + unreadMessages

  useEffect(() => {
    if (!parentAuth) {
      setNotifications([])
      setMessages([])
      return
    }
    let active = true
    parentAPI
      .get("/parent/notifications")
      .then((res) => {
        if (!active) return
        setNotifications(res.data?.data?.notifications || [])
      })
      .catch(() => {})
    parentAPI
      .get("/parent/messages")
      .then((res) => {
        if (!active) return
        setMessages(res.data?.data || [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [parentAuth])

  useEffect(() => {
    if (!parentAuth?.token) return
    const socket = io(SOCKET_URL, {
      auth: { token: parentAuth.token },
      transports: ["websocket"],
    })
    socketRef.current = socket

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notif._id)) return prev
        return [notif, ...prev]
      })
    })
    socket.on("message:new", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [parentAuth?.token])

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    )
    parentAPI.put(`/parent/notifications/${id}/read`).catch(() => {})
  }

  function markMessageRead(id) {
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, read: true } : m))
    )
    parentAPI.put(`/parent/messages/${id}/read`).catch(() => {})
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
    await Promise.all([
      parentAPI.put(`/parent/notifications/read-all`).catch(() => {}),
      parentAPI.put(`/parent/messages/read-all`).catch(() => {}),
    ])
  }

  function deleteMessage(id) {
    setMessages((prev) => prev.filter((m) => m._id !== id))
    parentAPI.delete(`/parent/messages/${id}`).catch(() => {})
  }

  return (
    <SocketContext.Provider value={{
      notifications,
      messages,
      unreadCount,
      unreadMessages,
      unreadNotifications,
      markRead,
      markMessageRead,
      markAllRead,
      deleteMessage,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
