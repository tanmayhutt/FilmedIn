import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSavedMediaData, addToList, removeFromList } from '@/services/playlist.service';
import { CreatePlaylistModal } from '@/components/features/CreatePlaylistModal';

export interface OpenCreateModalOptions {
  mediaToAdd?: {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
  };
  onCreated?: () => void;
}

interface SavedMediaContextType {
  savedIds: Set<number>;
  itemMap: Record<number, string[]>;
  userPlaylists: { id: string; name: string }[];
  isSaved: (tmdbId: number) => boolean;
  isItemInPlaylist: (tmdbId: number, playlistId: string) => boolean;
  refreshSaved: () => Promise<void>;
  togglePlaylist: (tmdbId: number, mediaType: 'movie' | 'tv', playlistId: string) => Promise<boolean>;
  openCreateModal: (options?: OpenCreateModalOptions) => void;
  closeCreateModal: () => void;
}

const SavedMediaContext = createContext<SavedMediaContextType>({
  savedIds: new Set(),
  itemMap: {},
  userPlaylists: [],
  isSaved: () => false,
  isItemInPlaylist: () => false,
  refreshSaved: async () => {},
  togglePlaylist: async () => false,
  openCreateModal: () => {},
  closeCreateModal: () => {},
});

export const SavedMediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [itemMap, setItemMap] = useState<Record<number, string[]>>({});
  const [userPlaylists, setUserPlaylists] = useState<{ id: string; name: string }[]>([]);

  // Global Create Playlist Modal state
  const [createModalState, setCreateModalState] = useState<{
    isOpen: boolean;
    mediaToAdd?: { tmdbId: number; mediaType: 'movie' | 'tv'; title: string };
    onCreated?: () => void;
  }>({ isOpen: false });

  const refreshSaved = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setSavedIds(new Set());
      setItemMap({});
      setUserPlaylists([]);
      return;
    }
    try {
      const data = await getSavedMediaData();
      if (data && data.savedIds) {
        setSavedIds(new Set(data.savedIds));
        setItemMap(data.itemMap || {});
        setUserPlaylists(data.playlists || []);
      }
    } catch (err) {
      console.error('Failed to load saved media data', err);
    }
  }, []);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const isSaved = (tmdbId: number): boolean => {
    if (!savedIds || !tmdbId) return false;
    return savedIds.has(Number(tmdbId));
  };

  const isItemInPlaylist = (tmdbId: number, playlistId: string): boolean => {
    if (!itemMap || !tmdbId || !playlistId) return false;
    const numId = Number(tmdbId);
    return !!itemMap[numId]?.includes(playlistId) || !!itemMap[tmdbId]?.includes(playlistId);
  };

  const togglePlaylist = async (tmdbId: number, mediaType: 'movie' | 'tv', playlistId: string): Promise<boolean> => {
    const inPlaylist = isItemInPlaylist(tmdbId, playlistId);
    let res;
    if (inPlaylist) {
      res = await removeFromList(playlistId, tmdbId);
    } else {
      res = await addToList(playlistId, tmdbId, mediaType);
    }
    await refreshSaved();
    return !res.error;
  };

  const openCreateModal = (options?: OpenCreateModalOptions) => {
    setCreateModalState({
      isOpen: true,
      mediaToAdd: options?.mediaToAdd,
      onCreated: options?.onCreated,
    });
  };

  const closeCreateModal = () => {
    setCreateModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <SavedMediaContext.Provider
      value={{
        savedIds,
        itemMap,
        userPlaylists,
        isSaved,
        isItemInPlaylist,
        refreshSaved,
        togglePlaylist,
        openCreateModal,
        closeCreateModal,
      }}
    >
      {children}

      {/* Global Single Instance Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={createModalState.isOpen}
        onClose={closeCreateModal}
        mediaToAdd={createModalState.mediaToAdd}
        onCreated={createModalState.onCreated}
      />
    </SavedMediaContext.Provider>
  );
};

export const useSavedMedia = () => useContext(SavedMediaContext);
