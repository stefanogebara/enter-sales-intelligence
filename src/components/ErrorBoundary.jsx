import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-enter-gray-950">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-verdict-unqualified-bg rounded-enter flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-verdict-unqualified" />
            </div>
            <h2 className="text-xl font-bold text-enter-white mb-2">Algo deu errado</h2>
            <p className="text-sm text-enter-gray-500 mb-6">
              {this.state.error?.message || 'Erro inesperado'}
            </p>
            <button onClick={() => window.location.reload()} className="enter-btn-gold">
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
