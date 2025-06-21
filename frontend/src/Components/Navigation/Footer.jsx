import React from "react";
import { MapPin, Phone, Mail, FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon, Copyright } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-black via-[#00214f] to-[#014db7] text-white pt-10 px-6 rounded-t-lg">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* Replace with your logo if needed */}
            <span className="font-bold text-lg tracking-wide flex items-center gap-1">
              <span className="bg-white rounded-full p-1">
                {/* Example: Lucide icon as logo */}
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                  <rect x="4" y="4" width="16" height="16" rx="4" />
                </svg>
              </span>
              Aspira
            </span>
          </div>
          <div className="text-sm mb-2">
            20619 Torrence Chapel Rd<br />
            Suite 116 #1040<br />
            Cornelius, CL 28031<br />
            Sri Lanka
          </div>
          <div className="flex flex-col gap-1 text-sm mt-4">
            <div className="flex gap-2 items-center">
              <Phone className="w-4 h-4" /> <span>94-76-201-1019</span>
            </div>
            <div className="flex gap-2 items-center">
              <Mail className="w-4 h-4" /> <span>support@skipmatrix.com</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="font-semibold mb-2">Quick links</div>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">Pricing</a></li>
            <li><a href="#" className="hover:underline">Resources</a></li>
            <li><a href="#" className="hover:underline">About us</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Contact us</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <div className="font-semibold mb-2">Social</div>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2"><FacebookIcon className="w-4 h-4" /> Facebook</li>
            <li className="flex items-center gap-2"><InstagramIcon className="w-4 h-4" /> Instagram</li>
            <li className="flex items-center gap-2"><LinkedinIcon className="w-4 h-4" /> LinkedIn</li>
            <li className="flex items-center gap-2"><TwitterIcon className="w-4 h-4" /> Twitter</li>
            <li className="flex items-center gap-2"><YoutubeIcon className="w-4 h-4" /> Youtube</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <div className="font-semibold mb-2">Legal</div>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">Terms of service</a></li>
            <li><a href="#" className="hover:underline">Privacy policy</a></li>
            <li><a href="#" className="hover:underline">Cookie policy</a></li>
          </ul>
        </div>
      </div>

      {/* Thin white line */}
      <div className="border-t border-white/30 my-8"></div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-gray-200 pb-4">
        <div className="flex items-center gap-1">
          <Copyright className="w-4 h-4 inline" /> 2025 Aspira. All rights reserved.
        </div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
