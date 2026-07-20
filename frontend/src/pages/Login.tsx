import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-hot-toast'
import { googleLoginAction, devLoginAction } from '@/services/auth.service'
import { Film } from 'lucide-react'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log('Google credential received', credentialResponse)
    setLoading(true)
    const res = await googleLoginAction(credentialResponse.credential)
    console.log('Auth response:', res)
    setLoading(false)
    if (res.error) {
      console.error('Login error:', res.error)
      toast.error(res.error)
    } else {
      console.log('Login success!', res)
      toast.success('Successfully logged in!')
      if (res.isNewUser && res.user?.username) {
        window.location.href = `/u/${res.user.username}?edit=true`
      } else {
        window.location.href = '/'
      }
    }
  }

  const handleGoogleError = () => {
    toast.error('Google Sign-In Failed')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Film className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to FilmedIn</h2>
          <p className="text-zinc-400 mb-8 text-sm">
            Sign in with Google to save movies, create playlists, and track what you've watched.
          </p>

          <div className="w-full flex justify-center">
            {loading ? (
              <div className="text-zinc-400 animate-pulse">Signing you in...</div>
            ) : (
              <div className="flex flex-col gap-4 w-full items-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="large"
                  shape="pill"
                />
                
                {import.meta.env.DEV && (
                  <button
                    onClick={async () => {
                      setLoading(true);
                      const res = await devLoginAction();
                      setLoading(false);
                      if (res.error) toast.error(res.error);
                      else {
                        toast.success('Dev Login Success');
                        if (res.isNewUser && res.user?.username) {
                          window.location.href = `/u/${res.user.username}?edit=true`;
                        } else {
                          window.location.href = '/';
                        }
                      }
                    }}
                    className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300 text-sm font-medium transition-colors"
                  >
                    Bypass Login (Dev Only)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
