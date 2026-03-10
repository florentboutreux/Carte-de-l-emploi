import React from 'react';
import { JobOffer } from '../types';
import { X, Building2, MapPin, ExternalLink, Star, Briefcase, Clock, Car, Globe, Info, TrainFront } from 'lucide-react';
import { motion } from 'motion/react';

interface JobDetailsModalProps {
  job: JobOffer;
  onClose: () => void;
}

export const JobDetailsModalContent: React.FC<{ job: JobOffer }> = ({ job }) => {
  return (
    <div className="space-y-8 p-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contrat</p>
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
            <Briefcase size={14} className="text-emerald-500" />
            {job.contractType || 'N/A'}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Expérience</p>
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
            <Star size={14} className="text-blue-500" />
            {job.experienceLevel || 'N/A'}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Salaire</p>
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
            <Star size={14} className="text-amber-500" />
            {job.salary || 'N/A'}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Note</p>
          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <Star size={14} fill="currentColor" />
            {job.rating || '4.5'}/5
          </div>
        </div>
      </div>

      {/* Travel Info */}
      {(job.travelDistance || job.travelTime || job.transitTime) && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Car size={16} className="text-blue-600" />
            Options de trajet
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Car Route */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-around">
              <div className="flex flex-col items-center">
                <Car className="text-blue-600 mb-1" size={20} />
                <span className="text-xs font-bold text-blue-900">{job.travelDistance || 'N/A'}</span>
                <span className="text-[10px] text-blue-600 uppercase font-bold">Distance</span>
              </div>
              <div className="w-px h-8 bg-blue-200" />
              <div className="flex flex-col items-center">
                <Clock className="text-blue-600 mb-1" size={20} />
                <span className="text-xs font-bold text-blue-900">{job.travelTime || 'N/A'}</span>
                <span className="text-[10px] text-blue-600 uppercase font-bold">Temps (Voiture)</span>
              </div>
            </div>

            {/* Transit Route */}
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-around">
              <div className="flex flex-col items-center">
                <TrainFront className="text-purple-600 mb-1" size={20} />
                <span className="text-xs font-bold text-purple-900">{job.transitTime || 'N/A'}</span>
                <span className="text-[10px] text-purple-600 uppercase font-bold">Temps (Transport)</span>
              </div>
              <div className="w-px h-8 bg-purple-200" />
              <div className="flex flex-col items-center text-center px-2">
                <span className="text-[10px] font-bold text-purple-900 leading-tight">
                  {job.transitSummary || 'Aucun trajet direct trouvé'}
                </span>
                <span className="text-[10px] text-purple-600 uppercase font-bold mt-1">Résumé</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Info size={16} className="text-emerald-600" />
          Description du poste
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {job.description}
        </p>
      </section>

      {/* Company Info */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Building2 size={16} className="text-emerald-600" />
          À propos de l'entreprise
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {job.companyDescription || `${job.company} est une entreprise dynamique située à ${job.location}, spécialisée dans le secteur ${job.industry || 'de l\'innovation'}.`}
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={16} className="text-gray-400" />
            {job.location}
          </div>
          {job.website && (
            <a href={job.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-600 hover:underline">
              <Globe size={16} />
              Site web
            </a>
          )}
        </div>
      </section>

      {/* Action Button */}
      <div className="pt-4">
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          Postuler maintenant
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
};

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative h-32 bg-emerald-600 p-6 flex items-end shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg">
              <Building2 size={32} />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold leading-tight">{job.title}</h2>
              <p className="opacity-90 font-medium">{job.company}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <JobDetailsModalContent job={job} />
        </div>
      </motion.div>
    </div>
  );
};
