'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PlatformDistributionChart } from '@/components/analytics/PlatformDistributionChart';
import { DifficultyBarChart } from '@/components/analytics/DifficultyBarChart';
import { TagRadarChart } from '@/components/analytics/TagRadarChart';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/me');
        setData(response.data);
      } catch (err: any) {
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Analytics</h1>
          <p className="text-gray-400">Visualize your competitive programming progress.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <PlatformDistributionChart data={data?.platformData || []} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <DifficultyBarChart data={data?.difficultyData || []} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <TagRadarChart data={data?.tagData || []} />
            </motion.div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
