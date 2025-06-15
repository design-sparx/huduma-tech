"use client";

import { useEffect, useRef } from "react";

import { ArrowLeft, MoreVertical, Phone, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMessages } from "@/hooks/useMessages";
import { getStatusColor } from "@/lib/colors";

import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

import type { ServiceRequest } from "@/types";

interface ChatWindowProps {
  serviceRequest: ServiceRequest;
  userType: "user" | "provider";
  otherPartyName: string;
  otherPartyAvatar?: string;
  onBack?: () => void;
  onContact?: () => void;
}

export function ChatWindow({
  serviceRequest,
  userType,
  otherPartyName,
  otherPartyAvatar,
  onBack,
  onContact,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { groupedMessages, loading, sending, error, send, hasMessages } =
    useMessages({
      serviceRequestId: serviceRequest.id,
      userType,
      autoMarkAsRead: true,
    });

  const isConversationEnded =
    serviceRequest.status === "completed" ||
    serviceRequest.status === "cancelled";
  const isInputDisabled = sending || isConversationEnded;

  let placeholderText = "Type your message...";
  if (serviceRequest.status === "completed") {
    placeholderText = "This conversation is completed";
  } else if (serviceRequest.status === "cancelled") {
    placeholderText = "This conversation is cancelled";
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    await send(content);
  };

  useEffect(() => {
    scrollToBottom();
  }, [groupedMessages]);

  return (
    <Card className="flex h-[600px] max-h-[80vh] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <Avatar className="h-10 w-10">
            <AvatarImage src={otherPartyAvatar} alt={otherPartyName} />
            <AvatarFallback>
              {otherPartyName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium">{otherPartyName}</h3>
            <p className="truncate text-sm text-gray-600">
              {serviceRequest.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(serviceRequest.status)}>
            {serviceRequest.status.replace("_", " ").toUpperCase()}
          </Badge>

          {onContact && (
            <Button variant="outline" size="icon" onClick={onContact}>
              <Phone className="h-4 w-4" />
            </Button>
          )}

          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-red-600">
            <p>{error}</p>
          </div>
        )}

        {!loading && !hasMessages && (
          <div className="py-8 text-center text-gray-500">
            <User className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {group.messages.map((message, messageIndex) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderType === userType}
                showAvatar={messageIndex === 0}
                senderName={
                  message.senderType === userType ? "You" : otherPartyName
                }
                senderAvatar={
                  message.senderType === userType ? undefined : otherPartyAvatar
                }
              />
            ))}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isInputDisabled}
        placeholder={placeholderText}
      />
    </Card>
  );
}
