// Create this file as src/components/messaging/MessageButton.tsx

"use client";

import React, { useState } from "react";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getConversation } from "@/lib/services/messaging";

import { ChatWindow } from "./ChatWindow";

import type { Conversation, ServiceRequest } from "@/types";

interface MessageButtonProps {
  serviceRequest: ServiceRequest;
  userType: "user" | "provider";
  otherPartyName: string;
  otherPartyPhone?: string;
  otherPartyAvatar?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function MessageButton({
  serviceRequest,
  userType,
  otherPartyName,
  otherPartyPhone,
  otherPartyAvatar,
  variant = "outline",
  size = "sm",
  className,
}: MessageButtonProps) {
  const [showChat, setShowChat] = useState(false);
  const [_conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenChat = async () => {
    setLoading(true);
    try {
      // Check if conversation exists, if not it will be created when first message is sent
      const conv = await getConversation(serviceRequest.id);
      setConversation(conv);
      setShowChat(true);
    } catch (error) {
      console.error("Error opening chat:", error);
      // Still show chat window, conversation will be created on first message
      setShowChat(true);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (otherPartyPhone) {
      window.open(`tel:${otherPartyPhone}`, "_self");
    }
  };

  // Only show message the button for accepted/in_progress/completed requests
  if (
    !["accepted", "in_progress", "completed"].includes(serviceRequest.status)
  ) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenChat}
        disabled={loading}
        className={className}
      >
        <MessageCircle className="mr-1 h-4 w-4" />
        {loading ? "Loading..." : "Message"}
      </Button>

      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-2xl p-0">
          <ChatWindow
            serviceRequest={serviceRequest}
            userType={userType}
            otherPartyName={otherPartyName}
            otherPartyAvatar={otherPartyAvatar}
            onBack={() => setShowChat(false)}
            onContact={otherPartyPhone ? handleContact : undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
