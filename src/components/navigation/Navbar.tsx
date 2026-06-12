"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export default function Navbar() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white/70 backdrop-blur-md border-b border-gray-200 z-50 flex items-center justify-between px-6 md:px-12/100 max-w-[1440px] left-1/2 -translate-x-1/2">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="font-bold text-2xl tracking-tight text-gray-900 font-sans">
          TapFolio
        </span>
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <button
          type="button"
          onClick={() => scrollToSection("products")}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("technology")}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
        >
          Technology
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("industries")}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
        >
          Industries
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("pricing")}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
        >
          Pricing
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("order")}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
        >
          Order
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => scrollToSection("order")}
          className="hidden sm:inline-flex items-center justify-center px-6 h-[50px] border border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-50 transition-all cursor-pointer"
        >
          Configure
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("order")}
          className="inline-flex items-center justify-center px-6 h-[50px] bg-gray-900 text-white font-semibold rounded-full hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer shadow-md"
        >
          Order Now
        </button>
      </div>
    </nav>
  );
}
