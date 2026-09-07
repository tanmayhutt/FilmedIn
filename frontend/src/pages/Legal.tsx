import { Link, useLocation } from 'react-router-dom'

export default function Legal() {
  const isPrivacy = useLocation().pathname === '/privacy'

  return (
    <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <article className="clay-card p-7 sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">FilmedIn legal</p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black text-white">{isPrivacy ? 'Privacy policy' : 'Terms of service'}</h1>
        <p className="mt-3 text-sm text-zinc-400">Last updated August 11, 2026</p>

        {isPrivacy ? (
          <div className="mt-10 space-y-8 text-sm sm:text-base leading-7 text-zinc-300">
            <section><h2 className="text-xl font-bold text-white mb-2">Information we process</h2><p>FilmedIn stores your Google account email, chosen username, profile details, followers, playlists, saved titles, and uploaded profile media. Google handles sign-in; FilmedIn does not receive your Google password.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">How information is used</h2><p>Your information powers account access, profiles, social features, playlists, taste comparisons, and product security. Movie and TV metadata is requested from TMDB. Uploaded media is stored through Cloudinary.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">Essential session storage</h2><p>FilmedIn uses a secure, HttpOnly session cookie to keep you signed in and a non-sensitive browser storage flag to update signed-in interface controls. The service does not use advertising cookies.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">Visibility</h2><p>Signed-in members can view member profiles and playlists. Your email address is not shown on profile pages. Do not add sensitive personal information to your username, bio, or playlist text.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">Deletion and retention</h2><p>You can permanently delete your account from profile settings. This removes your profile, follows, playlists, and playlist items from the application database. Backups and provider logs may be retained for limited operational periods.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">Third-party services</h2><p>FilmedIn relies on Google for authentication, TMDB for entertainment metadata, MongoDB for application data, Cloudinary for uploads, and cloud infrastructure for hosting. Their own policies apply to information they process.</p></section>
          </div>
        ) : (
          <div className="mt-10 space-y-8 text-sm sm:text-base leading-7 text-zinc-300">
            <section><h2 className="text-xl font-bold text-white mb-2">Using FilmedIn</h2><p>You may use FilmedIn to discover titles, maintain playlists, follow members, and compare viewing taste. You are responsible for activity performed through your account.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">Acceptable conduct</h2><p>Do not misuse the service, attempt unauthorized access, automate abusive requests, upload unlawful material, impersonate others, or publish content that violates another person’s rights.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">Content and data</h2><p>Movie and TV images, names, and metadata belong to their respective owners and are supplied by TMDB. FilmedIn is not endorsed or certified by TMDB. You retain responsibility for profile media and text you upload.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">Availability</h2><p>The service may change, experience interruptions, or remove features. FilmedIn is provided without a guarantee that every title, rating, generated wallpaper, or third-party integration will always be available.</p></section>
            <section><h2 className="text-xl font-bold text-white mb-2">Account termination</h2><p>You may delete your account at any time. Access may be limited for abuse, security threats, or violations of these terms.</p></section>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-white/10 text-sm text-zinc-400">
          View the <Link className="text-white underline underline-offset-4" to={isPrivacy ? '/terms' : '/privacy'}>{isPrivacy ? 'terms of service' : 'privacy policy'}</Link> or return to the <Link className="text-white underline underline-offset-4" to="/">home page</Link>.
        </div>
      </article>
    </main>
  )
}
