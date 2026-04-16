"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Bell, 
  Check, 
  Info, 
  Calendar, 
  User, 
  Search, 
  Filter, 
  RefreshCw,
  MoreVertical,
  Inbox
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  fetchStudentNotifications, 
  markNotificationsRead, 
  NotificationItem 
} from "@/network/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchStudentNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    setSelectedNotification(notification);
    
    try {
      await markNotificationsRead();
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
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

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header section with background effect */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-[#073d68]/10 p-2 rounded-xl">
                  <Bell className="w-6 h-6 text-[#073d68]" />
                </div>
                <h1 className="text-2xl font-bold text-[#073d68]">Notifications</h1>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Stay updated with your mentorship programs and announcements
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#073d68] transition-colors" />
                <input 
                  type="text"
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#073d68]/10 focus:border-[#073d68]/20 transition-all font-medium"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={loadNotifications}
                className="rounded-xl border-gray-100 hover:bg-gray-50 hover:text-[#073d68]"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && notifications.length === 0 ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-50 flex gap-4">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No notifications found</h3>
            <p className="text-gray-500 mt-2 text-center max-w-sm">
              {searchTerm ? "Couldn't find any updates matching your search." : "You're all caught up! There are no new notifications at the moment."}
            </p>
            {searchTerm && (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm("")}
                className="mt-2 text-[#073d68]"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className="group relative bg-white border border-transparent hover:border-[#073d68]/20 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0 relative">
                    {notification.author.avatar ? (
                      <img
                        src={notification.author.avatar}
                        alt={notification.author.name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white shadow-sm object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#073d68] to-[#0a5a9c] flex items-center justify-center text-white text-lg font-bold shadow-md">
                        {notification.author.name.substring(0, 1)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-gray-50">
                       <Check className="w-3 h-3 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-1 mb-2">
                       <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-[#073d68] transition-colors leading-tight">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] font-medium text-gray-400 whitespace-nowrap">
                         <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                           <Calendar className="w-3 h-3" />
                           {formatDate(notification.createdAt)}
                         </span>
                         <span className="text-gray-300 hidden md:block">•</span>
                         <span>{getTimeAgo(notification.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div 
                      className="text-sm text-gray-600 line-clamp-2 md:line-clamp-3 prose-sm max-w-none text-pretty"
                      dangerouslySetInnerHTML={{ __html: notification.content }}
                    />
                    
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                       <div className="flex items-center gap-2 px-2.5 py-1 bg-[#073d68]/5 rounded-lg border border-[#073d68]/10">
                          <User className="w-3.5 h-3.5 text-[#073d68]" />
                          <span className="text-[11px] font-bold text-[#073d68] uppercase tracking-wider">
                            {notification.author.name}
                          </span>
                       </div>
                       <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-none px-2 py-0.5 text-[10px] font-semibold">
                          Mentorship
                       </Badge>
                       <span className="ml-auto text-xs font-semibold text-[#073d68] opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 translate-x-2 group-hover:translate-x-0">
                          Read more <MoreVertical className="w-4 h-4 rotate-90" />
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog 
        open={!!selectedNotification} 
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
          {selectedNotification && (
            <div className="flex flex-col h-full bg-white">
              {/* Modal Cover Image/Header */}
              <div className="h-32 md:h-48 bg-gradient-to-br from-[#073d68] via-[#0a5a9c] to-[#073d68] relative px-6 md:px-10 py-6 md:py-8 flex flex-col justify-end">
                <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-64 h-64 border-[20px] border-white rounded-full"></div>
                  <div className="absolute top-20 left-10 w-32 h-32 border-[10px] border-white rounded-full"></div>
                </div>
                
                <div className="relative z-10 flex items-center gap-3 mb-2">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-white/20 text-[10px] font-bold tracking-widest uppercase py-1">
                    Announcement
                  </Badge>
                </div>
                <h2 className="relative z-10 text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-sm">
                  {selectedNotification.title}
                </h2>
              </div>

              {/* Author Info Bar */}
              <div className="px-6 md:px-10 py-4 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedNotification.author.avatar ? (
                    <img 
                      src={selectedNotification.author.avatar} 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                      alt="" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#073d68] flex items-center justify-center font-bold text-white text-xs ring-4 ring-white shadow-sm">
                      {selectedNotification.author.name.substring(0,1)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">{selectedNotification.author.name}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Verified Mentor</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Posted on</p>
                      <p className="text-sm font-bold text-gray-700">{formatDate(selectedNotification.createdAt)}</p>
                   </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 md:p-10">
                <div 
                  className="prose prose-slate prose-lg max-w-none text-gray-700 leading-relaxed notification-content-full selection:bg-[#073d68]/10"
                  dangerouslySetInnerHTML={{ __html: selectedNotification.content }}
                />
                
                <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-center gap-2 text-gray-400 italic text-xs">
                     <Info className="w-4 h-4" />
                     This is an official communication from WeWon Mentorship.
                   </div>
                  <Button 
                    onClick={() => setSelectedNotification(null)}
                    className="bg-[#073d68] hover:bg-[#0a5a9c] text-white px-8 h-12 rounded-2xl font-bold text-sm shadow-lg shadow-[#073d68]/20 transition-all active:scale-95 group"
                  >
                    Acknowledged
                    <Check className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <style jsx global>{`
        .notification-content-full img {
          border-radius: 1rem;
          margin: 1.5rem 0;
          box-shadow: 0 4px 20px -5px rgba(0,0,0,0.1);
          max-width: 100%;
          height: auto;
        }
        .notification-content-full a {
          color: #073d68;
          font-weight: 600;
          text-decoration-line: underline;
          text-underline-offset: 4px;
          transition: all 0.2s;
        }
        .notification-content-full a:hover {
          color: #0a5a9c;
        }
        .notification-content-full h1, 
        .notification-content-full h2, 
        .notification-content-full h3 {
          color: #0f172a;
          font-weight: 800;
          margin-top: 2rem;
        }
        .notification-content-full p {
          margin-bottom: 1.25rem;
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;