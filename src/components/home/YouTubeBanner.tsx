import React from "react";
import { Youtube, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

const YouTubeBanner = () => {
    return (
        <section className="py-12 px-4">
            <div className="container mx-auto">
                <Link
                    href="https://www.youtube.com/c/WeWonAcademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Left Content */}
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Youtube className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                                </div>
                                <div className="text-white">
                                    <p className="text-sm sm:text-base font-medium opacity-90">
                                        Official Website of
                                    </p>
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                                        We Won Academy
                                    </h3>
                                </div>
                            </div>

                            {/* Right Content */}
                            <div className="flex items-center gap-4 sm:gap-8">
                                <div className="flex items-center gap-3 text-white">
                                    <Users className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                                    <div className="text-left">
                                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                                            300k+
                                        </p>
                                        <p className="text-xs sm:text-sm opacity-80">
                                            Subscribers on YouTube
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium group-hover:bg-white group-hover:text-red-600 transition-all duration-300">
                                    <span>Watch Now</span>
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
};

export default YouTubeBanner;
