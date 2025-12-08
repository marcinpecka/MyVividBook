"use client";

import { useState, use, useEffect } from "react";
import { ColoringPageCanvas } from "@/app/components/ColoringPageCanvas";
import { PromptInput } from "@/app/components/PromptInput";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Mock data as fallback
const MOCK_PAGES = {
    "1": {
        id: "1",
        title: "Medieval Castle",
        baseImageUrl: "https://placehold.co/600x800/png?text=Castle+Coloring+Page",
    },
    "2": {
        id: "2",
        title: "Space Adventure",
        baseImageUrl: "https://placehold.co/600x800/png?text=Space+Coloring+Page",
    },
};

export default function ColoringPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [pageTitle, setPageTitle] = useState<string>("Loading...");
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch page data
    useEffect(() => {
        const fetchPage = async () => {
            // 1. Check Mocks first (fast path for demos)
            // @ts-ignore
            if (MOCK_PAGES[id]) {
                // @ts-ignore
                setCurrentImage(MOCK_PAGES[id].baseImageUrl);
                // @ts-ignore
                setPageTitle(MOCK_PAGES[id].title);
                return;
            }

            // 2. Fetch from Firebase (Client-Side)
            try {
                // Ensure db is imported from the same file that works for Admin
                const docRef = doc(db, "coloring_pages", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    console.log("Fetched Page Data:", data);
                    setCurrentImage(data.baseImageUrl);
                    setPageTitle(data.title || "Untitled Page");
                } else {
                    console.log("No such document!");
                    setFetchError(true);
                    setErrorMessage("Document not found.");
                }
            } catch (error: any) {
                console.error("Error fetching page:", error);
                setFetchError(true);
                setErrorMessage(error.message);
            }
        };

        fetchPage();
    }, [id]);

    const handlePromptSubmit = async (prompt: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    imageUrl: currentImage && !currentImage.startsWith('<svg') ? currentImage : undefined
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

    if (fetchError && !currentImage) {
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
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{pageTitle}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Add details to customize your coloring page!</p>
                </div>

                <ColoringPageCanvas imageUrl={currentImage || ''} alt={pageTitle} />
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
