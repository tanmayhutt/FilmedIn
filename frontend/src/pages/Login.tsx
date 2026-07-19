import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-hot-toast'
import { googleLoginAction } from '@/services/auth.service'
import { Film } from 'lucide-react'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true)
    const res = await googleLoginAction(credentialResponse.credential)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Successfully logged in!')
      navigate('/')
      window.location.reload()
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
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                shape="pill"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
