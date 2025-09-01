import { Question } from "@/types";

interface Props extends Question {
  onclick: () => void;
}

export default function HistoryBubble({ content, onclick }: Props) {
  return (
    <button
      onClick={onclick}
      className="p-2 bg-card border border-border w-fit rounded-tr-2xl text-gray-400 cursor-pointer hover:bg-accent hover:text-accent-foreground animate-climb-up"
    >
      {content}
    </button>
  );
}
