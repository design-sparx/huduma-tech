"use client";

import { useState } from "react";

import { MessageCircle, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConversations } from "@/hooks";
import { getStatusColor } from "@/lib/colors";
import { cn, formatTimeAgo } from "@/lib/utils";

import type { ConversationSummary } from "@/types";

interface ConversationListProps {
  userType: "user" | "provider";
  onSelectConversation: (conversation: ConversationSummary) => void;
  selectedConversationId?: string;
}

export function ConversationList({
  userType,
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { conversations, loading, error, totalUnreadCount, hasConversations } =
    useConversations({
      userType,
      autoRefresh: true,
    });

  const filteredConversations = conversations.filter(
    conv =>
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.otherPartyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="flex h-[600px] max-h-[80vh] flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
            {totalUnreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {totalUnreadCount}
              </Badge>
            )}
          </CardTitle>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          )}

          {error && (
            <div className="px-4 py-8 text-center text-red-600">
              <p>{error}</p>
            </div>
          )}

          {!loading && !hasConversations && (
            <div className="px-4 py-8 text-center text-gray-500">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p>No conversations yet.</p>
              <p className="text-sm">
                {userType === "user"
                  ? "Start a conversation when you book a service."
                  : "Conversations will appear when you accept requests."}
              </p>
            </div>
          )}

          {filteredConversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={e => {
                console.log("Conversation clicked", {
                  conversationId: conversation.id,
                  event: e.type,
                  defaultPrevented: e.defaultPrevented,
                });

                e.preventDefault();
                e.stopPropagation();

                console.log("About to call onSelectConversation");
                onSelectConversation(conversation);
                console.log("onSelectConversation called");
              }}
              type="button" // Explicitly set type to prevent form submission
              className={cn(
                "w-full border-b p-4 text-left transition-colors hover:bg-gray-50",
                selectedConversationId === conversation.serviceRequestId &&
                  "border-blue-200 bg-blue-50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={conversation.otherPartyAvatar}
                      alt={conversation.otherPartyName}
                    />
                    <AvatarFallback>
                      {conversation.otherPartyName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                    >
                      {conversation.unreadCount > 9
                        ? "9+"
                        : conversation.unreadCount}
                    </Badge>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="truncate font-medium">
                      {conversation.otherPartyName}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(conversation.lastMessageAt)}
                    </span>
                  </div>

                  <p className="mb-2 truncate text-sm text-gray-600">
                    {conversation.title}
                  </p>

                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "flex-1 truncate text-sm",
                        conversation.unreadCount > 0
                          ? "font-medium text-gray-900"
                          : "text-gray-500"
                      )}
                    >
                      {conversation.lastMessage}
                    </p>
                    <Badge
                      className={cn(
                        "ml-2 text-xs",
                        getStatusColor(conversation.status)
                      )}
                    >
                      {conversation.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
