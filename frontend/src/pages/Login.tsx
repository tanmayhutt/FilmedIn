import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-hot-toast'
import { googleLoginAction } from '@/services/auth.service'
import { Logo } from '@/components/common/Logo'
import { getSafeRedirect } from '@/utils/navigation'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const redirect = getSafeRedirect(new URLSearchParams(location.search).get('redirect'))

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true)
    const res = await googleLoginAction(credentialResponse.credential)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Successfully logged in!')
      if (res.isNewUser) {
        window.location.href = `/onboarding?redirect=${encodeURIComponent(redirect)}`
      } else {
        window.location.href = redirect || '/'
      }
    }
  }

  const handleGoogleError = () => {
    toast.error('Google Sign-In Failed')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 clay-modal p-10 sm:p-12 relative z-10 text-center animate-in zoom-in-95">
        <div className="flex flex-col items-center justify-center text-center">
          
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <Logo className="scale-150" />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome to FilmedIn</h1>
          <p className="text-zinc-300 mb-8 text-sm px-2 leading-relaxed">
            Your personal movie database. Sign in to track, save, and share what you're watching.
          </p>

          <div className="w-full flex justify-center mt-2">
            {loading ? (
              <div className="text-blue-400 animate-pulse font-medium flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full items-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="large"
                  shape="pill"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
