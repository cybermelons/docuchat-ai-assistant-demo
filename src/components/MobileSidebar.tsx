"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";

interface MobileSidebarProps {
  documents: any[];
  selectedDoc: string | null;
  onSelectDoc: (docId: string) => void;
  onUploadDoc: (file: File) => Promise<any>;
  onDeleteDoc: (docId: string) => Promise<void>;
  processingProgress: any;
}

export default function MobileSidebar(props: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <Sidebar {...props} />
      </SheetContent>
    </Sheet>
  );
}