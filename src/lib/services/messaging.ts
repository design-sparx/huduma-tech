import { supabase } from "@/lib/supabase";

import type { Conversation, ConversationSummary, Message } from "@/types";

// Cache the current user to avoid repeated auth calls
let cachedUser: any = null;
let userPromise: Promise<any> | null = null;

// Get current user with caching
async function getCurrentUser() {
  if (cachedUser) {
    return cachedUser;
  }

  if (userPromise) {
    return userPromise;
  }

  userPromise = supabase.auth.getSession().then(({ data: { session } }) => {
    cachedUser = session?.user ?? null;
    userPromise = null; // Clear the promise
    return cachedUser;
  });

  return userPromise;
}

// Clear cache when auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  cachedUser = session?.user ?? null;
  userPromise = null;
});

// Send a message
export async function sendMessage(
  serviceRequestId: string,
  content: string,
  senderType: "user" | "provider"
): Promise<Message> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      service_request_id: serviceRequestId,
      sender_id: user.id,
      sender_type: senderType,
      content: content.trim(),
      message_type: "text",
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }

  return {
    id: data.id,
    serviceRequestId: data.service_request_id,
    senderId: data.sender_id,
    senderType: data.sender_type,
    content: data.content,
    messageType: data.message_type,
    readAt: data.read_at ? new Date(data.read_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Get messages for a service request
export async function getMessages(
  serviceRequestId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("service_request_id", serviceRequestId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }

  return data.map(msg => ({
    id: msg.id,
    serviceRequestId: msg.service_request_id,
    senderId: msg.sender_id,
    senderType: msg.sender_type,
    content: msg.content,
    messageType: msg.message_type,
    readAt: msg.read_at ? new Date(msg.read_at) : undefined,
    createdAt: new Date(msg.created_at),
    updatedAt: new Date(msg.updated_at),
  }));
}

// Mark messages as read
export async function markMessagesAsRead(
  serviceRequestId: string,
  userType: "user" | "provider"
): Promise<void> {
  const { error } = await supabase.rpc("mark_messages_read", {
    p_service_request_id: serviceRequestId,
    p_user_type: userType,
  });

  if (error) {
    console.error("Error marking messages as read:", error);
    throw new Error("Failed to mark messages as read");
  }
}

// Get conversation for a service request
export async function getConversation(
  serviceRequestId: string
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      service_requests!inner (
        id,
        title,
        status,
        users!inner (
          id,
          name,
          avatar
        ),
        service_providers (
          id,
          name,
          avatar
        )
      )
    `
    )
    .eq("service_request_id", serviceRequestId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No conversation found
    }
    console.error("Error fetching conversation:", error);
    throw new Error("Failed to fetch conversation");
  }

  const serviceRequest = data.service_requests;

  return {
    id: data.id,
    serviceRequestId: data.service_request_id,
    userId: data.user_id,
    providerId: data.provider_id,
    lastMessageAt: new Date(data.last_message_at),
    userUnreadCount: data.user_unread_count,
    providerUnreadCount: data.provider_unread_count,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    request: {
      id: serviceRequest.id,
      title: serviceRequest.title,
      status: serviceRequest.status,
    } as any,
    user: {
      id: serviceRequest.users.id,
      name: serviceRequest.users.name,
      avatar: serviceRequest.users.avatar,
    } as any,
    provider: serviceRequest.service_providers
      ? ({
          id: serviceRequest.service_providers.id,
          name: serviceRequest.service_providers.name,
          avatar: serviceRequest.service_providers.avatar,
        } as any)
      : undefined,
  };
}

// Get all conversations for a user (customer view)
export async function getUserConversations(): Promise<ConversationSummary[]> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      service_request_id,
      user_unread_count,
      last_message_at,
      service_requests!inner (
        title,
        status,
        service_providers (
          name,
          avatar
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Error fetching user conversations:", error);
    throw new Error("Failed to fetch conversations");
  }

  // Get last messages for each conversation
  const conversationIds = data.map(c => c.service_request_id);
  if (conversationIds.length === 0) {
    return [];
  }

  const { data: lastMessages } = await supabase
    .from("messages")
    .select("service_request_id, content, created_at")
    .in("service_request_id", conversationIds)
    .order("created_at", { ascending: false });

  // Group messages by request ID and get the latest
  const lastMessageMap = new Map();
  lastMessages?.forEach(msg => {
    if (!lastMessageMap.has(msg.service_request_id)) {
      lastMessageMap.set(msg.service_request_id, msg);
    }
  });

  return data.map((conv: any) => {
    const lastMsg = lastMessageMap.get(conv.service_request_id);
    const provider = conv.service_requests.service_providers;

    return {
      id: conv.id,
      serviceRequestId: conv.service_request_id,
      title: conv.service_requests.title,
      otherPartyName: provider?.name || "Provider",
      otherPartyAvatar: provider?.avatar,
      lastMessage: lastMsg?.content || "No messages yet",
      lastMessageAt: new Date(conv.last_message_at),
      unreadCount: conv.user_unread_count,
      status: conv.service_requests.status,
    };
  });
}

// Get all conversations for a provider
export async function getProviderConversations(): Promise<
  ConversationSummary[]
> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      service_request_id,
      provider_unread_count,
      last_message_at,
      service_requests!inner (
        title,
        status,
        users (
          name,
          avatar
        )
      )
    `
    )
    .eq("provider_id", user.id)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Error fetching provider conversations:", error);
    throw new Error("Failed to fetch conversations");
  }

  // Get last messages for each conversation
  const conversationIds = data.map(c => c.service_request_id);
  if (conversationIds.length === 0) {
    return [];
  }

  const { data: lastMessages } = await supabase
    .from("messages")
    .select("service_request_id, content, created_at")
    .in("service_request_id", conversationIds)
    .order("created_at", { ascending: false });

  // Group messages by request ID and get the latest
  const lastMessageMap = new Map();
  lastMessages?.forEach(msg => {
    if (!lastMessageMap.has(msg.service_request_id)) {
      lastMessageMap.set(msg.service_request_id, msg);
    }
  });

  return data.map((conv: any) => {
    const lastMsg = lastMessageMap.get(conv.service_request_id);
    const customer = conv.service_requests.users;

    return {
      id: conv.id,
      serviceRequestId: conv.service_request_id,
      title: conv.service_requests.title,
      otherPartyName: customer?.name || "Customer",
      otherPartyAvatar: customer?.avatar,
      lastMessage: lastMsg?.content || "No messages yet",
      lastMessageAt: new Date(conv.last_message_at),
      unreadCount: conv.provider_unread_count,
      status: conv.service_requests.status,
    };
  });
}

// Subscribe to new messages for a service request
export function subscribeToMessages(
  serviceRequestId: string,
  callback: (message: Message) => void
) {
  const subscription = supabase
    .channel(`messages:${serviceRequestId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `service_request_id=eq.${serviceRequestId}`,
      },
      payload => {
        const data = payload.new;
        callback({
          id: data.id,
          serviceRequestId: data.service_request_id,
          senderId: data.sender_id,
          senderType: data.sender_type,
          content: data.content,
          messageType: data.message_type,
          readAt: data.read_at ? new Date(data.read_at) : undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// Send system message (e.g., when status changes)
export async function sendSystemMessage(
  serviceRequestId: string,
  content: string
): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("messages").insert({
    service_request_id: serviceRequestId,
    sender_id: user.id,
    sender_type: "system",
    content,
    message_type: "system",
  });

  if (error) {
    console.error("Error sending system message:", error);
    throw new Error("Failed to send system message");
  }
}
