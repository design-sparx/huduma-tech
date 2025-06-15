"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { MessageCircle } from "lucide-react";

import { ChatWindow } from "@/components/messaging/ChatWindow";
import { ConversationList } from "@/components/messaging/ConversationList";
import { useAuth } from "@/contexts";
import { getServiceRequestById } from "@/lib/services";
import { getServiceProviderByEmail } from "@/lib/services/providers";

import type {
  ConversationSummary,
  ServiceProvider,
  ServiceRequest,
} from "@/types";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();

  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);
  const [selectedServiceRequest, setSelectedServiceRequest] =
    useState<ServiceRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [_userType, setUserType] = useState<"user" | "provider">("user");
  const [_currentProvider, setCurrentProvider] =
    useState<ServiceProvider | null>(null);
  const [userTypeLoading, setUserTypeLoading] = useState(true);

  // Memoize handlers to prevent re-renders
  const handleSelectConversation = useCallback(
    (conversation: ConversationSummary) => {
      console.log("Selecting conversation:", conversation);

      // Only update if it's actually a different conversation
      if (
        selectedConversation?.serviceRequestId !== conversation.serviceRequestId
      ) {
        setSelectedConversation(conversation);
      }
    },
    [selectedConversation?.serviceRequestId]
  );

  // Determine user type - optimize with useMemo and proper dependencies
  const userEmail = user?.email;

  const renderChatContent = useMemo(() => {
    if (selectedConversation && selectedServiceRequest) {
      return (
        <ChatWindow
          key={selectedServiceRequest.id}
          serviceRequest={selectedServiceRequest}
          userType="user"
          otherPartyName={selectedConversation.otherPartyName}
          otherPartyAvatar={selectedConversation.otherPartyAvatar}
        />
      );
    }

    if (selectedConversation && loadingRequest) {
      return (
        <div className="flex h-[600px] items-center justify-center rounded-lg border bg-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-gray-600">Loading conversation...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg border bg-white">
        <div className="text-center text-gray-500">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }, [selectedConversation, selectedServiceRequest, loadingRequest]);

  useEffect(() => {
    const determineUserType = async () => {
      if (!userEmail) {
        setUserTypeLoading(false);
        return;
      }

      try {
        const provider = await getServiceProviderByEmail(userEmail);
        if (provider) {
          setUserType("provider");
          setCurrentProvider(provider);
        } else {
          setUserType("user");
        }
      } catch (error: any) {
        // User is not a provider, default to 'user'
        setUserType("user");
        console.log(`Error determining user type: ${error}`);
      } finally {
        setUserTypeLoading(false);
      }
    };

    // Only run when userEmail changes, not on every render
    if (userEmail !== undefined) {
      determineUserType();
    }
  }, [userEmail]); // Only depend on userEmail, not the entire user object

  useEffect(() => {
    if (!selectedConversation) {
      setSelectedServiceRequest(null);
      return;
    }

    let cancelled = false;

    const fetchServiceRequest = async () => {
      setLoadingRequest(true);
      try {
        const request = await getServiceRequestById(
          selectedConversation.serviceRequestId
        );

        if (!cancelled && request) {
          setSelectedServiceRequest(request);
        }
      } catch (error) {
        console.error("Error fetching service request:", error);
        if (!cancelled) {
          setSelectedServiceRequest(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingRequest(false);
        }
      }
    };

    fetchServiceRequest();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      cancelled = true;
    };
  }, [selectedConversation]);

  // Show loading while auth or user type is loading
  if (authLoading || userTypeLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <MessageCircle className="h-6 w-6" />
          Messages
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversation List */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <ConversationList
            userType="user" // or "provider" based on your auth
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.serviceRequestId}
          />
        </div>

        {/* Chat Window */}
        <div>{renderChatContent}</div>
      </div>
    </div>
  );
}
