import React, { useState } from "react";
import { useMessaging } from "@/features/messaging/hooks/useMessaging";
import { ConversationList } from "@/features/messaging/components/ConversationList";
import { MessengerView } from "@/features/messaging/components/MessengerView";
import { ImagePreviewModal } from "@/features/messaging/components/ImagePreviewModal";

export const MessagesPage: React.FC = () => {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    messages,
    isTyping,
    sendMessage,
    searchQuery,
    setSearchQuery,
  } = useMessaging();

  const [previewImage, setPreviewImage] = useState<{ url: string; name?: string } | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileShowChat(true);
  };

  return (
    <div className="h-[calc(100vh-6rem)] pb-6 flex flex-col space-y-4">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Enterprise Communications Console
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time messaging platform connecting Tenants, Property Owners, Maintenance Vendors, and Support.
        </p>
      </div>

      <div className="flex-1 rounded-3xl border border-border/50 bg-card overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-3">
        {/* Left Column: Conversation List */}
        <div className={`${mobileShowChat ? "hidden md:block" : "block"} md:col-span-1 h-full`}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Right Column: Messenger View */}
        <div className={`${!mobileShowChat ? "hidden md:block" : "block"} md:col-span-2 h-full`}>
          <MessengerView
            activeConversation={activeConversation}
            messages={messages}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            onPreviewImage={(url, name) => setPreviewImage({ url, name })}
            onBackMobile={() => setMobileShowChat(false)}
          />
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          isOpen={true}
          imageUrl={previewImage.url}
          fileName={previewImage.name}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default MessagesPage;
