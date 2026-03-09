import React, { useState, useEffect } from 'react';
import { JobAlert } from '../types';
import { Bell, Trash2, Mail, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertsManagerProps {
  currentParams: any;
  onClose: () => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({ currentParams, onClose }) => {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  const handleCreateAlert = async () => {
    const newAlert: JobAlert = {
      id: Math.random().toString(36).substr(2, 9),
      query: currentParams.query,
      location: currentParams.location,
      radius: currentParams.radius,
      filters: currentParams.filters,
      emailEnabled,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
      setIsCreating(false);
      fetchAlerts();
    } catch (err) {
      console.error("Failed to create alert", err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      fetchAlerts();
    } catch (err) {
      console.error("Failed to delete alert", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bell size={20} className="text-emerald-600" />
            Mes Alertes Emploi
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            Fermer
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {isCreating ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
              <h3 className="font-bold text-emerald-900 text-sm">Créer une nouvelle alerte</h3>
              <div className="text-xs text-emerald-700 space-y-1">
                <p><strong>Mots-clés:</strong> {currentParams.query || 'Tous'}</p>
                <p><strong>Lieu:</strong> {currentParams.location}</p>
                <p><strong>Rayon:</strong> {currentParams.radius}km</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={emailEnabled} 
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-emerald-900 flex items-center gap-1">
                  <Mail size={14} /> Recevoir par email
                </span>
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={handleCreateAlert}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold"
                >
                  Confirmer
                </button>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-white text-gray-600 py-2 rounded-xl text-sm font-bold border border-gray-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus size={18} /> Créer une alerte avec ma recherche actuelle
            </button>
          )}

          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => (
              <motion.div 
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-4 bg-gray-50 rounded-2xl border border-black/5 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {alert.query || 'Toutes les offres'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {alert.location} • {alert.radius}km
                  </p>
                  {alert.emailEnabled && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <Mail size={10} /> Email activé
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {alerts.length === 0 && !isCreating && (
            <div className="text-center py-8 text-gray-400">
              <Bell size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Vous n'avez pas encore d'alertes.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
