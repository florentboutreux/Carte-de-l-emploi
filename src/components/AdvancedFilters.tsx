import React from 'react';
import { SearchFilters } from '../types';
import { Briefcase, Clock, Euro, Building } from 'lucide-react';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ filters, onChange }) => {
  const contractTypes = ['CDI', 'CDD', 'Freelance', 'Intérim', 'Stage'];
  const experienceLevels = ['Junior', 'Intermédiaire', 'Senior', 'Expert'];
  const industries = ['Tech', 'Santé', 'Finance', 'Commerce', 'Éducation', 'Industrie'];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 space-y-6">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        <Briefcase size={16} className="text-emerald-600" />
        Filtres Avancés
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contract Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
            <Clock size={12} /> Type de contrat
          </label>
          <select
            value={filters.contractType}
            onChange={(e) => handleFilterChange('contractType', e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-200 transition-all outline-none text-sm"
          >
            <option value="">Tous les contrats</option>
            {contractTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
            <Briefcase size={12} /> Expérience
          </label>
          <select
            value={filters.experienceLevel}
            onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-200 transition-all outline-none text-sm"
          >
            <option value="">Tous les niveaux</option>
            {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Salary Range */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
            <Euro size={12} /> Salaire annuel (k€)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.salaryRange[0]}
              onChange={(e) => handleFilterChange('salaryRange', [parseInt(e.target.value) || 0, filters.salaryRange[1]])}
              className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-200 transition-all outline-none text-sm"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.salaryRange[1]}
              onChange={(e) => handleFilterChange('salaryRange', [filters.salaryRange[0], parseInt(e.target.value) || 1000])}
              className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-200 transition-all outline-none text-sm"
            />
          </div>
        </div>

        {/* Industry */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
            <Building size={12} /> Secteur
          </label>
          <select
            value={filters.industry}
            onChange={(e) => handleFilterChange('industry', e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-200 transition-all outline-none text-sm"
          >
            <option value="">Tous les secteurs</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};
