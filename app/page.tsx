"use client";
import { ArrowUp, TrashIcon, GithubIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { questions } from "@/lib/questions";
import { Chat } from "@/types";
import HistoryBubble from "@/components/HistoryBubble";
import ChatBubble from "@/components/ChatBubble";
import Link from "next/link";

export default function Home() {
  const [msg, setMsg] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [waitingForReply, setWaitingForReply] = useState<Boolean>(false);
  const [isServerOk, setIsServerOk] = useState<boolean>(false);
  useEffect(() => {
    const localHistory = localStorage.getItem("history");
    const jsonHistory = localHistory ? JSON.parse(localHistory) : [];
    setChatHistory(jsonHistory);
  }, []);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);
  const pingServer = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
      if (res.ok) setIsServerOk(true);
      if (!res.ok) setIsServerOk(false);
    } catch (error) {
      setIsServerOk(false);
    }
  };
  useEffect(() => {
    pingServer();
  }, []);
  const sendMsg = async () => {
    if (!msg) return;
    const localHistory = localStorage.getItem("history");
    const jsonHistory = localHistory ? JSON.parse(localHistory) : [];
    const updatedHistory = [...jsonHistory, { role: "user", content: msg }];
    setChatHistory((prev) => [...prev, { role: "user", content: msg }]);
    setMsg("");
    localStorage.setItem("history", JSON.stringify(updatedHistory));
    try {
      setWaitingForReply(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: msg,
          history: jsonHistory,
        }),
      });
      const data = await res.json();
      const finalHistory = [
        ...updatedHistory,
        { role: "assistant", content: data.answer },
      ];
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
      localStorage.setItem("history", JSON.stringify(finalHistory));
      console.log(data);
    } catch (error) {
      const finalHistory = [
        ...updatedHistory,
        { role: "assistant", content: "Failed to connect. Please Refresh." },
      ];
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to connect. Delete the chat and retry!",
        },
      ]);
      localStorage.setItem("history", JSON.stringify(finalHistory));
    } finally {
      setWaitingForReply(false);
    }
  };
  const clearChat = () => {
    localStorage.clear();
    setChatHistory([]);
  };

  return (
    <div className="bg-background h-screen flex flex-col">
      <div className="w-full md:max-w-lg mx-auto min-h-dvh flex flex-col p-2 md:p-0 bg-background">
        <div className="text-xl font-bold p-2"> : &gt;</div>
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between">
            <Link
              href={
                "https://drive.google.com/file/d/15I_ASssvRNQaRakZPHxg6v0c23JYkzrm/view"
              }
            >
              <div className="flex gap-2 bg-card-background border border-border px-4 py-2 w-fit rounded-2xl items-center hover:cursor-pointer">
                <div className="w-10 h-10 text-accent-foreground rounded-[5px] bg-accent font-bold flex justify-center items-center">
                  <Image
                    src={"/document.svg"}
                    width={20}
                    height={20}
                    alt="document"
                  />
                </div>
                <div>
                  <div className="text-card-foreground">priyanshugupta.pdf</div>
                  <div className="text-gray-500">PDF</div>
                </div>
              </div>
            </Link>
            <div className="flex gap-2">
              <button
                disabled={!chatHistory.length}
                className="bg-card border border-border w-10 h-10 flex justify-center items-center rounded-[10px] hover:cursor-pointer disabled:text-gray-500 text-red-700"
                onClick={clearChat}
              >
                <TrashIcon />
              </button>
              <Link
                href={"https://github.com/priyanshuguptadev/rag-frontend"}
                className="bg-card border border-border w-10 h-10 flex justify-center items-center rounded-[10px] hover:cursor-pointer text-white"
              >
                <GithubIcon />
              </Link>
            </div>
          </div>
          {!isServerOk ? (
            <p className="text-center mt-8 animate-pulse text-xs">
              Connecting to server...
            </p>
          ) : (
            !chatHistory.length &&
            !msg && (
              <p className="text-xs text-green-600 text-center mt-8">
                Server is OK.
              </p>
            )
          )}
          <div className="flex-1 overflow-y-auto mb-24">
            {chatHistory && (
              <div className="flex flex-col gap-4 items-end my-8">
                {chatHistory.map((c, i) => (
                  <ChatBubble key={i} role={c.role} content={c.content} />
                ))}
              </div>
            )}
            <div>
              {waitingForReply && (
                <span className="animate-pulse text-gray-300">replying</span>
              )}
            </div>
            {chatHistory.length > 0 && <div ref={chatEndRef}></div>}
          </div>
          {chatHistory.length == 0 && !msg && (
            <div className="flex flex-col gap-2 m-2 w-full">
              {questions.map((q) => (
                <HistoryBubble
                  content={q.content}
                  onclick={() => setMsg(q.content)}
                  id={q.id}
                  key={q.id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-2 p-1 rounded-full shadow-sm w-full flex gap-2 mb-8 bg-input flex-shrink-0">
          <input
            disabled={!isServerOk}
            type="text"
            value={msg || ""}
            className="ml-2 p-1 w-full outline-none bg-transparent"
            placeholder="Who is priyanshu?"
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key == "Enter" && sendMsg()}
          />
          <button
            disabled={!msg}
            onClick={sendMsg}
            className="bg-primary disabled:bg-muted rounded-full text-primary-foreground p-2 hover:cursor-pointer hover:opacity-70"
          >
            <ArrowUp />
          </button>
        </div>
      </div>
    </div>
  );
}
