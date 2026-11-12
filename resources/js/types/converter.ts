export type ConversionType = 'image' | 'pdf' | 'text';

export type ConversionSummary = {
    id: number;
    type: ConversionType;
    source_name: string | null;
    source_size: number;
    page_count: number | null;
    character_count: number;
    preview: string;
    created_at: string | null;
};

export type ConversionStats = {
    total: number;
    characters: number;
    images: number;
    pdfs: number;
};
