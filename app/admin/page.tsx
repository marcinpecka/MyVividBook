"use client";

import { useState, useEffect } from "react";
import { QRCodeGenerator } from "../components/QRCodeGenerator";
import { db, storage } from "../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
            console.log("Admin Loaded Pages:", pagesData.length);
        }, (error) => {
            console.error("Admin Firestore Error:", error);
            alert("Error loading pages: " + error.message);
        });

        return () => unsubscribe();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload via API Proxy (to avoid CORS)
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

            // 2. Add to Firestore (Client-side is fine for specific data, no CORS issue usually)
            // Note: If Firestore gives Perm denied, we might need a proxy for that too, but usually it's fine.
            await addDoc(collection(db, "coloring_pages"), {
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                baseImageUrl: downloadURL,
                createdAt: Timestamp.now(),
            });

            alert("Uploaded successfully!");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Check console.");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    return (
        <div className="min-h-screen p-8 bg-zinc-50 dark:bg-black">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>
                    <a href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">← Back to Home</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 h-fit">
                        <h2 className="text-xl font-semibold mb-4 dark:text-zinc-100">Upload New Page</h2>
                        <p className="text-zinc-500 mb-4">Upload a black & white outline image to create a new coloring page.</p>

                        <label className={`inline-flex items-center justify-center px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md text-sm font-medium transition active:scale-95 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploading ? 'Uploading...' : 'Select Image'}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-semibold mb-4 dark:text-zinc-100">Manage Pages</h2>
                        <p className="text-zinc-500 mb-4">View and edit existing coloring pages.</p>
                        <div className="space-y-6">

                            {pages.length === 0 && (
                                <div className="text-center py-8 text-zinc-500">
                                    No pages yet. Upload one to get started!
                                </div>
                            )}

                            {pages.map((page) => (
                                <div key={page.id} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium dark:text-zinc-300">{page.title}</span>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <a href={`/p/${page.id}`} className="text-blue-600 hover:underline">View Page</a>
                                            <span className="text-zinc-400">ID: {page.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-center w-full sm:w-auto">
                                        <QRCodeGenerator data={`${baseUrl}/p/${page.id}`} size={100} />
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
