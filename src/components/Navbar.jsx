import React, { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [allVideos, setAllVideos] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    fetch('/videos.json')
      .then(res => res.json())
      .then(data => setAllVideos(data))
      .catch(err => console.error(err));

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchSuggestions([]);
      setIsSuggesting(false);
      return;
    }
    setIsSuggesting(true);
    setShowSuggestions(true);
    const timeout = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = allVideos.filter(v => 
        v.judul.toLowerCase().includes(query) || 
        v.kategori.toLowerCase().includes(query) || 
        v.tag.some(t => t.toLowerCase().includes(query))
      ).slice(0, 5);
      setSearchSuggestions(filtered);
      setIsSuggesting(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, allVideos]);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const translateLanguage = (lang) => {
    const selectField = document.querySelector(".goog-te-combo");
    if(selectField) {
      selectField.value = lang;
      if (typeof Event === 'function') {
        selectField.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        const evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        selectField.dispatchEvent(evt);
      }
    }
    setLangOpen(false);
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getYoutubeThumbnail = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  const handlePlay = (id) => {
    window.location.href = `/play?id=${id}`;
  };

  const languages = [
    { code: 'id', name: 'Indonesia', flag: 'id' },
    { code: 'en', name: 'English', flag: 'us' },
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'de', name: 'Deutsch', flag: 'de' },
    { code: 'ru', name: 'Русский', flag: 'ru' },
    { code: 'ar', name: 'العربية', flag: 'sa' },
    { code: 'zh-CN', name: '中文', flag: 'cn' },
    { code: 'ja', name: '日本語', flag: 'jp' },
    { code: 'ko', name: '한국어', flag: 'kr' },
    { code: 'th', name: 'ไทย', flag: 'th' },
    { code: 'vi', name: 'Tiếng Việt', flag: 'vn' }
  ];

  return (
    <nav className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 py-3 px-4 sm:px-6 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <a href="/" className="flex items-center gap-2 sm:gap-3">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="currentColor" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>
            <span className="font-bold text-base sm:text-lg tracking-tight text-gray-900 dark:text-white hidden sm:block">Drama Gue</span>
          </a>
        </div>

        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fa-solid fa-search text-gray-400"></i>
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-gray-50 dark:bg-[#2d2d2d] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm transition-colors duration-300" 
            placeholder="Cari video..." 
          />
          
          {showSuggestions && searchQuery.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
              {isSuggesting ? (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <i className="fa-solid fa-circle-notch fa-spin text-red-600"></i> Mencari...
                </div>
              ) : searchSuggestions.length > 0 ? (
                searchSuggestions.map(suggestion => (
                  <div key={suggestion.id} onClick={() => handlePlay(suggestion.id)} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <img src={getYoutubeThumbnail(suggestion.url)} className="w-14 h-9 object-cover rounded shrink-0 shadow-sm" alt="Thumbnail" />
                    <span className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 leading-snug">{suggestion.judul}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Pencarian tidak ditemukan.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
              <i className="fa-solid fa-language text-xl text-gray-600 dark:text-gray-300"></i>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-48 max-h-96 overflow-y-auto bg-white dark:bg-[#2d2d2d] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-2 custom-scrollbar">
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => translateLanguage(lang.code)} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm dark:text-gray-200">
                    <img src={`https://flagcdn.com/w20/${lang.flag}.png`} alt={lang.code} className="w-5 shadow-sm" /> {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <i className={`fa-solid text-xl ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-gray-600'}`}></i>
          </button>
        </div>
      </div>
    </nav>
  );
}