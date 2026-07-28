const Playlist = require('../models/Playlist');
const PlaylistItem = require('../models/PlaylistItem');
const User = require('../models/User');

const NodeCache = require('node-cache');
const posterCache = new NodeCache({ stdTTL: 86400 });

const mediaDetailsCache = new NodeCache({ stdTTL: 86400 });

async function getMediaDetails(tmdbId, mediaType) {
  const cacheKey = `${mediaType}_${tmdbId}_details_v2`;
  let details = mediaDetailsCache.get(cacheKey);
  if (details) return details;
  
  try {
    const url = `https://api.tmdb.org/3/${mediaType}/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    details = {
      id: data.id,
      title: data.title || data.name,
      name: data.name || data.title,
      poster_path: data.poster_path,
      release_date: data.release_date || data.first_air_date,
      first_air_date: data.first_air_date || data.release_date,
      vote_average: data.vote_average ?? 0,
      vote_count: data.vote_count ?? 0,
      overview: data.overview || '',
      mediaType: mediaType
    };
    mediaDetailsCache.set(cacheKey, details);
    return details;
  } catch (e) {
    return null;
  }
}

async function getPosterPath(tmdbId, mediaType) {
  const details = await getMediaDetails(tmdbId, mediaType);
  return details ? details.poster_path : null;
}

exports.getPlaylists = async (req, res) => {
  try {
    const requiredPresets = ['Watchlist', 'Currently Watching', 'Watched', 'Liked'];
    for (const preset of requiredPresets) {
      const exists = await Playlist.findOne({ userId: req.user.id, name: preset });
      if (!exists) {
        await Playlist.create({ userId: req.user.id, name: preset, type: 'system' });
      }
    }

    const playlists = await Playlist.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    for (let pl of playlists) {
      const items = await PlaylistItem.find({ playlistId: pl._id }).sort({ createdAt: -1 });
      pl.playlist_items = [{ count: items.length }];
      pl.id = pl._id.toString();
      
      const previewItems = items.slice(0, 3);
      const posters = [];
      for (const item of previewItems) {
         const path = await getPosterPath(item.tmdbId, item.mediaType);
         if (path) posters.push(`https://image.tmdb.org/t/p/w500${path}`);
      }
      pl.preview_posters = posters;
    }
    res.json(playlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublicPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean();
    for (let pl of playlists) {
      const items = await PlaylistItem.find({ playlistId: pl._id }).sort({ createdAt: -1 });
      pl.playlist_items = [{ count: items.length }];
      pl.id = pl._id.toString();
      
      const previewItems = items.slice(0, 3);
      const posters = [];
      for (const item of previewItems) {
         const path = await getPosterPath(item.tmdbId, item.mediaType);
         if (path) posters.push(`https://image.tmdb.org/t/p/w500${path}`);
      }
      pl.preview_posters = posters;
    }
    res.json(playlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newPlaylist = new Playlist({ userId: req.user.id, name, description: description || '', type: 'custom' });
    await newPlaylist.save();
    
    const plObj = newPlaylist.toObject();
    plObj.id = plObj._id.toString();
    plObj.playlist_items = [{ count: 0 }];

    res.status(201).json(plObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

    await PlaylistItem.deleteMany({ playlistId: req.params.id });
    await playlist.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { playlistId, tmdbId, mediaType } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

    const newItem = new PlaylistItem({ playlistId, tmdbId, mediaType });
    await newItem.save();
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Item already exists in playlist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await PlaylistItem.find({ playlistId: req.params.id }).sort({ createdAt: -1 });
    const formatted = items.map(i => ({ ...i.toObject(), id: i._id.toString(), tmdb_id: i.tmdbId, media_type: i.mediaType }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { playlistId, tmdbId } = req.params;
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

    await PlaylistItem.deleteOne({ playlistId, tmdbId });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    
    const formatted = playlist.toObject();
    formatted.id = formatted._id.toString();
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSavedIds = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id }).select('_id name');
    const playlistIds = playlists.map(p => p._id);
    const items = await PlaylistItem.find({ playlistId: { $in: playlistIds } });
    
    const savedIds = Array.from(new Set(items.map(i => i.tmdbId)));
    const itemMap = {};
    items.forEach(i => {
      if (!itemMap[i.tmdbId]) itemMap[i.tmdbId] = [];
      itemMap[i.tmdbId].push(i.playlistId.toString());
    });

    res.json({
      savedIds,
      itemMap,
      playlists: playlists.map(p => ({ id: p._id.toString(), name: p.name }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTasteBlend = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('_id username avatarUrl');
    const targetUser = await User.findOne({ username: req.params.username.toLowerCase() }).select('_id username avatarUrl');

    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Fetch playlists for both users
    const u1Playlists = await Playlist.find({ userId: currentUser._id }).lean();
    const u2Playlists = await Playlist.find({ userId: targetUser._id }).lean();

    const u1PlIds = u1Playlists.map(p => p._id);
    const u2PlIds = u2Playlists.map(p => p._id);

    const u1AllItems = await PlaylistItem.find({ playlistId: { $in: u1PlIds } }).lean();
    const u2AllItems = await PlaylistItem.find({ playlistId: { $in: u2PlIds } }).lean();

    // Map playlist ID to playlist object
    const u1PlMap = new Map(u1Playlists.map(p => [p._id.toString(), p]));
    const u2PlMap = new Map(u2Playlists.map(p => [p._id.toString(), p]));

    // Categorize items by preset type (Watchlist, Currently Watching, Watched) vs Custom
    const getPresetCategory = (plName) => {
      const lower = (plName || '').toLowerCase().trim();
      if (lower.includes('watchlist')) return 'watchlist';
      if (lower.includes('currently watching') || lower.includes('watching')) return 'currentlyWatching';
      if (lower.includes('watched') || lower.includes('history')) return 'watched';
      return 'custom';
    };

    // Helper to group items by preset category for a user
    const categorizeUserItems = (items, plMap) => {
      const cat = { watchlist: new Set(), currentlyWatching: new Set(), watched: new Set(), custom: new Set() };
      const itemObjs = new Map();

      items.forEach(item => {
        itemObjs.set(item.tmdbId, item);
        const pl = plMap.get(item.playlistId.toString());
        const category = pl ? getPresetCategory(pl.name) : 'custom';
        if (cat[category]) {
          cat[category].add(item.tmdbId);
        }
      });
      return { cat, itemObjs };
    };

    const { cat: u1Cat, itemObjs: u1ItemObjs } = categorizeUserItems(u1AllItems, u1PlMap);
    const { cat: u2Cat } = categorizeUserItems(u2AllItems, u2PlMap);

    // Helper to compute breakdown for a category
    const computeCategoryBreakdown = async (set1, set2) => {
      const mutualIds = Array.from(set1).filter(id => set2.has(id));
      const mutualItems = [];
      for (const tmdbId of mutualIds.slice(0, 6)) {
        const item = u1ItemObjs.get(tmdbId);
        if (item) {
          const posterPath = await getPosterPath(tmdbId, item.mediaType);
          mutualItems.push({
            tmdbId,
            mediaType: item.mediaType,
            posterPath: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null
          });
        }
      }
      return {
        u1Count: set1.size,
        u2Count: set2.size,
        mutualCount: mutualIds.length,
        mutualItems
      };
    };

    const watchlistBreakdown = await computeCategoryBreakdown(u1Cat.watchlist, u2Cat.watchlist);
    const currentlyWatchingBreakdown = await computeCategoryBreakdown(u1Cat.currentlyWatching, u2Cat.currentlyWatching);
    const watchedBreakdown = await computeCategoryBreakdown(u1Cat.watched, u2Cat.watched);
    const customBreakdown = await computeCategoryBreakdown(u1Cat.custom, u2Cat.custom);

    // Count custom playlists
    const u1CustomCount = u1Playlists.filter(p => p.type === 'custom').length;
    const u2CustomCount = u2Playlists.filter(p => p.type === 'custom').length;

    // Compute specific list arrays with full TMDB details
    // 1. To Watch Together: Items in Watchlist/Watching for both users
    const pendingU1 = new Set([...u1Cat.watchlist, ...u1Cat.currentlyWatching]);
    const pendingU2 = new Set([...u2Cat.watchlist, ...u2Cat.currentlyWatching]);
    const toWatchIds = Array.from(pendingU1).filter(id => pendingU2.has(id));

    const toWatchTogether = [];
    for (const tmdbId of toWatchIds.slice(0, 12)) {
      const item = u1ItemObjs.get(tmdbId);
      if (item) {
        const details = await getMediaDetails(tmdbId, item.mediaType);
        if (details) toWatchTogether.push(details);
      }
    }

    // 2. Both Completed: Items in Watched for both users
    const completedIds = Array.from(u1Cat.watched).filter(id => u2Cat.watched.has(id));
    const bothCompleted = [];
    for (const tmdbId of completedIds.slice(0, 12)) {
      const item = u1ItemObjs.get(tmdbId);
      if (item) {
        const details = await getMediaDetails(tmdbId, item.mediaType);
        if (details) bothCompleted.push(details);
      }
    }

    // Overall mutual IDs
    const allU1Ids = new Set(u1AllItems.map(i => i.tmdbId));
    const allU2Ids = new Set(u2AllItems.map(i => i.tmdbId));
    const allMutualIds = Array.from(allU1Ids).filter(id => allU2Ids.has(id));

    // 3. Recommendations: Unique titles from U2 with full details
    const user2UniqueItems = u2AllItems.filter(i => !allU1Ids.has(i.tmdbId));
    const user2UniqueMap = new Map();
    user2UniqueItems.forEach(i => user2UniqueMap.set(i.tmdbId, i));

    const recommendations = [];
    for (const item of Array.from(user2UniqueMap.values()).slice(0, 12)) {
      const details = await getMediaDetails(item.tmdbId, item.mediaType);
      if (details) recommendations.push(details);
    }

    // Match percentage calculation based on preset & custom overlap
    const totalUnique = new Set([...allU1Ids, ...allU2Ids]).size;
    let matchPercentage = 50;
    let synergyTier = 'Fresh Perspectives';

    if (totalUnique > 0) {
      const jaccard = (allMutualIds.length / totalUnique) * 100;
      matchPercentage = Math.min(99, Math.round(55 + (jaccard * 0.85) + (allMutualIds.length * 3.5)));
    } else {
      matchPercentage = 72; // default friendly initial blend score
    }

    if (matchPercentage >= 85) synergyTier = 'High Compatibility';
    else if (matchPercentage >= 70) synergyTier = 'Strong Overlap';
    else if (matchPercentage >= 58) synergyTier = 'Moderate Alignment';
    else synergyTier = 'Distinct Preferences';

    res.json({
      currentUser: { id: currentUser._id, username: currentUser.username, avatarUrl: currentUser.avatarUrl },
      targetUser: { id: targetUser._id, username: targetUser.username, avatarUrl: targetUser.avatarUrl },
      matchPercentage,
      synergyTier,
      presetBreakdown: {
        watchlist: watchlistBreakdown,
        currentlyWatching: currentlyWatchingBreakdown,
        watched: watchedBreakdown,
      },
      customBreakdown: {
        u1CustomCount,
        u2CustomCount,
        ...customBreakdown
      },
      toWatchTogether,
      bothCompleted,
      recommendations,
      totalSharedCount: allMutualIds.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
