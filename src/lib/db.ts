import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'history.json');

export interface HistoryEntry {
    id: string;
    jobTitle: string;
    company: string; // Extracted or inferred
    date: string; // ISO string
    status: 'Draft' | 'Sent' | 'Failed';
    resumePreview?: string; // Short snippet or path
}

function ensureDB() {
    if (!fs.existsSync(DB_PATH)) {
        // Ensure directory exists
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    }
}

export function getHistory(): HistoryEntry[] {
    ensureDB();
    try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(fileContent) as HistoryEntry[];
    } catch (error) {
        console.error("Failed to read DB:", error);
        return [];
    }
}

export function addEntry(entry: Omit<HistoryEntry, 'id' | 'date'>): HistoryEntry {
    const history = getHistory();
    const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        ...entry
    };
    
    // Add to beginning
    history.unshift(newEntry);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(history, null, 2));
    return newEntry;
}

export function updateEntryStatus(id: string, status: HistoryEntry['status']) {
    const history = getHistory();
    const index = history.findIndex(h => h.id === id);
    if (index !== -1) {
        history[index].status = status;
        fs.writeFileSync(DB_PATH, JSON.stringify(history, null, 2));
        return history[index];
    }
    return null;
}
