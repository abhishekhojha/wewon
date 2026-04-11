"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Check, Info, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchStudentNotifications, markNotificationsRead, NotificationItem } from "@/network/notifications";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchStudentNotifications();
      if (res.success) {
        setNotifications(res.data);
        setHasUnread(res.hasUnread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Refresh every 2 minutes
    const interval = setInterval(loadNotifications, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsOpen(false); // Close the dropdown
    
    try {
      // Call the API and update state
      await markNotificationsRead();
      setHasUnread(false);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Fallback simple duration formatter if date-fns is not available or fails
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return "Just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 outline-none group">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-[#073d68]" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 md:w-96 p-0 mr-4 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            {notifications.length > 0 && (
               <span className="text-[10px] bg-[#073d68]/10 text-[#073d68] font-medium px-2 py-0.5 rounded-full">
                 {notifications.length} total
               </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-[#073d68] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">Loading updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Info className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-600">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No new notifications from your programs.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification._id}
                    onSelect={() => handleNotificationClick(notification)}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150 relative group cursor-pointer block w-full focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {notification.author.avatar ? (
                          <img
                            src={notification.author.avatar}
                            alt={notification.author.name}
                            className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#073d68] to-[#0a5a9c] flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                            {notification.author.name.substring(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate pr-2">
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <div 
                          className="text-xs text-gray-600 line-clamp-2 prose prose-xs"
                          dangerouslySetInnerHTML={{ __html: notification.content }}
                        />
                        <div className="mt-2 text-[10px] text-[#073d68] font-medium bg-[#073d68]/5 inline-block px-1.5 py-0.5 rounded">
                          {notification.author.name}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-50 text-center bg-gray-50/30">
             <button 
               onClick={loadNotifications}
               className="text-[11px] font-medium text-gray-500 hover:text-[#073d68] transition-colors"
             >
               Refresh Notifications
             </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog 
        open={!!selectedNotification} 
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
          {selectedNotification && (
            <div className="flex flex-col">
              <div className="p-6 md:p-8 bg-gradient-to-br from-[#073d68] to-[#0a5a9c] text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/80 tracking-wider uppercase">
                    Mentorship Update
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  {selectedNotification.title}
                </h2>
                
                <div className="mt-8 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      {selectedNotification.author.avatar ? (
                        <img 
                          src={selectedNotification.author.avatar} 
                          className="w-10 h-10 rounded-full border-2 border-white/20" 
                          alt="" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/30">
                          {selectedNotification.author.name.substring(0,1)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{selectedNotification.author.name}</p>
                        <p className="text-[10px] text-white/60">Program Admin</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-white/60 uppercase font-medium tracking-widest">Posted on</p>
                      <p className="text-sm font-medium">{new Date(selectedNotification.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                   </div>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-white">
                <div 
                  className="prose prose-blue max-w-none text-gray-700 leading-relaxed notification-content"
                  dangerouslySetInnerHTML={{ __html: selectedNotification.content }}
                />
                
                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => setSelectedNotification(null)}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all active:scale-95"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationPanel;
