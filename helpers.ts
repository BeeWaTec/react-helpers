import { useEffect } from 'react';
import chroma from "chroma-js"
import { v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5 } from "uuid";

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
    return 50;
}

export function getRatingColor(rating: number): string {

    // Clamp rating to 0-100
    rating = Math.min(Math.max(rating, 0), 100);

    // Check if chroma is available
    if (chroma) {
        return chroma.mix("#4CBBFC", "#ad0441", rating / 100, "rgb").hex();
    }
    else {
        // Fallback in steps of 4
        if (rating < 25) {
            return "#FF4136";
        }
        if (rating < 50) {
            return "#FF851B";
        }
        if (rating < 75) {
            return "#FFDC00";
        }
        return "#2ECC40";
    }
}

export function getRandomUUID({ exclude }: { exclude?: string[] } = {}): string {
    let uuid: string;
    do {
        uuid = uuidv4();
    } while (exclude && exclude.includes(uuid));
    return uuid;
}