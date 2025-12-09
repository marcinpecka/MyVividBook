"use client";

import { useState, use, useEffect } from "react";
import { ColoringPageCanvas } from "@/app/components/ColoringPageCanvas";
import { PromptInput } from "@/app/components/PromptInput";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Mock data as fallback
const MOCK_PAGES: Record<string, { id: string; title: string; baseImageUrl: string }> = {
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
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [pageTitle, setPageTitle] = useState<string>("Loading...");
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchPage = async () => {
            if (MOCK_PAGES[id]) {
                setCurrentImage(MOCK_PAGES[id].baseImageUrl);
                setOriginalImage(MOCK_PAGES[id].baseImageUrl);
                setPageTitle(MOCK_PAGES[id].title);
                return;
            }

            try {
                const docRef = doc(db, "coloring_pages", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCurrentImage(data.baseImageUrl);
                    setOriginalImage(data.baseImageUrl);
                    setPageTitle(data.title || "Untitled Page");
                } else {
                    setFetchError(true);
                    setErrorMessage("Page not found.");
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
                alert("Failed to generate: " + (data.error || "Unknown error"));
            }

        } catch (error) {
            console.error("Failed to generate:", error);
            alert("Failed to generate image.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setCurrentImage(originalImage);
    };

    if (fetchError && !currentImage) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card p-8 text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
                    <p className="text-slate-500 mb-4">{errorMessage || "The coloring page you're looking for doesn't exist."}</p>
                    <a href="/" className="btn-primary inline-block">Go Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <a href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-semibold gradient-text">MyVividBook</span>
                    </a>
                    <a href="/" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </a>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Canvas Section */}
                    <div className="lg:col-span-3">
                        <div className="card p-4 sm:p-6">
                            <div className="text-center mb-4">
                                <h1 className="text-2xl font-bold gradient-text">{pageTitle}</h1>
                            </div>

                            <ColoringPageCanvas imageUrl={currentImage || ''} alt={pageTitle} />

                            {currentImage !== originalImage && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={handleReset}
                                        className="text-sm text-slate-500 hover:text-red-500 transition-colors inline-flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset to Original
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="lg:col-span-2">
                        <div className="card p-6 sticky top-24">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="font-semibold">AI Magic</h2>
                                    <p className="text-sm text-slate-500">Transform your page</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Describe what you want to add or change. Try "Add a friendly dragon" or "Make it a sunny day"!
                            </p>

                            <PromptInput onSubmit={handlePromptSubmit} isLoading={isLoading} />

                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="text-sm font-medium mb-3">Quick Ideas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["Add a dragon", "Add flowers", "Make it sunny", "Add a rainbow"].map((idea) => (
                                        <button
                                            key={idea}
                                            onClick={() => handlePromptSubmit(idea)}
                                            disabled={isLoading}
                                            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
                                        >
                                            {idea}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
