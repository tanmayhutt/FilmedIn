import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

type Props = { children: ReactNode; resetKey?: string }
type State = { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Page failed to render', error)
  }

  componentDidUpdate(previous: Props) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center" role="alert">
        <h1 className="text-2xl font-bold text-white">This page could not load</h1>
        <p className="mt-3 text-sm text-zinc-400">Something went wrong while showing this page. Reloading usually fixes it.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e8e0d3] px-5 py-2.5 text-sm font-bold text-[#111210] hover:bg-white"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Reload
        </button>
      </main>
    )
  }
}
