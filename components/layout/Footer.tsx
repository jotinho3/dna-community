import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-50" />
              </div>
              <span className="text-xl font-bold text-primary-50">{process.env.NEXT_PUBLIC_COMMUNITY_NAME}</span>
            </div>
            <p className="text-sm text-primary-200">
              The premier community for data professionals to share knowledge and grow together.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-primary-50 mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/questions" className="hover:text-primary-300 transition-colors">
                  Questions
                </Link>
              </li>
              <li>
                <Link href="/topics" className="hover:text-primary-300 transition-colors">
                  Topics
                </Link>
              </li>
              <li>
                <Link href="/users" className="hover:text-primary-300 transition-colors">
                  Users
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary-300 transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-50 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guidelines" className="hover:text-primary-300 transition-colors">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary-300 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary-300 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-primary-300 transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-50 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary-300 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary-300 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-300 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-300 transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-8 text-center text-sm text-primary-200">
          <p>&copy; 2024 {process.env.NEXT_PUBLIC_COMMUNITY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}