"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Settings } from "../types";

interface FooterProps {
  settings: Settings | null;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-4">
              {settings?.logoUrl ? (
                <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                  <Image
                    src={settings.logoUrl}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">
                    {settings?.cafeteriaName?.[0] || "C"}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-bold">
                {settings?.cafeteriaName || "Cafetaria"}
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              {settings?.footerText ||
                "Menyediakan makanan dan minuman segar berkualitas dengan harga terjangkau."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  Daftar
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold mb-4">Kontak</h4>
            <p className="text-sm text-gray-400">
              {settings?.contactInfo ||
                "Untuk informasi lebih lanjut, silakan hubungi admin cafetaria."}
            </p>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; 2025 {settings?.cafeteriaName || "Cafetaria"}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
