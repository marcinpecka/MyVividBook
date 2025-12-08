"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PromptInputProps {
    onSubmit: (prompt: string) => void;
    isLoading?: boolean;
}

export function PromptInput({ onSubmit, isLoading = false }: PromptInputProps) {
    const [prompt, setPrompt] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onSubmit(prompt);
            setPrompt("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
                type="text"
                placeholder="Add a dragon to the castle..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !prompt.trim()}>
                {isLoading ? "Generating..." : "Modify"}
            </Button>
        </form>
    );
}
