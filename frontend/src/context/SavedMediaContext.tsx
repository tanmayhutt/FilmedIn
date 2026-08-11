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
  savedKeys: Set<string>;
  itemMap: Record<string, string[]>;
  userPlaylists: { id: string; name: string }[];
  isSaved: (tmdbId: number, mediaType: 'movie' | 'tv') => boolean;
  isItemInPlaylist: (tmdbId: number, mediaType: 'movie' | 'tv', playlistId: string) => boolean;
  refreshSaved: () => Promise<void>;
  togglePlaylist: (tmdbId: number, mediaType: 'movie' | 'tv', playlistId: string) => Promise<boolean>;
  openCreateModal: (options?: OpenCreateModalOptions) => void;
  closeCreateModal: () => void;
}

const SavedMediaContext = createContext<SavedMediaContextType>({
  savedKeys: new Set(),
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
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [itemMap, setItemMap] = useState<Record<string, string[]>>({});
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
      setSavedKeys(new Set());
      setItemMap({});
      setUserPlaylists([]);
      return;
    }
    try {
      const data = await getSavedMediaData();
      if (data && data.savedKeys) {
        setSavedKeys(new Set(data.savedKeys));
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

  const isSaved = (tmdbId: number, mediaType: 'movie' | 'tv'): boolean => {
    if (!savedKeys || !tmdbId) return false;
    return savedKeys.has(`${mediaType}:${Number(tmdbId)}`);
  };

  const isItemInPlaylist = (tmdbId: number, mediaType: 'movie' | 'tv', playlistId: string): boolean => {
    if (!itemMap || !tmdbId || !playlistId) return false;
    return !!itemMap[`${mediaType}:${Number(tmdbId)}`]?.includes(playlistId);
  };

  const togglePlaylist = async (tmdbId: number, mediaType: 'movie' | 'tv', playlistId: string): Promise<boolean> => {
    const inPlaylist = isItemInPlaylist(tmdbId, mediaType, playlistId);
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
        savedKeys,
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
