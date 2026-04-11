"use client";
import React, { useState } from "react";
import { Share2, Facebook, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  url: string;
  description: string;
}
const normalizeDescription = (html = "") => {
  if (!html) return "";

  return html
    // Convert common block tags to spaces/newlines
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")

    // Remove all remaining HTML tags
    .replace(/<[^>]*>/g, "")

    // Decode basic HTML entities
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

    // Clean extra whitespace
    .replace(/\s+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
};
export default function ShareButton({
  title,
  url,
  description,
}: ShareButtonProps) {
  description = normalizeDescription(description);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : url;

  const handleShare = async (platform: string) => {
    const text = `${title} - ${description}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);

    let shareLink = "";

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "email":
        shareLink = `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodedText}%20${encodedUrl}`;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          toast.error("Failed to copy link");
        }
        return;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
    setShowMenu(false);
  };

  // Use Web Share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        aria-label="Share program"
      >
        <Share2 size={20} className="text-gray-700" />
        <span className="font-medium text-gray-700">Share</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Share Menu */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <button
              onClick={() => handleShare("whatsapp")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="text-gray-700">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare("facebook")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Facebook size={20} className="text-blue-600" />
              <span className="text-gray-700">Facebook</span>
            </button>

            <button
              onClick={() => handleShare("email")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Mail size={20} className="text-gray-600" />
              <span className="text-gray-700">Email</span>
            </button>

            <button
              onClick={() => handleShare("copy")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
            >
              {copied ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <Copy size={20} className="text-gray-600" />
              )}
              <span className="text-gray-700">
                {copied ? "Copied!" : "Copy Link"}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
