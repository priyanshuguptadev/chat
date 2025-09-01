import { Chat } from "@/types";
import ReactMarkdown from "react-markdown";

export default function ChatBubble({ role, content }: Chat) {
  return (
    <div className={`w-full flex ${role == "user" && " justify-end"}`}>
      <div
        className={`p-2 w-fit rounded-t-[10px] max-w-2xl  ${" "}${
          role == "user"
            ? "bg-primary flex-end text-primary-foreground rounded-bl-[10px]"
            : "justify-start text-gray-300 rounded-br-[10px]"
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
