import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import {
    Chart,
    ChartConfiguration,
    registerables,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { HostListener } from '@angular/core';
import { AggregatedData, DataPoint } from '../../../models/aggregated_data.model';
import { JobsService } from '../../../services/jobs.service';

Chart.register(...registerables);

interface JobsDataResponse {
    rawData: DataPoint[];
    aggregatedData: AggregatedData[];
}

@Component({
    selector: 'app-jobs-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './jobs-dashboard.component.html',
    styleUrls: ['./jobs-dashboard.component.scss']
})
export class JobsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('multiLineChart', { static: false }) multiLineChart!: ElementRef<HTMLCanvasElement>;
    @ViewChild('totalLineChart', { static: false }) totalLineChart!: ElementRef<HTMLCanvasElement>;

    jobsData: DataPoint[] = [];
    totalData: AggregatedData[] = [];
    isLoading = true;

    private multiChartInstance: Chart | null = null;
    private totalChartInstance: Chart | null = null;
    private colorMap: Record<string, string> = {};

    constructor(private jobsService: JobsService, @Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit(): void {
        if (isPlatformServer(this.platformId)) return;
        setTimeout(() => {
            this.createCharts();
            if (this.jobsData.length) {
                this.updateMultiLineChart();
                this.updateTotalLineChart();
            }
        }, 100);
    }
    ngOnDestroy(): void {
        this.multiChartInstance?.destroy();
        this.totalChartInstance?.destroy();
    }

    @HostListener('window:resize')
    onResize(): void {
        this.multiChartInstance?.resize();
        this.totalChartInstance?.resize();
    }

    private loadData(): void {
        this.isLoading = true;

        this.jobsService.getProcessedData().subscribe({
            next: (response: JobsDataResponse) => {
                this.jobsData = response.rawData;
                this.totalData = response.aggregatedData;
                this.updateMultiLineChart();
                this.updateTotalLineChart();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading jobs data:', error);
                this.isLoading = false;
            }
        });
    }

    private createCharts(): void {
        this.createMultiLineChart();
        this.createTotalLineChart();
    }

    private createMultiLineChart(): void {
        const ctx = this.multiLineChart?.nativeElement?.getContext('2d');
        if (!ctx) return;

        const config: ChartConfiguration<'line'> = {
            type: 'line' as const,
            data: { datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index' as const
                },
                scales: {
                    x: {
                        type: 'time' as const,
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'dd-MM-yyyy'  // DD-MM-YYYY FORMAT
                            }
                        },
                        title: { display: true, text: 'Time' }
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Job Counts' }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top' as const
                    },
                    title: {
                        display: true,
                        text: 'Technology Job Counts Over Time',
                        font: { size: 16 }
                    }
                },
                spanGaps: true,
                showLine: true
            }
        };

        this.multiChartInstance = new Chart(ctx, config);
    }

    private createTotalLineChart(): void {
        const ctx = this.totalLineChart.nativeElement.getContext('2d');
        if (!ctx) return;

        const config: ChartConfiguration<'line'> = {
            type: 'line' as const,
            data: {
                datasets: [{
                    label: 'Total Job Count',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    spanGaps: true,
                    showLine: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time' as const,
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'dd-MM-yyyy'  // DD-MM-YYYY FORMAT
                            }
                        },


                        title: { display: true, text: 'Time' }
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Total Jobs' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Total Job Count',
                        font: { size: 16 }
                    }
                }
            }
        };

        this.totalChartInstance = new Chart(ctx, config);
    }

    private updateMultiLineChart(): void {
        if (!this.jobsData.length || !this.multiChartInstance) return;

        const technologies = [...new Set(this.jobsData.map(d => d.technologyName))];

        const datasets = technologies.map(techName => {
            const techDataPoints = this.jobsData
                .filter(d => d.technologyName === techName)
                .map(d => ({ x: new Date(d.dateTime).getTime(), y: d.techCounts }));

            return {
                label: techName,
                data: techDataPoints,
                borderColor: this.getColorForTech(techName),
                backgroundColor: this.getColorForTech(techName, 0.1),
                tension: 0.3,
                fill: false,
                pointRadius: 3,
                spanGaps: true,
                showLine: true
            };
        });

        this.multiChartInstance.data = { datasets };
        this.multiChartInstance.update('active');
    }

    private updateTotalLineChart(): void {
        if (!this.totalData.length || !this.totalChartInstance) return;

        const labels = this.totalData.map(d => new Date(d.dateTime));
        const data = this.totalData.map(d => d.totalCount);

        this.totalChartInstance.data = {
            labels,
            datasets: [{
                ...this.totalChartInstance!.data.datasets![0],
                data
            }]
        };
        this.totalChartInstance.update('active');
    }

    private getColorForTech(techName: string, opacity: number = 1): string {
        if (!this.colorMap[techName]) {
            const colors = [
                '#FF1744', '#D500F9', '#651FFF', '#00E5FF', '#00E676', '#FFEA00',
                '#FF5722', '#795548', '#607D8B', '#00BCD4', '#43A047', '#FDD835',
                '#E91E63', '#3F51B5', '#009688', '#FFC107', '#F44336', '#9C27B0',
                '#2196F3', '#4CAF50', '#FF9800', '#9E9E9E', '#673AB7', '#CDDC39',
                '#FF5722', '#8BC34A', '#03A9F4', '#FF4081', '#C2185B', '#0097A7',
                '#388E3C', '#FBC02D', '#1976D2', '#E64A19', '#689F38', '#0288D1',
                '#C62828', '#3949AB', '#558B2F', '#0277BD', '#D84315', '#33691E'
            ];
            this.colorMap[techName] = colors[Math.floor(Math.random() * colors.length)];
        }
        return this.colorMap[techName].replace(')', `, ${opacity})`).replace('rgb', 'rgba');
    }
}
