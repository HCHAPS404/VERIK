export type IndexedFile = {
  filename: string;
  pages: number;
  chunks: number;
};

export type IngestResponseDto = {
  indexed_files: IndexedFile[];
  total_chunks: number;
  collection: string;
};

export type IngestModel = {
  files: IndexedFile[];
  totalChunks: number;
  collection: string;
};
