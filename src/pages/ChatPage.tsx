// import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "~/components/ChatMessage";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import ollama from "ollama";
import { ThoughtMessage } from "~/components/ThoughtMessage";
import { db } from "~/lib/dexie";
import { useParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { set } from "react-hook-form";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chatpage = () => {
  const [messageInput, setMessageInput] = useState("");
  const [stramedMessage, setStreamedMessage] = useState("");
  const [streamedThought, setStreamedThought] = useState("");

  const params = useParams();

  const messages = useLiveQuery(
    () => db.getMessages(params.threadId as string),
    [params.threadId]
  );

  // Ref untuk elemen yang menampung pesan-pesan
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk menggulir ke bawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Gunakan useEffect untuk memantau perubahan pada messages, streamedThought, dan stramedMessage
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedThought, stramedMessage]);

  const handleSubmit = async () => {
    await db.createMessage({
      content: messageInput.trim(),
      role: "user",
      thought: "",
      thread_id: params.threadId as string,
    });
    setMessageInput("");
    const stream = await ollama.chat({
      model: "deepseek-r1:8b",
      messages: [
        {
          role: "user",
          content: messageInput.trim(),
        },
      ],
      stream: true,
    });

    let fullContent = "";
    let fullThought = "";

    let outputMode: "think" | "response" = "think";
    for await (const part of stream) {
      const messageContent = part.message.content;

      if (outputMode === "think") {
        if (
          !(
            messageContent.includes("<think>") ||
            messageContent.includes("</think>")
          )
        ) {
          fullThought += messageContent;
        }
        setStreamedThought(fullThought);
        if (messageContent.includes("</think>")) {
          outputMode = "response";
        }
      } else {
        fullContent += messageContent;
        setStreamedMessage(fullContent);
      }
    }
    await db.createMessage({
      content: fullContent,
      role: "assistant",
      thought: fullThought,
      thread_id: params.threadId as string,
    });

    setStreamedMessage("");
    setStreamedThought("");
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-4 h-16 border-b">
        <h1 className="text-xl font-bold ml-4">Ayam AI</h1>
      </header>
      <main className="flex-1 overflow-auto p-4 w-full">
        <div className="mx-auto space-y-4 pb-20 max-w-screen-md">
          {messages?.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              thought={message.thought}
            />
          ))}

          {!!streamedThought && <ThoughtMessage thought={streamedThought} />}

          {!!stramedMessage && (
            <ChatMessage role="assistant" content={stramedMessage} />
          )}
          {/* Elemen ref untuk menggulir ke bawah */}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            className="flex-1"
            placeholder="Type your message here..."
            rows={5}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <Button onClick={handleSubmit} type="button">
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Chatpage;