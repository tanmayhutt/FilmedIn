const Playlist = require('../models/Playlist');
const PlaylistItem = require('../models/PlaylistItem');
const User = require('../models/User');

const NodeCache = require('node-cache');
const mediaDetailsCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600, maxKeys: 1000 });
const mediaDetailsRequests = new Map();
const MAX_CUSTOM_PLAYLISTS = 50;
const MAX_ITEMS_PER_PLAYLIST = 500;
const STATUS_PLAYLISTS = ['Watchlist', 'Currently Watching', 'Watched'];

async function getMediaDetails(tmdbId, mediaType) {
  const cacheKey = `${mediaType}_${tmdbId}_details_v2`;
  const details = mediaDetailsCache.get(cacheKey);
  if (details) return details;
  if (mediaDetailsRequests.has(cacheKey)) return mediaDetailsRequests.get(cacheKey);
  
  const request = (async () => {
    try {
      const url = `https://api.tmdb.org/3/${mediaType}/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return null;
      const data = await res.json();
      const response = {
        id: data.id,
        title: data.title || data.name,
        name: data.name || data.title,
        poster_path: data.poster_path,
        release_date: data.release_date || data.first_air_date,
        first_air_date: data.first_air_date || data.release_date,
        vote_average: data.vote_average ?? 0,
        vote_count: data.vote_count ?? 0,
        overview: data.overview || '',
        mediaType
      };
      try {
        mediaDetailsCache.set(cacheKey, response);
      } catch (error) {
        if (error?.errorcode === 'ECACHEFULL') {
          mediaDetailsCache.flushAll();
          mediaDetailsCache.set(cacheKey, response);
        }
      }
      return response;
    } catch {
      return null;
    } finally {
      mediaDetailsRequests.delete(cacheKey);
    }
  })();

  mediaDetailsRequests.set(cacheKey, request);
  return request;
}

async function getPosterPath(tmdbId, mediaType) {
  const details = await getMediaDetails(tmdbId, mediaType);
  return details ? details.poster_path : null;
}

async function enrichPlaylists(playlists) {
  if (playlists.length === 0) return playlists;
  const playlistIds = playlists.map(playlist => playlist._id);
  const summaries = await PlaylistItem.aggregate([
    { $match: { playlistId: { $in: playlistIds } } },
    { $sort: { createdAt: -1 } },
    { $group: {
      _id: '$playlistId',
      count: { $sum: 1 },
      previewItems: { $push: { tmdbId: '$tmdbId', mediaType: '$mediaType' } },
    } },
    { $project: { count: 1, previewItems: { $slice: ['$previewItems', 3] } } },
  ]);
  const summariesByPlaylist = new Map(summaries.map(summary => [summary._id.toString(), summary]));

  return Promise.all(playlists.map(async playlist => {
    const summary = summariesByPlaylist.get(playlist._id.toString());
    const previewItems = summary?.previewItems || [];
    const posterPaths = await Promise.all(previewItems.map(item => getPosterPath(item.tmdbId, item.mediaType)));
    return {
      ...playlist,
      id: playlist._id.toString(),
      playlist_items: [{ count: summary?.count || 0 }],
      preview_posters: posterPaths.filter(Boolean).map(path => `https://image.tmdb.org/t/p/w500${path}`)
    };
  }));
}

exports.getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(MAX_CUSTOM_PLAYLISTS + 4).lean();
    res.json(await enrichPlaylists(playlists));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPublicPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(MAX_CUSTOM_PLAYLISTS + 4).lean();
    res.json(await enrichPlaylists(playlists));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanDescription = typeof description === 'string' ? description.trim() : '';
    if (!cleanName) return res.status(400).json({ error: 'Name is required' });
    if (cleanName.length > 80) return res.status(400).json({ error: 'Playlist name must be 80 characters or fewer' });
    if (cleanDescription.length > 500) return res.status(400).json({ error: 'Description must be 500 characters or fewer' });
    const customPlaylistCount = await Playlist.countDocuments({ userId: req.user.id, type: 'custom' });
    if (customPlaylistCount >= MAX_CUSTOM_PLAYLISTS) {
      return res.status(400).json({ error: `You can create up to ${MAX_CUSTOM_PLAYLISTS} custom playlists` });
    }

    const newPlaylist = new Playlist({ userId: req.user.id, name: cleanName, description: cleanDescription, type: 'custom' });
    await newPlaylist.save();
    
    const plObj = newPlaylist.toObject();
    plObj.id = plObj._id.toString();
    plObj.playlist_items = [{ count: 0 }];

    res.status(201).json(plObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (playlist.type === 'system') return res.status(400).json({ error: 'System playlists cannot be deleted' });

    await PlaylistItem.deleteMany({ playlistId: req.params.id });
    await playlist.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { playlistId, tmdbId, mediaType } = req.body;
    if (!Number.isInteger(Number(tmdbId)) || Number(tmdbId) <= 0 || !['movie', 'tv'].includes(mediaType)) {
      return res.status(400).json({ error: 'A valid title and media type are required' });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const itemCount = await PlaylistItem.countDocuments({ playlistId });
    if (itemCount >= MAX_ITEMS_PER_PLAYLIST) {
      return res.status(400).json({ error: `A playlist can contain up to ${MAX_ITEMS_PER_PLAYLIST} titles` });
    }

    // A title has one viewing status at a time. Liked and custom collections remain independent.
    if (playlist.type === 'system' && STATUS_PLAYLISTS.includes(playlist.name)) {
      const otherStatusPlaylists = await Playlist.find({
        userId: req.user.id,
        type: 'system',
        name: { $in: STATUS_PLAYLISTS.filter(name => name !== playlist.name) },
      }).select('_id').lean();

      await PlaylistItem.deleteMany({
        playlistId: { $in: otherStatusPlaylists.map(statusPlaylist => statusPlaylist._id) },
        tmdbId: Number(tmdbId),
        mediaType,
      });
    }

    const newItem = new PlaylistItem({ playlistId, tmdbId: Number(tmdbId), mediaType });
    await newItem.save();
    res.status(201).json({
      success: true,
      message: playlist.type === 'system' && STATUS_PLAYLISTS.includes(playlist.name)
        ? `Moved to ${playlist.name}`
        : `Added to ${playlist.name}`,
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Item already exists in playlist' });
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await PlaylistItem.find({ playlistId: req.params.id }).sort({ createdAt: -1 }).limit(MAX_ITEMS_PER_PLAYLIST).lean();
    const formatted = items.map(i => ({ ...i, id: i._id.toString(), tmdb_id: i.tmdbId, media_type: i.mediaType }));
    res.json(formatted);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { playlistId, tmdbId } = req.params;
    const { mediaType } = req.query;
    if (!['movie', 'tv'].includes(mediaType)) return res.status(400).json({ error: 'Media type must be movie or tv' });
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await PlaylistItem.deleteOne({ playlistId, tmdbId: Number(tmdbId), mediaType });
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
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
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSavedIds = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id }).select('_id name');
    const playlistIds = playlists.map(p => p._id);
    const items = await PlaylistItem.find({ playlistId: { $in: playlistIds } })
      .select('playlistId tmdbId mediaType')
      .lean();
    
    const savedKeys = Array.from(new Set(items.map(i => `${i.mediaType}:${i.tmdbId}`)));
    const itemMap = {};
    items.forEach(i => {
      const key = `${i.mediaType}:${i.tmdbId}`;
      if (!itemMap[key]) itemMap[key] = [];
      itemMap[key].push(i.playlistId.toString());
    });

    res.json({
      savedKeys,
      itemMap,
      playlists: playlists.map(p => ({ id: p._id.toString(), name: p.name }))
    });
  } catch (err) {
    console.error(err.message);
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
      if (lower.includes('liked') || lower.includes('favourite') || lower.includes('favorite')) return 'liked';
      if (lower.includes('watched') || lower.includes('history')) return 'watched';
      return 'custom';
    };

    // Helper to group items by preset category for a user
    const categorizeUserItems = (items, plMap) => {
      const cat = { watchlist: new Set(), currentlyWatching: new Set(), watched: new Set(), liked: new Set(), custom: new Set() };
      const itemObjs = new Map();

      items.forEach(item => {
        const mediaKey = `${item.mediaType}:${item.tmdbId}`;
        itemObjs.set(mediaKey, item);
        const pl = plMap.get(item.playlistId.toString());
        const category = pl ? getPresetCategory(pl.name) : 'custom';
        if (cat[category]) {
          cat[category].add(mediaKey);
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
      for (const mediaKey of mutualIds.slice(0, 6)) {
        const item = u1ItemObjs.get(mediaKey);
        if (item) {
          const posterPath = await getPosterPath(item.tmdbId, item.mediaType);
          mutualItems.push({
            tmdbId: item.tmdbId,
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
    const likedBreakdown = await computeCategoryBreakdown(u1Cat.liked, u2Cat.liked);
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
    for (const mediaKey of toWatchIds.slice(0, 12)) {
      const item = u1ItemObjs.get(mediaKey);
      if (item) {
        const details = await getMediaDetails(item.tmdbId, item.mediaType);
        if (details) toWatchTogether.push(details);
      }
    }

    // 2. Both Completed: Items in Watched for both users
    const completedIds = Array.from(u1Cat.watched).filter(id => u2Cat.watched.has(id));
    const bothCompleted = [];
    for (const mediaKey of completedIds.slice(0, 12)) {
      const item = u1ItemObjs.get(mediaKey);
      if (item) {
        const details = await getMediaDetails(item.tmdbId, item.mediaType);
        if (details) bothCompleted.push(details);
      }
    }

    // Overall mutual IDs
    const allU1Ids = new Set(u1AllItems.map(i => `${i.mediaType}:${i.tmdbId}`));
    const allU2Ids = new Set(u2AllItems.map(i => `${i.mediaType}:${i.tmdbId}`));
    const allMutualIds = Array.from(allU1Ids).filter(id => allU2Ids.has(id));

    // 3. Recommendations: Unique titles from U2 with full details
    const user2UniqueItems = u2AllItems.filter(i => !allU1Ids.has(`${i.mediaType}:${i.tmdbId}`));
    const user2UniqueMap = new Map();
    user2UniqueItems.forEach(i => user2UniqueMap.set(`${i.mediaType}:${i.tmdbId}`, i));

    const recommendations = [];
    for (const item of Array.from(user2UniqueMap.values()).slice(0, 12)) {
      const details = await getMediaDetails(item.tmdbId, item.mediaType);
      if (details) recommendations.push(details);
    }

    // Match percentage calculation based on preset & custom overlap
    const totalUnique = new Set([...allU1Ids, ...allU2Ids]).size;
    let matchPercentage = 0;
    let synergyTier = 'Not enough overlap yet';

    if (totalUnique > 0) {
      const jaccard = (allMutualIds.length / totalUnique) * 100;
      matchPercentage = Math.round(jaccard);
    }

    if (matchPercentage >= 60) synergyTier = 'Very similar libraries';
    else if (matchPercentage >= 35) synergyTier = 'Strong overlap';
    else if (matchPercentage >= 15) synergyTier = 'Some common ground';
    else if (totalUnique > 0) synergyTier = 'Distinct libraries';

    res.json({
      currentUser: { id: currentUser._id, username: currentUser.username, avatarUrl: currentUser.avatarUrl },
      targetUser: { id: targetUser._id, username: targetUser.username, avatarUrl: targetUser.avatarUrl },
      matchPercentage,
      synergyTier,
      presetBreakdown: {
        watchlist: watchlistBreakdown,
        currentlyWatching: currentlyWatchingBreakdown,
        watched: watchedBreakdown,
        liked: likedBreakdown,
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
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
