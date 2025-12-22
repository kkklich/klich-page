import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPoint } from '../models/aggregated_data.model';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'https://it-jobs-u7kb.onrender.com/api/stats';

    constructor(private http: HttpClient) { }

    public getData(): Observable<DataPoint[]> {
        return this.http.get<DataPoint[]>(this.apiUrl);
    }
}
