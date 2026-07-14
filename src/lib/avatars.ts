export const PRESET_AVATARS = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=Felix',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Jude',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Avery',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Chase',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Destiny',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Emery',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Kingston',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Riley',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Xavier',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Jack',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Leah'
]

export function getRandomAvatar() {
  return PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]
}
