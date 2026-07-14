
---

### File 4: `04_FEATURE_WALKTHROUGH.md`

```markdown
# FilmedIn - Feature Walkthrough &amp; UI Layout

## 1. Homepage (`/`)
- **Layout:** Minimalist hero section. A single large search bar in the center.
- **Below Search:** Two sleek horizontal carousels: "Trending Movies" and "Trending TV Shows".
- **Card UI:** Minimalist movie cards (poster only). Title and year appear subtly on hover.

## 2. Search (`/search?q=...`)
- Instant results grid displaying movies and TV shows as minimalist cards.
- Toggle filter: All / Movies / TV Shows.

## 3. Details Page (`/movie/[id]` &amp; `/tv/[id]`)
- **Header:** Large blurred backdrop image with the poster overlapping it on the left. Title, Year, Rating, and Runtime/Seasons.
- **Actions:** 
  - "Add to List" dropdown button (Watching, Plan to Watch, Watched, Create Custom).
  - "Wallpapers" button (Opens the wallpaper modal/tab).
- **Tabs (The Minimalist Approach):**
  - **Overview:** Short synopsis, director/creator, main cast (horizontal scroll).
  - **Details:** Full cast, production companies, genres (for movies: box office; for TV: seasons list).
  - **Wallpapers:** The USP section.

## 4. Wallpaper Generation UI
- A clean section showing Mobile and Desktop format options.
- If wallpaper exists: Display the image with a "Download" icon button.
- If not: A "Generate [Mobile/Desktop] Wallpaper" button. Shows a minimalist loading spinner while the AI pipeline runs in the background.

## 5. Profile &amp; Playlists (`/profile`)
- Protected route.
- **Header:** Username, Stats (Total Movies Watched, Total TV Shows Watched).
- **Playlists Grid:** Displays "Watching", "Plan to Watch", "Watched", and any custom playlists as minimalist folders.
- **Playlist View (`/profile/playlist/[id]`):** A clean grid of all items saved in that specific playlist.