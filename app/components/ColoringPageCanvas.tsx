import Image from "next/image";

interface ColoringPageCanvasProps {
    imageUrl: string;
    alt: string;
}

export function ColoringPageCanvas({ imageUrl, alt }: ColoringPageCanvasProps) {
    return (
        <div className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white">
            {imageUrl ? (
                imageUrl.trim().startsWith('<svg') ? (
                    <div
                        className="w-full h-full p-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                        dangerouslySetInnerHTML={{ __html: imageUrl }}
                    />
                ) : (
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="w-full h-full object-contain p-4"
                    />
                )
            ) : (
                <div className="flex items-center justify-center w-full h-full text-zinc-400">
                    No image loaded
                </div>
            )}

        </div>
    );
}
