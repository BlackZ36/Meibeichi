import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import data from "../lib/database.json";

export default function ContentManagement() {
  const [chats, setChats] = useState([]);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    setChats(data.chats);
  }, []);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        toast.success(`${fieldName} copied to clipboard`);

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedField(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  return (
    <div className=" p-4">
      <div className="grid grid-cols-4 gap-4">
        {chats.map((item) => (
          <div key={item.id} className="space-y-4">
            <Card className="w-full p-0">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  {item.contents.map((content, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-sm hover:underline hover:text-primary hover:cursor-pointer" onClick={() => handleCopy(content, "chat")}>
                        • {content}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
