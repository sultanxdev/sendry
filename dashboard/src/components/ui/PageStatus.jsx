import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export function PageStatus({ isLoading, error, onRetry, loadingText = 'Loading...', errorText = 'Failed to load data' }) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-slate-500">
                <Loader2 className="w-8 h-8 text-[#A7E46A] animate-spin" aria-label={loadingText} />
                <p className="text-sm font-semibold tracking-wide">{loadingText}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center max-w-md mx-auto p-8 bg-red-500/5 border border-red-500/10 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-red-550/10 flex items-center justify-center text-red-600 mb-2">
                    <AlertCircle className="w-6 h-6" aria-hidden="true" />
                </div>
                <h4 className="text-lg font-bold text-[#222026] m-0">{errorText}</h4>
                <p className="text-sm text-slate-500 m-0">Please check your connection and try again.</p>
                {onRetry && (
                    <Button onClick={onRetry} variant="default" className="mt-2">
                        Try Again
                    </Button>
                )}
            </div>
        );
    }

    return null;
}
