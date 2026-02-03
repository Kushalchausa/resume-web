import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";

export interface HistoryEntry {
    id: string;
    jobTitle?: string;
    company?: string;
    date: string;
    status: string;
    resumePreview?: string;
}

export async function getHistory(): Promise<HistoryEntry[]> {
    const entries = await prisma.history.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return entries.map((e: any) => ({
        id: e.id,
        jobTitle: e.jobTitle,
        company: e.company,
        date: e.createdAt.toISOString(),
        status: e.status, // Now returns "PENDING", "SUCCESS", etc.
        resumePreview: e.tailoredResume ? e.tailoredResume.substring(0, 200) + '...' : ''
    }));
}

export async function addEntry(entry: { 
    jobTitle: string; 
    company: string; 
    status: Status; 
    resumePreview?: string; 
    fullResume?: string; 
    coverLetter?: string;
    jobDescription?: string;
}) {
    return await prisma.history.create({
        data: {
            jobTitle: entry.jobTitle,
            company: entry.company,
            status: entry.status,
            tailoredResume: entry.fullResume || entry.resumePreview,
            coverLetter: entry.coverLetter,
            jobDescription: entry.jobDescription
        }
    });
}

export async function updateEntryStatus(id: string, status: Status) {
    try {
        await prisma.history.update({
            where: { id },
            data: { status }
        });
    } catch (error) {
        console.error(`Failed to update status for ${id}:`, error);
    }
}
