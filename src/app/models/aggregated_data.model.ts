export interface DataPoint {
    dateTime: string;
    techCounts: number;
    technologyName: string;
}

export interface ApiResponse {
    data: DataPoint[];
}

export interface AggregatedData {
    dateTime: string;
    totalCount: number;
}