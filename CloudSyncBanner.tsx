/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CloudUpload, RefreshCw, CheckCircle2, AlertCircle, X, FolderArchive, Loader2 } from 'lucide-react';
import {
  getLocalUploadsStats,
  syncAllLocalPhotosToCloud,
  downloadAllUploadedPhotosAsZip,
} from './cloudPhotoStorage';
import { Car } from './types';

interface CloudSyncBannerProps {
  vehicles: Car[];
  onSyncComplete?: () => void;
  onOpenManager?: () => void;
}

export default function CloudSyncBanner({ vehicles, onSyncComplete, onOpenManager }: CloudSyncBannerProps) {
  const [stats, setStats] = useState<{ carCount: number; photoCount: number }>({ carCount: 0, photoCount: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [isZipping, setIsZipping] = useState(false);
  const [zipPct, setZipPct] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [syncDoneMsg, setSyncDoneMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkStats = async () => {
      try {
        const s = await getLocalUploadsStats();
        setStats({ carCount: s.carCount, photoCount: s.photoCount });
      } catch {
        // ignore
      }
    };
    checkStats();
    const interval = setInterval(checkStats, 6000);
    return () => clearInterval(interval);
  }, []);

  if (isDismissed) return null;
  if (stats.photoCount === 0 && !syncDoneMsg) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncDoneMsg(null);
    try {
      const res = await syncAllLocalPhotosToCloud((info) => {
        setSyncProgress(`Publishing ${info.completedCars + 1}/${info.totalCars}: ${info.currentCarName}`);
      });
      setSyncDoneMsg(`All ${res.totalPhotos} photos across ${res.totalCars} vehicle(s) published live to the web!`);
      setStats({ carCount: 0, photoCount: 0 });
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      alert('Error during cloud sync: ' + (err?.message || String(err)));
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  const handleZip = async () => {
    setIsZipping(true);
    setZipPct(0);
    try {
      await downloadAllUploadedPhotosAsZip(vehicles, (pct) => setZipPct(pct));
    } catch (err: any) {
      alert(err?.message || 'Error creating ZIP backup');
    } finally {
      setIsZipping(false);
      setZipPct(0);
    }
  };

  if (syncDoneMsg) {
    return (
      <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2.5 text-xs font-mono flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncDoneMsg}</span>
        </div>
        <button
          onClick={() => setSyncDoneMsg(null)}
          className="p-1 hover:text-white text-emerald-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-neutral-900 to-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 text-xs font-mono shadow-xl relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <CloudUpload className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-white uppercase tracking-wider">
              Photos Awaiting Live Web Publishing:
            </span>{' '}
            <span>
              Found <strong className="text-white">{stats.photoCount} photos</strong> for{' '}
              <strong className="text-white">{stats.carCount} vehicles</strong> stored on this laptop.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>{syncProgress || 'Publishing to Live Web...'}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-black" />
                <span>Publish to Live Web Domain</span>
              </>
            )}
          </button>

          <button
            onClick={handleZip}
            disabled={isZipping}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] transition-colors"
            title="Download ZIP backup of all uploaded photos"
          >
            {isZipping ? (
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            ) : (
              <FolderArchive className="w-3 h-3 text-amber-400" />
            )}
            <span>ZIP Backup</span>
          </button>

          {onOpenManager && (
            <button
              onClick={onOpenManager}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] transition-colors"
            >
              Manage
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:text-white text-neutral-400 ml-1"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
