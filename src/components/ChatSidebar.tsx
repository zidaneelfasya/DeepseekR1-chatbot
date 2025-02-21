import { Moon, Plus, Sun } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
} from "~/components/ui/sidebar";
import { useTheme } from "./ThemeProvider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { db } from "~/lib/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useLocation } from "react-router";

export const ChatSidebar = () => {
  const [activeThread, setActiveThread] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const { setTheme, theme } = useTheme();

  const location = useLocation();

  const threads = useLiveQuery(() => db.getAllThreads(), []);

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const handleCreateThread = async () => {
    const threadId = await db.createThread(textInput);
    setIsDialogOpen(false);
    setTextInput("");
  };

  useLayoutEffect(() => {
    setActiveThread(location.pathname.split("/")[2]); 
  },[location.pathname]);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            
            <DialogTitle>Create New Threads</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="thread-title">Thread Title</Label>
            <Input
              id="thread-title"
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
              }}
              placeholder="Your thread title"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateThread}>Create Thread</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SidebarPrimitive>
        <SidebarHeader>
          <a href="/" className="flex justify-center py-3 mb-4 text-xl font-bold hover: ">Chicken AI</a>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-5 justify-start bg-primary text-primary-foreground text-md"
            
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
              <SidebarMenu>
                {threads?.map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <Link to={`/thread/${thread.id}`}>
                    <SidebarMenuButton isActive={thread.id == activeThread}>{thread.title}</SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button
            onClick={handleToggleTheme}
            variant="ghost"
            className="w-full justify-start"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />{" "}
            Toggle Theme
          </Button>
        </SidebarFooter>
      </SidebarPrimitive>
    </>
  );
};
