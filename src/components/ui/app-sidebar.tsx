"use client";
import {
  ChevronUp,
  Home,
  BookOpen,
  ShoppingBag,
  User2,
  LogOut,
  GraduationCap,
  TrendingUp,
  BarChart3,
  ListChecks,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const isStudent = user?.userId?.role === "student";

  const items = isStudent
    ? [
        {
          title: "Dashboard",
          url: "/s/dashboard",
          icon: Home,
        },
        {
          title: "College Predictor",
          url: "/predictor",
          icon: TrendingUp,
        },
        {
          title: "Choice Filling",
          url: "/choice-filling",
          icon: ListChecks,
        },
        {
          title: "My Orders",
          url: "/s/orders",
          icon: ShoppingBag,
        },
        {
          title: "My Profile",
          url: "/s/profile",
          icon: User2,
        },
      ]
    : [
        {
          title: "Dashboard",
          url: "/c/dashboard",
          icon: Home,
        },
        {
          title: "Students",
          url: "/c/students",
          icon: GraduationCap,
        },
        {
          title: "Predictors",
          url: "/c/predictors",
          icon: BarChart3,
        },
        {
          title: "Choice Filling",
          url: "/c/choice-filling",
          icon: ListChecks,
        },
        {
          title: "My Profile",
          url: "/c/profile",
          icon: User2,
        },
      ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Link href={"/"}>
              <SidebarMenu className="py-6 flex justify-center items-center w-full border-b border-gray-100">
                <Image src="/logo.svg" height={50} width={70} alt="Logo" />
                <h4 className="font-bold text-lg text-[#073d68]">
                  We Won Academy
                </h4>
              </SidebarMenu>
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
            {isStudent ? "Student Portal" : "Application"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                          isActive
                            ? "bg-[#073d68] text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-100 hover:text-[#073d68]"
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            isActive ? "text-white" : "text-gray-500"
                          }`}
                        />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ✅ Sidebar Footer */}
      <SidebarFooter className="border-t border-gray-100 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:bg-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-3 w-full">
                    {user?.userId?.avatar ? (
                      <img
                        src={user.userId.avatar}
                        alt={user.userId.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#073d68]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#073d68] flex items-center justify-center">
                        <User2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.userId?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.userId?.role || "Student"}
                      </p>
                    </div>
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                className="w-56 rounded-xl shadow-xl border border-gray-200"
              >
                <Link
                  href={`/${
                    user?.userId?.role === "student" ? "s" : "c"
                  }/profile`}
                >
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 rounded-lg m-1 p-3">
                    <User2 className="w-4 h-4 mr-2" />
                    My Account
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-red-50 text-red-600 rounded-lg m-1 p-3"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
