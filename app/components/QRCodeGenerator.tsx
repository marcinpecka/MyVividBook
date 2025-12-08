/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface QRCodeGeneratorProps {
    data: string;
    size?: number;
}

export function QRCodeGenerator({ data, size = 150 }: QRCodeGeneratorProps) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-zinc-200">
                <img src={qrUrl} alt={`QR Code for ${data}`} width={size} height={size} className="block" />
            </div>
            <p className="text-xs text-zinc-500 font-mono break-all max-w-[200px] text-center">{data}</p>
        </div>
    );
}
