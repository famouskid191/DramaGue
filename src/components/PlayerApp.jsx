import React, { useState, useEffect, useRef } from 'react';

export default function PlayerApp({ videoId }) {
  const [videoData, setVideoData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedPage, setRelatedPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [useEmbed, setUseEmbed] = useState(false);
  const videoRef = useRef(null);
  
  const relatedPerPage = 8;
  const backendBaseUrl = 'https://api.wandabot.my.id/api';
  const vastAdTagUrl = 'https://physicaldad.com/d.mqFBzxdsGMN/vTZUGmUQ/ie/mV9Ju/ZBU/lpkRP/T-cywKNiT/M/xHNAjtU/tqNxzKAw1ZMNzIEh2JO_Q_';

  const getNextAdLink = () => {
    const adLinks = [
      'https://ashamed-employer.com/1T8SmW',
      'https://omg10.com/4/10393647'
    ];
    let lastIndex = parseInt(localStorage.getItem('lastAdIndex') || '0', 10);
    if (isNaN(lastIndex) || lastIndex >= adLinks.length) {
      lastIndex = 0;
    }
    const nextIndex = (lastIndex + 1) % adLinks.length;
    localStorage.setItem('lastAdIndex', nextIndex.toString());
    return adLinks[lastIndex];
  };

  useEffect(() => {
    if (!videoId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const response = await fetch('/videos.json');
        if (!response.ok) throw new Error('Network error');
        const allVideos = await response.json();
        
        const currentVideo = allVideos.find(v => v.id === parseInt(videoId));
        setVideoData(currentVideo);
        
        if (currentVideo) {
          const uniqueRecs = [];
          const seenUrls = new Set();
          seenUrls.add(currentVideo.url);
          
          const reversedVideos = [...allVideos].reverse();
          for (let i = 0; i < reversedVideos.length; i++) {
            const v = reversedVideos[i];
            if (!seenUrls.has(v.url)) {
              uniqueRecs.push(v);
              seenUrls.add(v.url);
            }
            if (uniqueRecs.length >= 40) break;
          }
          setRecommendations(uniqueRecs);

          let related = [];
          if (currentVideo.tag && currentVideo.tag.length > 0) {
            related = allVideos.filter(v => 
              v.id !== currentVideo.id && 
              v.tag && 
              v.tag.some(t => currentVideo.tag.includes(t))
            );
            related = related.sort(() => 0.5 - Math.random());
          }
          setRelatedVideos(related);

          const fetchTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
          
          try {
            const streamRes = await Promise.race([
              fetch(`${backendBaseUrl}/stream?url=${encodeURIComponent(currentVideo.url)}`),
              fetchTimeout
            ]);
            
            if (!streamRes.ok) throw new Error('Backend stream fetch failed');
            
            const streamData = await streamRes.json();
            if (streamData.stream_url) {
              setStreamUrl(streamData.stream_url);
              setUseEmbed(false);
            } else {
              throw new Error('Invalid URL returned');
            }
          } catch (error) {
            setUseEmbed(true);
            const ytId = extractVideoId(currentVideo.url);
            setEmbedUrl(ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0` : '');
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [videoId]);

  useEffect(() => {
    if (streamUrl && !useEmbed && videoRef.current && window.fluidPlayer) {
      if (!videoRef.current.hasAttribute('data-fluid-initialized')) {
        window.fluidPlayer(videoRef.current, {
          layoutControls: {
            primaryColor: "#dc2626",
            fillToContainer: true,
            autoPlay: false,
            posterImage: getYoutubeThumbnail(videoData?.url)
          },
          vastOptions: {
            allowVPAID: true,
            adList: [
              {
                roll: 'pre',
                vastTag: vastAdTagUrl
              }
            ]
          }
        });
        videoRef.current.setAttribute('data-fluid-initialized', 'true');
      }
    }
  }, [streamUrl, useEmbed, videoData]);

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

  const getSliderThumbnail = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  };

  const handleActionPlay = (id) => {
    window.open(`/play/${id}`, '_blank');
    setTimeout(() => {
      window.location.href = getNextAdLink();
    }, 3000);
  };

  const handleDownload = (youtubeUrl) => {
    if (!youtubeUrl) return;
    
    window.open(`/play/${videoId}`, '_blank');
    const downloadUrl = `${backendBaseUrl}/download?url=${encodeURIComponent(youtubeUrl)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => {
      window.location.href = getNextAdLink();
    }, 3000);
  };

  const totalRelatedPages = Math.ceil(relatedVideos.length / relatedPerPage);
  const currentRelatedVideos = relatedVideos.slice(
    (relatedPage - 1) * relatedPerPage,
    relatedPage * relatedPerPage
  );

  return (
    <main className="flex-grow flex flex-col max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 lg:flex-row gap-8">
      <div className="w-full lg:w-3/4 flex flex-col">
        {isLoading && (
          <div className="aspect-video w-full bg-gray-200 dark:bg-gray-900 rounded-xl flex flex-col items-center justify-center border border-gray-300 dark:border-gray-800">
            <i className="fa-solid fa-circle-notch fa-spin text-red-600 text-4xl mb-4"></i>
            <span className="text-gray-500 text-sm mt-2">Mempersiapkan jalur streaming...</span>
          </div>
        )}

        {!isLoading && streamUrl && !useEmbed && (
          <div className="w-full shadow-2xl rounded-xl overflow-hidden bg-black border border-gray-300 dark:border-gray-800 relative group">
            <div className="absolute top-4 right-6 z-10 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-xl">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>
                <span className="font-bold text-white tracking-widest text-sm drop-shadow-lg">DRAMA GUE</span>
              </div>
            </div>
            <div className="aspect-video w-full relative">
              <video ref={videoRef} controls style={{ width: '100%', height: '100%' }}>
                <source src={streamUrl} type="video/mp4" />
              </video>
            </div>
          </div>
        )}

        {!isLoading && useEmbed && embedUrl && (
          <div className="w-full shadow-2xl rounded-xl overflow-hidden bg-black border border-gray-300 dark:border-gray-800 relative group">
            <div className="absolute top-4 right-6 z-10 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-xl">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>
                <span className="font-bold text-white tracking-widest text-sm drop-shadow-lg">DRAMA GUE</span>
              </div>
            </div>
            <div className="aspect-video w-full relative">
              <iframe src={embedUrl} className="absolute inset-0 w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
          </div>
        )}

        {!isLoading && videoData && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight flex-1">{videoData.judul}</h1>
              
              <button onClick={() => handleDownload(videoData.url)} className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-colors w-full sm:w-auto">
                <i className="fa-solid fa-download"></i>
                <span>Download MP4</span>
              </button>
            </div>
          </div>
        )}

        {!isLoading && relatedVideos.length > 0 && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Video Terkait</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentRelatedVideos.map(video => (
                <div key={video.id} onClick={() => handleActionPlay(video.id)} className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100 dark:border-gray-800 cursor-pointer">
                  <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img src={getYoutubeThumbnail(video.url)} alt={video.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <i className="fa-solid fa-play text-white ml-1 text-lg"></i>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white leading-tight line-clamp-2">{video.judul}</h4>
                  </div>
                </div>
              ))}
            </div>

            {totalRelatedPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button 
                  onClick={() => setRelatedPage(prev => Math.max(1, prev - 1))} 
                  disabled={relatedPage === 1} 
                  className="px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <i className="fa-solid fa-chevron-left mr-1"></i> Prev
                </button>
                <span className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
                  {relatedPage} / {totalRelatedPages}
                </span>
                <button 
                  onClick={() => setRelatedPage(prev => Math.min(totalRelatedPages, prev + 1))} 
                  disabled={relatedPage === totalRelatedPages} 
                  className="px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Next <i className="fa-solid fa-chevron-right ml-1"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !videoData && !streamUrl && !useEmbed && (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-triangle-exclamation text-4xl mb-4 text-gray-400 dark:text-gray-600"></i>
            <h2 className="text-xl font-medium">Video tidak ditemukan.</h2>
          </div>
        )}
      </div>

      <div className="w-full lg:w-1/4 hidden lg:block">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2">Up Next</h3>
        <div className="flex flex-col gap-4 max-h-[1400px] overflow-y-auto pr-2 custom-scrollbar">
          {recommendations.map(rec => (
            <div key={rec.id} onClick={() => handleActionPlay(rec.id)} className="flex gap-3 group cursor-pointer">
              <div className="w-40 flex-shrink-0 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <img src={getSliderThumbnail(rec.url)} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white">Video</div>
              </div>
              <div className="flex flex-col py-1">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-white transition-colors">{rec.judul}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}