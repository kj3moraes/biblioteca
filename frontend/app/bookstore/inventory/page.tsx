'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center p-4">
      <div className='flex space-x-2 w-full max-w-2xl'>
        <Input className="flex-1" placeholder="Search by title or author name"/>
        <Button variant="outline">
          <Search size={28}/>
        </Button>
      </div>
      <div>

      </div>
    </div>
  );
}
