"use client";

import { CheckCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatTimeAgo } from "@/lib/utils";

import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  senderName,
  senderAvatar,
}: MessageBubbleProps) {
  const isSystem = message.messageType === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="text-xs">
            {senderName?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1",
          isOwn ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "max-w-[280px] rounded-2xl px-3 py-2 text-sm",
            isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
          )}
        >
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
        </div>

        <div
          className={cn(
            "flex items-center gap-1 text-xs text-gray-500",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span>{formatTimeAgo(message.createdAt)}</span>
          {isOwn && message.readAt && (
            <CheckCheck className="h-3 w-3 text-blue-600" />
          )}
        </div>
      </div>
    </div>
  );
}
