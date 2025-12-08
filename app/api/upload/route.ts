import { NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { storage, auth } from "@/app/lib/firebase";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Authenticate anonymously to satisfy "auth != null" rule
        const userCredential = await signInAnonymously(auth);
        console.log("Logged in anonymously as:", userCredential.user.uid);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        console.log("Uploading to bucket:", storage.app.options.storageBucket);
        const storageRef = ref(storage, `coloring-pages/${Date.now()}-${file.name}`);

        // Upload the file buffer
        await uploadBytes(storageRef, buffer, {
            contentType: file.type,
        });

        const downloadURL = await getDownloadURL(storageRef);

        return NextResponse.json({ url: downloadURL });

    } catch (error: any) {
        console.error("Upload Error Info:", JSON.stringify(error, null, 2)); // Detailed Log
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
