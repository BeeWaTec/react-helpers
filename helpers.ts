import { useEffect } from 'react';
import chroma from "chroma-js"

export function getRatingPercentage(likes: number, dislikes: number): number {
    if (likes == dislikes) {
        return 50;
    }
    if (likes > dislikes) {
        return 50 + ((likes - dislikes) / (likes + dislikes) * 50);
    }
    if (likes < dislikes) {
        return 50 - ((dislikes - likes) / (likes + dislikes) * 50);
    }
}

export function getRatingColor(rating: number): string {
    return chroma.mix("#4CBBFC", "#ad0441", rating / 100, "rgb").hex();
}