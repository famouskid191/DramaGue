import React, { useState, useEffect } from 'react';

export default function VideoHome() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const adLink = 'https://omg10.com/4/10393647';

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/videos.json');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        
        let shuffled = [...data];
        let currentIndex = shuffled.length, randomIndex;
        while (currentIndex !== 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
        }
        
        setVideos(shuffled);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedVideos = videos.slice(startIdx, startIdx + itemsPerPage);

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
    window.open(`/play/${id}`, '_blank');
    setTimeout(() => {
      window.location.href = adLink;
    }, 3000);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <i className="fa-solid fa-circle-notch fa-spin text-red-600 text-4xl"></i>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedVideos.map(video => (
          <div key={video.id} className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100 dark:border-gray-800 cursor-pointer" onClick={() => handlePlay(video.id)}>
            <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
              <img src={getYoutubeThumbnail(video.url)} alt={video.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-red-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-play text-white ml-1 text-xl"></i>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium backdrop-blur-sm">{video.kategori}</div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-semibold text-gray-900 dark:text-white leading-tight mb-3 line-clamp-2">{video.judul}</h3>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
            <i className="fa-solid fa-chevron-left mr-1"></i> Prev
          </button>
          <span className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">{currentPage} / {totalPages}</span>
          <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
            Next <i className="fa-solid fa-chevron-right ml-1"></i>
          </button>
        </div>
      )}

      {paginatedVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-gray-500 dark:text-gray-400">
          <i className="fa-solid fa-video-slash text-5xl mb-4 text-gray-300 dark:text-gray-600"></i>
          <p className="text-xl font-medium">Video tidak ditemukan</p>
        </div>
      )}
    </>
  );
}