/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { JobMap } from './components/JobMap';
import { JobCard } from './components/JobCard';
import { AdvancedFilters } from './components/AdvancedFilters';
import { AlertsManager } from './components/AlertsManager';
import { JobDetailsModal, JobDetailsModalContent } from './components/JobDetailsModal';
import { JobOffer, SearchParams, SearchFilters } from './types';
import { searchJobs, geocodeLocation, getMockJobs } from './services/geminiService';
import { Briefcase, Map as MapIcon, List, AlertCircle, Heart, Bell, Settings2, X, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [params, setParams] = useState<SearchParams>({
    query: '',
    location: 'Paris',
    userAddress: '',
    radius: 20,
    lat: 48.8566,
    lng: 2.3522,
    filters: {
      contractType: '',
      experienceLevel: '',
      salaryRange: [0, 200],
      industry: ''
    }
  });
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [favorites, setFavorites] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list' | 'favorites'>('split');
  const [showFilters, setShowFilters] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [viewedJob, setViewedJob] = useState<JobOffer | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // Geocode user address when it changes
  useEffect(() => {
    const geocode = async () => {
      if (params.userAddress && params.userAddress.length > 5) {
        const coords = await geocodeLocation(params.userAddress);
        if (coords) {
          setUserCoords([coords.lat, coords.lng]);
        }
      } else {
        setUserCoords(null);
      }
    };
    const timer = setTimeout(geocode, 1000);
    return () => clearTimeout(timer);
  }, [params.userAddress]);

  // Get user location and initial data
  useEffect(() => {
    fetchFavorites();
    // Load saved address from localStorage if exists
    const savedAddress = localStorage.getItem('user_home_address');
    if (savedAddress) {
      setParams(prev => ({ ...prev, userAddress: savedAddress }));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setParams(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            location: 'Ma position'
          }));
        },
        (err) => console.warn("Geolocation error:", err)
      );
    }
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (!res.ok) throw new Error('API not available');
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      console.warn("API not available, using localStorage for favorites");
      const localFavs = localStorage.getItem('jobmap_favorites');
      if (localFavs) {
        try {
          setFavorites(JSON.parse(localFavs));
        } catch (e) {
          console.error("Failed to parse local favorites", e);
        }
      }
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, job: JobOffer) => {
    e.stopPropagation();
    const isFav = favorites.some(f => f.id === job.id);
    
    // Optimistic update for UI
    const newFavorites = isFav 
      ? favorites.filter(f => f.id !== job.id)
      : [...favorites, job];
      
    setFavorites(newFavorites);
    localStorage.setItem('jobmap_favorites', JSON.stringify(newFavorites));

    try {
      if (isFav) {
        await fetch(`/api/favorites/${job.id}`, { method: 'DELETE' });
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(job),
        });
      }
    } catch (err) {
      // Ignore API errors since we already updated localStorage
      console.warn("API not available, favorite saved locally");
    }
  };

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedJobId(null);
    if (viewMode === 'favorites') setViewMode('split');

    // Save address to localStorage
    if (params.userAddress) {
      localStorage.setItem('user_home_address', params.userAddress);
    }

    if (isMockMode) {
      setTimeout(() => {
        setJobs(getMockJobs(params));
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      let currentLat = params.lat;
      let currentLng = params.lng;

      if (params.location !== 'Ma position' && params.location.trim() !== '') {
        const coords = await geocodeLocation(params.location);
        if (coords) {
          currentLat = coords.lat;
          currentLng = coords.lng;
          setParams(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
        }
      }

      const results = await searchJobs({
        ...params,
        lat: currentLat,
        lng: currentLng
      });
      
      setJobs(results);
      if (results.length === 0) {
        setError("Aucune offre trouvée pour cette recherche.");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la recherche.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [params, viewMode]);

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setParams(prev => ({ ...prev, lat, lng, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
  };

  const displayedJobs = viewMode === 'favorites' ? favorites : jobs;
  const selectedJob = displayedJobs.find(j => j.id === selectedJobId);
  const mapCenter: [number, number] = selectedJob 
    ? [selectedJob.lat, selectedJob.lng] 
    : [params.lat || 48.8566, params.lng || 2.3522];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
            setViewMode('split');
            setViewedJob(null);
            setSelectedJobId(null);
          }}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Briefcase size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">JobMap Explorer</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMockMode(!isMockMode)}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${
                isMockMode 
                  ? 'bg-amber-100 text-amber-600 border border-amber-200' 
                  : 'bg-gray-100 text-gray-400 border border-transparent hover:bg-gray-200'
              }`}
              title="Mode Test (Offres fictives)"
            >
              <FlaskConical size={18} />
              <span className="hidden lg:block">Mode Test</span>
            </button>

            <button 
              onClick={() => setViewMode(viewMode === 'favorites' ? 'split' : 'favorites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'favorites' 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
              }`}
            >
              <Heart size={18} fill={viewMode === 'favorites' ? 'currentColor' : 'none'} />
              <span className="hidden md:block">Favoris ({favorites.length})</span>
            </button>
            
            <button 
              onClick={() => setShowAlerts(true)}
              className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              <Bell size={20} />
            </button>

            {/* Mobile View Toggles */}
            <div className="flex sm:hidden bg-gray-100 p-1 rounded-lg ml-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
              >
                <MapIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* Left Column: Search & List */}
          <div className={`lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden ${viewMode === 'map' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="space-y-4 shrink-0">
              <SearchBar 
                query={params.query}
                location={params.location}
                userAddress={params.userAddress || ''}
                radius={params.radius}
                onQueryChange={(q) => setParams(p => ({ ...p, query: q }))}
                onLocationChange={(l) => setParams(p => ({ ...p, location: l }))}
                onUserAddressChange={(a) => setParams(p => ({ ...p, userAddress: a }))}
                onRadiusChange={(r) => setParams(p => ({ ...p, radius: r }))}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  showFilters ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white border border-black/5 text-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings2 size={18} />
                  Filtres avancés
                </div>
                {showFilters ? <X size={16} /> : <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <AdvancedFilters 
                      filters={params.filters!} 
                      onChange={(f) => setParams(p => ({ ...p, filters: f }))} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 min-h-0">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {viewMode === 'favorites' ? 'Mes Favoris' : 'Résultats'}
                </h2>
                {viewMode === 'favorites' && (
                  <button onClick={() => setViewMode('split')} className="text-xs text-emerald-600 font-bold hover:underline">
                    Retour à la recherche
                  </button>
                )}
              </div>

              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-800"
                  >
                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                {displayedJobs.length > 0 ? (
                  displayedJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      isSelected={selectedJobId === job.id}
                      isFavorite={favorites.some(f => f.id === job.id)}
                      onToggleFavorite={(e) => toggleFavorite(e, job)}
                      onViewDetails={(job) => {
                        setViewedJob(job);
                        setSelectedJobId(job.id);
                      }}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        if (window.innerWidth < 1024) setViewMode('map');
                      }}
                    />
                  ))
                ) : !isLoading && !error && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                    {viewMode === 'favorites' ? (
                      <>
                        <Heart size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Vous n'avez pas encore de favoris. Cliquez sur le coeur pour en ajouter.</p>
                      </>
                    ) : (
                      <>
                        <Briefcase size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Commencez par rechercher un poste pour voir les offres sur la carte.</p>
                      </>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Map & Details Panel */}
          <div className={`lg:col-span-8 h-full relative ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
            <JobMap 
              jobs={displayedJobs}
              center={mapCenter}
              userCoords={userCoords}
              onLocationSelect={handleMapLocationSelect}
              onJobSelect={(job) => {
                setViewedJob(job);
                setSelectedJobId(job.id);
              }}
              selectedJobId={selectedJobId}
            />

            {/* Side Panel for Details */}
            <AnimatePresence>
              {viewedJob && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute inset-y-0 right-0 w-full sm:w-[400px] z-[1001] bg-white shadow-2xl border-l border-black/5 flex flex-col"
                >
                  <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-gray-900 truncate pr-4">{viewedJob.title}</h3>
                    <button 
                      onClick={() => {
                        setViewedJob(null);
                        setSelectedJobId(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <JobDetailsModalContent job={viewedJob} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAlerts && (
          <AlertsManager 
            currentParams={params} 
            onClose={() => setShowAlerts(false)} 
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
