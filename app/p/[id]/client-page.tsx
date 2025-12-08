"use client";

import { useState } from "react";
import { ColoringPageCanvas } from "@/app/components/ColoringPageCanvas";
import { PromptInput } from "@/app/components/PromptInput";

interface ColoringPageClientProps {
    initialData: {
        id: string;
        title: string;
        baseImageUrl: string;
    } | null;
    error: boolean;
    errorMessage?: string; // Add optional error message
}

export default function ColoringPageClient({ initialData, error, errorMessage }: ColoringPageClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(initialData?.baseImageUrl || null);

    const handlePromptSubmit = async (prompt: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    imageUrl: currentImage && !currentImage.startsWith('<svg') ? currentImage : undefined
                    // Only send URL, not huge SVG string back to server for now
                }),
            });
            const data = await response.json();

            if (data.success && data.svgCode) {
                setCurrentImage(data.svgCode);
            } else {
                console.error("Generation failed:", data);
                alert("Failed to generate: " + (data.error || "Unknown error"));
            }

        } catch (error) {
            console.error("Failed to generate:", error);
            alert("Failed to generate image.");
        } finally {
            setIsLoading(false);
        }
    };

    if (error || !initialData) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Coloring page not found.</p>
                {errorMessage && <p className="text-sm mt-2 text-zinc-400">{errorMessage}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-8 bg-zinc-50 dark:bg-black gap-8">
            <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{initialData.title}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Add details to customize your coloring page!</p>
                </div>

                <ColoringPageCanvas imageUrl={currentImage || ''} alt={initialData.title} />
                <div className="text-xs text-zinc-400 break-all max-h-20 overflow-hidden opacity-50">{currentImage ? (currentImage.startsWith('<svg') ? 'SVG Generated' : currentImage) : ''}</div>

                <div className="w-full max-w-md">
                    <PromptInput onSubmit={handlePromptSubmit} isLoading={isLoading} />
                </div>
            </div>

            <a href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
                ← Back to Home
            </a>
        </div>
    );
}
