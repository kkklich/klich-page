import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AggregatedData, DataPoint } from '../models/aggregated_data.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class JobsService {
    constructor(private apiService: ApiService) { }

    getProcessedData(): Observable<{
        rawData: DataPoint[];
        aggregatedData: AggregatedData[];
    }> {
        return this.apiService.getData().pipe(
            map((response: any) => {
                let rawData: DataPoint[] = [];
                if (response && response.data && Array.isArray(response.data)) {
                    rawData = response.data;
                } else {
                    console.error('Invalid API response structure:', response);
                    return { rawData: [], aggregatedData: [] };
                }

                const aggregated = rawData.reduce((acc, item) => {
                    const dateTime = item.dateTime;
                    if (!acc[dateTime]) {
                        acc[dateTime] = 0;
                    }
                    acc[dateTime] += item.techCounts;
                    return acc;
                }, {} as Record<string, number>);

                const aggregatedData = Object.entries(aggregated)
                    .map(([dateTime, totalCount]) => ({ dateTime, totalCount }))
                    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

                return { rawData, aggregatedData };
            }),
            catchError(error => {
                console.error('API Error:', error);
                return of({ rawData: [], aggregatedData: [] });
            })
        );
    }
}
