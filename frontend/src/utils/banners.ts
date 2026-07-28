export interface PresetBanner {
  id: string
  name: string
  url: string
}

export const PRESET_BANNERS: PresetBanner[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'midnight',
    name: 'Neon Midnight',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'cinema',
    name: 'Cinema Hall',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'vintage',
    name: 'Vintage Film',
    url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'minimal-mesh',
    name: 'Fluid Mesh',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80'
  }
]
