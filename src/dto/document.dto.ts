export interface Metadata {
  url: string;
  title: string;
  source_file: string;
  scraped_at: number;
}

export interface DocumentDTO {
  page_content: string;
  metadata: Metadata;
  embedding: number[];
}
