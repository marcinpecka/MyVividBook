interface ColoringPageCanvasProps {
    imageUrl: string;
    alt: string;
}

export function ColoringPageCanvas({ imageUrl, alt }: ColoringPageCanvasProps) {
    return (
        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-lg border border-slate-200 dark:border-slate-700">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-300 dark:border-indigo-600 rounded-tl" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-300 dark:border-indigo-600 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-300 dark:border-indigo-600 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-300 dark:border-indigo-600 rounded-br" />

            {imageUrl ? (
                imageUrl.trim().startsWith('<svg') ? (
                    <div
                        className="w-full h-full p-6 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                        dangerouslySetInnerHTML={{ __html: imageUrl }}
                    />
                ) : (
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="w-full h-full object-contain p-6"
                    />
                )
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-sm">Loading image...</span>
                </div>
            )}
        </div>
    );
}
