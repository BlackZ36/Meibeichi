import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import data from "../lib/database.json";
import { CheckIcon, CopyIcon } from "lucide-react";

export default function ContentManagement() {
  const [chats, setChats] = useState([]);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    setChats(data.chats);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
      {chats.map((chat, index) => (
        <AnalyticsCard key={index} title={chat.title} contents={chat.contents} color={index} />
      ))}
    </div>
  );
}

function AnalyticsCard({ title, contents, color }) {
  // Tách 'contents' theo dấu ',' nếu nó là chuỗi
  const contentArray = typeof contents === "string" ? contents.split(",") : contents;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className={`p-4 ${color % 2 === 0 ? "bg-secondary" : "bg-primary/50"}`}>
          <h4 className="font-medium">{title}</h4>
        </div>
        <ul className="p-4 space-y-3">
          {contentArray.map((content, index) => (
            <ContentItem key={index} content={content} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ContentItem({ content }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <li className="flex gap-2 items-start">
      <button onClick={copyToClipboard} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 flex-shrink-0" aria-label={`Copy "${content}"`}>
        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
      </button>
      <span className="text-sm">{content}</span>
    </li>
  );
}
