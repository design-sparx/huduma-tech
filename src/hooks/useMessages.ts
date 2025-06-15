"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/contexts";
import {
  getMessages,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from "@/lib/services/messaging";

import type { Message } from "@/types";

interface UseMessagesOptions {
  serviceRequestId: string;
  userType: "user" | "provider";
  autoMarkAsRead?: boolean;
}

export function useMessages(options: UseMessagesOptions) {
  const { serviceRequestId, userType, autoMarkAsRead = true } = options;
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!serviceRequestId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getMessages(serviceRequestId);
      setMessages(data);

      // Auto-mark as read if enabled
      if (autoMarkAsRead && data.length > 0) {
        await markMessagesAsRead(serviceRequestId, userType);
      }
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [serviceRequestId, userType, autoMarkAsRead]);

  // Send a message
  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || !user) return;

      try {
        setSending(true);
        setError(null);

        const newMessage = await sendMessage(
          serviceRequestId,
          content,
          userType
        );

        // Optimistically add message to local state
        setMessages(prev => [...prev, newMessage]);

        return newMessage;
      } catch (err) {
        setError("Failed to send message");
        console.error("Error sending message:", err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [serviceRequestId, userType, user]
  );

  // Mark messages as read manually
  const markAsRead = useCallback(async () => {
    try {
      await markMessagesAsRead(serviceRequestId, userType);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  }, [serviceRequestId, userType]);

  // Get unread message count
  const unreadCount = messages.filter(
    msg => !msg.readAt && msg.senderType !== userType
  ).length;

  // Get messages grouped by sender for UI
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const lastGroup = groups[groups.length - 1];

      if (
        lastGroup &&
        lastGroup.senderId === message.senderId &&
        lastGroup.senderType === message.senderType &&
        new Date(message.createdAt).getTime() -
          new Date(
            lastGroup.messages[lastGroup.messages.length - 1].createdAt
          ).getTime() <
          5 * 60 * 1000 // 5 minutes
      ) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          senderId: message.senderId,
          senderType: message.senderType,
          messages: [message],
        });
      }

      return groups;
    },
    [] as Array<{
      senderId: string;
      senderType: "user" | "provider" | "system";
      messages: Message[];
    }>
  );

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!serviceRequestId) return;

    const unsubscribe = subscribeToMessages(serviceRequestId, newMessage => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      // Auto-mark as read if message is from other party and auto-mark is enabled
      if (autoMarkAsRead && newMessage.senderType !== userType) {
        markMessagesAsRead(serviceRequestId, userType).catch(console.error);
      }
    });

    return unsubscribe;
  }, [serviceRequestId, userType, autoMarkAsRead]);

  return {
    messages,
    groupedMessages,
    loading,
    sending,
    error,
    unreadCount,
    send,
    markAsRead,
    refetch: fetchMessages,
    hasMessages: messages.length > 0,
  };
}
