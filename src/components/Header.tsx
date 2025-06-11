"use client";

import { ThemeToggle } from "./theme-toggle";
import MobileSidebar from "./MobileSidebar";

interface HeaderProps {
  documents: any[];
  selectedDoc: string | null;
  onSelectDoc: (docId: string) => void;
  onUploadDoc: (file: File) => Promise<any>;
  onDeleteDoc: (docId: string) => Promise<void>;
  processingProgress: any;
}

export default function Header(props: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <MobileSidebar {...props} />
        <div className="flex flex-1 items-center justify-between space-x-4">
          <h1 className="text-lg font-semibold md:hidden">DocuChat</h1>
          <div className="flex-1" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}