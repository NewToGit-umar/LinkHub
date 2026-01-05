import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export function useSocket() {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const listenersRef = useRef(new Map());

  // Connect to socket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setIsConnected(false);
    });

    // Handle incoming notifications
    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });

    // Post notifications
    socket.on("post:published", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `post-published-${Date.now()}`,
            type: "success",
            title: "Post Published",
            message: data.message,
            timestamp: data.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    socket.on("post:failed", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `post-failed-${Date.now()}`,
            type: "error",
            title: "Post Failed",
            message: data.message,
            timestamp: data.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    socket.on("post:scheduled", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `post-scheduled-${Date.now()}`,
            type: "info",
            title: "Post Scheduled",
            message: data.message,
            timestamp: data.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    // Team notifications
    socket.on("team:member-joined", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `team-joined-${Date.now()}`,
            type: "info",
            title: "Team Member Joined",
            message: data.message,
            timestamp: data.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    socket.on("team:member-left", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `team-left-${Date.now()}`,
            type: "info",
            title: "Team Member Left",
            message: data.message,
            timestamp: data.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    socket.on("team:invitation", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `team-invitation-${Date.now()}`,
            type: "info",
            title: "Team Invitation",
            message: data.message,
            timestamp: data.timestamp,
            action: {
              label: "View",
              link: `/invite/${data.invitation?.token}`,
            },
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    // Social account notifications
    socket.on("social:status", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `social-${Date.now()}`,
            type: data.status === "connected" ? "success" : "warning",
            title: "Account Status",
            message: data.message,
            timestamp: data.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    // Milestone notifications
    socket.on("milestone:achieved", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `milestone-${Date.now()}`,
            type: "success",
            title: "🎉 Milestone Achieved!",
            message: data.message,
            timestamp: data.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    // Analytics update
    socket.on("analytics:update", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `analytics-${Date.now()}`,
            type: "info",
            title: "Analytics Updated",
            message: data.message,
            timestamp: data.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      );
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  // Join team room
  const joinTeam = useCallback(
    (teamId) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("join:team", teamId);
      }
    },
    [isConnected]
  );

  // Leave team room
  const leaveTeam = useCallback(
    (teamId) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("leave:team", teamId);
      }
    },
    [isConnected]
  );

  // Emit typing indicator
  const emitTyping = useCallback(
    (teamId, isTyping) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit(isTyping ? "typing:start" : "typing:stop", {
          teamId,
        });
      }
    },
    [isConnected]
  );

  // Subscribe to custom events
  const subscribe = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      listenersRef.current.set(`${event}-${callback}`, { event, callback });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
        listenersRef.current.delete(`${event}-${callback}`);
      }
    };
  }, []);

  // Clear a notification
  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    notifications,
    joinTeam,
    leaveTeam,
    emitTyping,
    subscribe,
    clearNotification,
    clearAllNotifications,
  };
}

export default useSocket;
