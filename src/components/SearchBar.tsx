import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sliders, X, Home, Car, Loader2 } from 'lucide-react';
import { getAddressSuggestions } from '../services/geminiService';

interface SearchBarProps {
  query: string;
  location: string;
  userAddress: string;
  radius: number;
  onQueryChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onUserAddressChange: (val: string) => void;
  onRadiusChange: (val: number) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  location,
  userAddress,
  radius,
  onQueryChange,
  onLocationChange,
  onUserAddressChange,
  onRadiusChange,
  onSearch,
  isLoading
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (userAddress.length >= 3 && showSuggestions) {
        setIsSuggesting(true);
        const res = await getAddressSuggestions(userAddress);
        setSuggestions(res);
        setIsSuggesting(false);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [userAddress, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 space-y-5">
      <div className="flex flex-col gap-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Poste, mots-clés..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm"
          />
          {query && (
            <button 
              onClick={() => onQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="relative group">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Ville ou code postal"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm"
          />
          {location && (
            <button 
              onClick={() => onLocationChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative group" ref={suggestionRef}>
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Votre adresse (pour calcul trajet)"
            value={userAddress}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              onUserAddressChange(e.target.value);
              setShowSuggestions(true);
            }}
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm"
          />
          {isSuggesting && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-blue-500" size={16} />
            </div>
          )}
          {userAddress && (
            <button 
              onClick={() => {
                onUserAddressChange('');
                setSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-black/5 z-50 overflow-hidden">
              {isSuggesting && suggestions.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">Recherche d'adresses...</div>
              )}
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onUserAddressChange(s);
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b border-black/5 last:border-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onSearch}
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-emerald-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Recherche en cours...
            </span>
          ) : 'Rechercher des offres'}
        </button>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2 text-gray-500">
            <Sliders size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Rayon de recherche</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{radius} km</span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={radius}
          onChange={(e) => onRadiusChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>
    </div>
  );
};
