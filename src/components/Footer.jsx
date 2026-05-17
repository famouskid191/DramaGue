import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 py-8 transition-colors duration-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>
          <span className="font-bold text-gray-900 dark:text-white">Drama Gue &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
          <a href="/privacy" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Terms of Service</a>
          <a href="/disclaimer" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Disclaimer</a>
          <a href="/contact" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}