"use client";

import { useState, useEffect } from "react";
import { QRCodeGenerator } from "../components/QRCodeGenerator";
import { db } from "../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";

interface ColoringPage {
    id: string;
    title: string;
    baseImageUrl: string;
    createdAt?: Timestamp;
}

export default function AdminDashboard() {
    const [baseUrl, setBaseUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [pages, setPages] = useState<ColoringPage[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }

        const q = query(collection(db, "coloring_pages"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const pagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ColoringPage[];
            setPages(pagesData);
        }, (error) => {
            console.error("Admin Firestore Error:", error);
        });

        return () => unsubscribe();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const { url: downloadURL } = await response.json();

            await addDoc(collection(db, "coloring_pages"), {
                title: file.name.replace(/\.[^/.]+$/, ""),
                baseImageUrl: downloadURL,
                createdAt: Timestamp.now(),
            });

        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Check console.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold gradient-text">Admin Dashboard</h1>
                    </div>
                    <a href="/" className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </a>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Card */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="font-semibold">Upload New Page</h2>
                                    <p className="text-sm text-slate-500">Add a new coloring page</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Upload a black & white outline image to create a new coloring page.
                            </p>

                            <label className={`w-full inline-flex items-center justify-center gap-2 btn-primary cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Select Image
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                />
                            </label>

                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Supported: PNG, JPG, SVG
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pages List */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Your Coloring Pages</h2>
                            <span className="text-sm text-slate-500">{pages.length} pages</span>
                        </div>

                        {pages.length === 0 ? (
                            <div className="card p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium mb-1">No pages yet</h3>
                                <p className="text-sm text-slate-500">Upload your first coloring page to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pages.map((page) => (
                                    <div key={page.id} className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                            {page.baseImageUrl && (
                                                <img
                                                    src={page.baseImageUrl}
                                                    alt={page.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{page.title}</h3>
                                            <p className="text-xs text-slate-500 font-mono mt-1">ID: {page.id}</p>
                                            <div className="mt-2 flex gap-2">
                                                <a
                                                    href={`/p/${page.id}`}
                                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Page
                                                </a>
                                            </div>
                                        </div>

                                        {/* QR Code */}
                                        <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                                            <QRCodeGenerator data={`${baseUrl}/p/${page.id}`} size={80} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
