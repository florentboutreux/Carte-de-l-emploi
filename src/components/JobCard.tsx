import React from 'react';
import { JobOffer } from '../types';
import { ExternalLink, MapPin, Building2, Heart, Car, Clock, TrainFront } from 'lucide-react';
import { motion } from 'motion/react';

interface JobCardProps {
  job: JobOffer;
  isSelected: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onViewDetails: (job: JobOffer) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, isSelected, isFavorite, onClick, onViewDetails, onToggleFavorite }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => {
        onClick();
        onViewDetails(job);
      }}
      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
        isSelected 
          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
          : 'border-black/5 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-gray-900 leading-tight flex-1">{job.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-lg transition-all ${
              isFavorite 
                ? 'text-rose-500 bg-rose-50' 
                : 'text-gray-300 hover:text-rose-500 hover:bg-rose-50'
            }`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
      
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Building2 size={14} className="text-gray-400" />
          <span>{job.company}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin size={14} className="text-gray-400" />
          <span>{job.location}</span>
        </div>
        
        {(job.travelDistance || job.travelTime || job.transitTime) && (
          <div className="flex flex-col gap-2 mt-2">
            {(job.travelDistance || job.travelTime) && (
              <div className="flex items-center gap-3 p-2 bg-blue-50/50 rounded-lg border border-blue-100/50">
                {job.travelDistance && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700">
                    <Car size={12} />
                    <span>{job.travelDistance}</span>
                  </div>
                )}
                {job.travelTime && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700">
                    <Clock size={12} />
                    <span>{job.travelTime}</span>
                  </div>
                )}
              </div>
            )}
            
            {(job.transitTime || job.transitSummary) && (
              <div className="flex items-center gap-3 p-2 bg-purple-50/50 rounded-lg border border-purple-100/50">
                {job.transitTime && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                    <TrainFront size={12} />
                    <span>{job.transitTime}</span>
                  </div>
                )}
                {job.transitSummary && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-purple-600 truncate">
                    <span className="truncate">{job.transitSummary}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {job.contractType && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {job.contractType}
          </span>
        )}
        {job.experienceLevel && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
            {job.experienceLevel}
          </span>
        )}
        {job.salary && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">
            {job.salary}
          </span>
        )}
      </div>
      
      <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
        {job.description}
      </p>
    </motion.div>
  );
};
