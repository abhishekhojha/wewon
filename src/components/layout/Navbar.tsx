"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { logout } from "@/store/auth/authSlice";

const Navbar = () => { 
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const navLinks = [
    { name: "Predictor", href: "/predictor" },
    // { name: "Choice Filling", href: "/choice-filling" },
    { name: "Counselling", href: "/counseling" },
    { name: "Colleges", href: "/colleges" },
    { name: "Exams", href: "/exams" },
    { name: "News", href: "/news" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      router.push("/auth");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
  };

  const handleDashboard = () => {
    router.push("/s/dashboard");
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-[var(--background)] text-white flex items-center shadow-md w-full relative z-50 py-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center h-full">
          <Link href="/" className="h-full py-2">
            <Image
              src="/logo.svg"
              alt="We Won Academy Logo"
              width={150}
              height={150}
              className="w-auto object-cover"
            />
          </Link>
        </div>

        <div className="flex gap-6 items-center">
          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center space-x-4 h-full">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[var(--primary)] text-sm font-semibold hover:text-[var(--accent)] transition-colors h-full flex items-center"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Button/Icon - Desktop */}
          <div
            className="hidden xl:flex items-center relative"
            ref={dropdownRef}
          >
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleAuthClick}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--accent)] transition-colors cursor-pointer"
                  aria-label="User Profile"
                >
                  <User size={20} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
                    >
                      <button
                        onClick={handleDashboard}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[var(--primary)] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard size={18} />
                        <span className="font-medium">Dashboard</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-t border-gray-100"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <button
                onClick={handleAuthClick}
                className="px-6 py-2 bg-[var(--primary)] text-white font-semibold rounded-full hover:bg-[var(--accent)] transition-colors"
              >
                Login/Register
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}

        <div className="xl:hidden flex items-center gap-3">
          <Link
            href="/predictor"
            className="bg-[var(--primary)] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition-all"
          >
            Predictors
          </Link>
         
          <Link
            href="/counseling"
            className="bg-[var(--accent)] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition-all"
          >
            Counsellings
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[var(--primary)] focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Animated) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fixed Topbar */}
            <div className="shadow-md xl:hidden fixed top-0 left-0 right-0 bg-[var(--background)] z-[51]">
              <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
                <Image
                  src="/logo.svg"
                  alt="We Won Academy Logo"
                  width={120}
                  height={60}
                  className="h-12 w-auto object-contain"
                />
                <div className="flex items-center gap-3">
                  <Link
                    href="/counseling"
                    className="bg-[var(--accent)] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Counselling →
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[var(--primary)] focus:outline-none"
                  >
                    <X size={32} />
                  </button>
                </div>
              </div>
            </div>

            {/* Slide-in menu */}
            <motion.div
              className="xl:hidden fixed top-0 left-0 h-full w-4/5 max-w-xs bg-[var(--background)] z-50 flex flex-col pt-20 shadow-2xl"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex-1 flex flex-col gap-3 px-5 py-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[var(--primary)] text-base font-semibold hover:text-[var(--accent)] transition-colors py-3 px-4 rounded-xl bg-white/5 shadow-sm text-left w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Auth Button - Mobile */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => {
                          handleDashboard();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 text-[var(--primary)] text-base font-semibold hover:text-[var(--accent)] transition-colors py-3 px-4 rounded-xl bg-white/5 shadow-sm text-left w-full mb-2"
                      >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 text-red-600 text-base font-semibold hover:text-red-700 transition-colors py-3 px-4 rounded-xl bg-red-50 shadow-sm text-left w-full"
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleAuthClick();
                        setIsOpen(false);
                      }}
                      className="w-full px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--accent)] transition-colors"
                    >
                      Login / Register
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Background overlay */}
            <motion.div
              className="xl:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
