import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DataHub</span>
            </div>
            <p className="text-sm">
              The premier community for data professionals to share knowledge and grow together.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/questions" className="hover:text-emerald-400">
                  Questions
                </Link>
              </li>
              <li>
                <Link href="/topics" className="hover:text-emerald-400">
                  Topics
                </Link>
              </li>
              <li>
                <Link href="/users" className="hover:text-emerald-400">
                  Users
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-emerald-400">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guidelines" className="hover:text-emerald-400">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-emerald-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-emerald-400">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-emerald-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-emerald-400">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 DataHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}