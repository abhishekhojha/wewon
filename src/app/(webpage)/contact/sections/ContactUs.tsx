import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";
import type { FormData } from "../page"; // 👈 import the type from parent

interface ContactUsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit?: (data: FormData) => void;
}

export default function ContactUs({
  formData,
  setFormData,
  onSubmit,
}: ContactUsProps) {
  const email = "wewonacademyhelpdesk@gmail.com";
  const phone = "+91 9532845978";
  const address = "123 Student Lane, Jaipur, Rajasthan, India";

  // Social links
  const socialLinks = {
    telegram: "https://t.me/wewonacademy",
    whatsapp: "https://whatsapp.com/channel/0029VamIMTD9WtC9n8tEs21V",
    instagram:
      "https://www.instagram.com/aman.bhaiya_iiser?igsh=MWc5OTN6MGNsYjhkaw==",
    youtube: "https://www.youtube.com/@WeWonAcademy/videos",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div
      className="pt-8 md:pt-12 pb-8 md:pb-12 bg-background px-4 md:px-0"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Contact Info Card */}
        <div
          className="rounded-3xl p-8 md:p-12 lg:p-16 text-white text-center"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Get in Touch
          </h1>
          {/* <p className="text-base md:text-lg lg:text-xl mb-10 md:mb-14 opacity-90 max-w-xl mx-auto">
            Have a question? Need some help? Or just want to say hello? We'd
            love to hear from you!
          </p> */}

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 md:mb-14">
            {/* Email Card */}
            <a
              href={`mailto:${email}`}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Email Us</p>
                <span className="text-base md:text-lg font-medium">
                  {email}
                </span>
              </div>
            </a>

            {/* Phone Card */}
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">
                  Call Us (WhatsApp Only)
                </p>
                <span className="text-base md:text-lg font-medium">
                  {phone}
                </span>
              </div>
            </a>
          </div>

          {/* Social Links */}
          <div>
            <p className="text-sm md:text-base opacity-80 mb-5">
              Connect with us on social media
            </p>
            <div className="flex justify-center gap-4">
              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
