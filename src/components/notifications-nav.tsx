"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// This would come from your API
const mockNotifications = [
  {
    id: 1,
    title: "New Achievement Unlocked!",
    description: "You've completed 5 mock interviews",
    type: "achievement",
    read: false,
    createdAt: "2 hours ago",
  },
  {
    id: 2,
    title: "Interview Performance Report",
    description: "Your latest mock interview analysis is ready",
    type: "report",
    read: false,
    createdAt: "5 hours ago",
  },
  {
    id: 3,
    title: "Credit Bonus!",
    description: "You've earned 50 credits for consistent practice",
    type: "reward",
    read: true,
    createdAt: "1 day ago",
  },
  {
    id: 4,
    title: "Level Up!",
    description: "You've reached Level 3 - Interview Pro",
    type: "level",
    read: true,
    createdAt: "2 days ago",
  },
];

export function NotificationsNav() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-xs leading-none text-muted-foreground">
                You have {unreadCount} unread notifications
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          mockNotifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                "flex flex-col items-start gap-1 p-4",
                !notification.read && "bg-muted/50",
              )}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="font-medium">{notification.title}</span>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {notification.createdAt}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {notification.description}
              </span>
            </DropdownMenuItem>
          ))
        )}
        {mockNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm font-medium text-primary">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
