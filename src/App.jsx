import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Link as LinkIcon, 
  Video, 
  Music, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Zap,
  Sparkles,
  ClipboardCopy
} from 'lucide-react'
import confetti from 'canvas-confetti'
import axios from 'axios'

// Custom Brand Icons as Lucide doesn't export them anymore
const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

function App() {
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [videoInfo, setVideoInfo] = useState(null)
  const [platform, setPlatform] = useState(null) // 'fb' or 'yt'

  // Detect platform based on URL
  useEffect(() => {
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      setPlatform('fb')
      setError(null)
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setPlatform('yt')
      setError(null)
    } else if (url.length > 10) {
      setPlatform(null)
      setError('Please enter a valid Facebook or YouTube link')
    } else {
      setPlatform(null)
      setError(null)
    }
  }, [url])

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
    } catch (err) {
      console.error('Failed to read clipboard')
    }
  }

  const analyzeVideo = async () => {
    if (!platform) return
    setIsAnalyzing(true)
    setError(null)
    setVideoInfo(null)

    try {
      // Calling our own Vercel API Proxy to bypass CORS
      const response = await axios.post('/api/download', {
        url: url
      })

      const data = response.data

      if (data.status === 'error') {
        throw new Error(data.text || 'Failed to parse video')
      }

      // If cobalt returns a direct stream link immediately
      if (data.status === 'stream' || data.status === 'redirect') {
        setVideoInfo({
          title: platform === 'yt' ? 'YouTube Video' : 'Facebook Video',
          duration: 'Ready to Download',
          thumbnail: platform === 'yt' 
            ? 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80' 
            : 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80',
          downloadUrl: data.url,
          formats: [
            { quality: 'Best Quality (Auto)', size: 'Dynamic', type: 'video', url: data.url },
            { quality: 'Audio Only (MP3)', size: 'Dynamic', type: 'audio', url: data.url + '&isAudioOnly=true' }
          ]
        })
      } else if (data.status === 'picker') {
        // Handle multiple video options if provided
        setVideoInfo({
          title: 'Multiple Qualities Found',
          duration: 'Select below',
          thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80',
          formats: data.picker.map(item => ({
            quality: item.type || 'Video',
            size: 'Varies',
            type: 'video',
            url: item.url
          }))
        })
      }
    } catch (err) {
      console.error('Analysis failed:', err)
      setError(err.response?.data?.text || err.message || 'Failed to parse this video. It might be private or age-restricted.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startDownload = async (format) => {
    setIsDownloading(true)
    setProgress(0)

    try {
      // For a real download, we can either use window.open or a more robust fetch-based progress if needed
      // But usually, a direct link is provided by Cobalt
      const link = document.createElement('a')
      link.href = format.url
      link.target = '_blank'
      link.download = '' // Let server decide filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Simulate progress bar for better UX while the browser handles the download
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 300)

      setTimeout(() => {
        setIsDownloading(false)
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#0ea5e9', '#6366f1']
        })
      }, 3000)
    } catch (err) {
      setError('Download initialization failed. Please try again.')
      setIsDownloading(false)
    }
  }

  return (
    <div className="animate-fade-in w-full">
      <header>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block p-5 rounded-3xl bg-indigo-50 mb-6 shadow-sm border border-indigo-100"
        >
          <Zap className="w-12 h-12 text-indigo-600" />
        </motion.div>
        <h1>CHKK Video Hub</h1>
        <p className="subtitle">High-performance Facebook & YouTube Video Downloader</p>
      </header>

      <main className="max-w-2xl mx-auto w-full">
        <div className="glass-panel">
          {/* Input Section */}
          <div className="flex flex-col gap-4">
            <div className="input-wrapper">
              <LinkIcon className="w-6 h-6 text-slate-400 ml-4" />
              <input 
                type="text" 
                placeholder="Paste Facebook or YouTube URL here..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button 
                onClick={handlePaste}
                className="btn-secondary flex items-center gap-2 hover:bg-slate-200 transition-colors mr-1"
              >
                <ClipboardCopy className="w-4 h-4" />
                Paste
              </button>
            </div>

            <button 
              disabled={!platform || isAnalyzing || isDownloading}
              onClick={analyzeVideo}
              className="btn w-full justify-center py-5 text-xl rounded-2xl"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  Analyzing Video...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Analyze Link
                </>
              )}
            </button>
          </div>

          {/* Platform Indication */}
          <div className="mt-4 flex justify-center gap-3">
            <div className={`badge ${platform === 'fb' ? 'badge-fb shadow-md' : 'opacity-30 bg-slate-100 text-slate-400'}`}>
              <FacebookIcon className="w-4 h-4" /> Facebook
            </div>
            <div className={`badge ${platform === 'yt' ? 'badge-yt shadow-md' : 'opacity-30 bg-slate-100 text-slate-400'}`}>
              <YoutubeIcon className="w-4 h-4" /> YouTube
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center gap-3 font-bold text-sm"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Info & Download Options */}
          <AnimatePresence>
            {videoInfo && !isDownloading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-10 p-6 rounded-2xl border-2 border-indigo-50 bg-white/50 text-left"
              >
                <div className="flex gap-6 items-start">
                  <img src={videoInfo.thumbnail} className="w-40 h-24 rounded-xl object-cover shadow-lg" alt="thumbnail" />
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{videoInfo.title}</h3>
                    <div className="text-slate-400 text-sm font-bold flex items-center gap-2">
                      <Loader2 className="w-3 h-3" /> Duration: {videoInfo.duration}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Available Formats</div>
                  {videoInfo.formats.map((format, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-colors group">
                      <div className="flex items-center gap-3">
                        {format.type === 'video' ? <Video className="w-5 h-5 text-indigo-600" /> : <Music className="w-5 h-5 text-rose-500" />}
                        <div>
                          <div className="font-bold text-slate-800">{format.quality}</div>
                          <div className="text-[10px] font-black text-slate-400">{format.size}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => startDownload(format)}
                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Downloading State */}
          <AnimatePresence>
            {isDownloading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-10 p-10 flex flex-col items-center"
              >
                <div className="p-6 rounded-full bg-indigo-50 text-indigo-600 mb-6 relative">
                  <Download className="w-12 h-12" />
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Downloading...</h3>
                <p className="text-slate-500 font-medium mb-6">Processing your request, please stay on this page.</p>
                
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="mt-4 text-sm font-black text-indigo-600">{progress}% Completed</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features Grid */}
        {!videoInfo && !isDownloading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Zap, label: 'Super Fast', desc: 'Optimized server-side parsing.' },
              { icon: Sparkles, label: 'HD Quality', desc: 'Download up to 4K resolution.' },
              { icon: CheckCircle2, label: 'Safe & Secure', desc: 'No malware or tracking.' }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/50 border border-white shadow-sm flex flex-col items-center">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 mb-1">{feature.label}</div>
                <div className="text-xs text-slate-500 font-medium">{feature.desc}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-20 pb-10 text-slate-400 text-sm font-medium">
        <p>&copy; 2026 CHKK Video Hub. Built with love for CHKK.</p>
        <div className="flex items-center justify-center gap-6 mt-4">
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> High Speed</span>
          <span className="flex items-center gap-1.5"><YoutubeIcon className="w-4 h-4 text-rose-500" /> YouTube Live</span>
          <span className="flex items-center gap-1.5"><FacebookIcon className="w-4 h-4 text-blue-600" /> Facebook Live</span>
        </div>
      </footer>
    </div>
  )
}

export default App
