import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { ChartService } from './services/chart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  name = 'Angular';
  selected: string = 'option1';
  populationData: any;
  filteredPopulationData: any;
  uniqueYears: any;
  selectedYear: string = '';

  totalPopulation: any = 0;

  constructor(
    private data: DataService,
    private chart: ChartService
  ) {}

  ngOnInit() {
    this.data.getChartData().subscribe({
      next: (res: any) => {
        this.populationData = this.csvJSON(res);

        this.uniqueYears = new Set();

        this.populationData.forEach((item: any, index: number) => {
          this.uniqueYears.add(item.Year);
        });

        this.uniqueYears = Array.from(this.uniqueYears);
        this.selectedYear = this.uniqueYears[0];

        this.filterByYear(this.selectedYear);

        let dimensions: any = {
          height: document.getElementById('growth_trend')?.clientHeight,
          width: document.getElementById('growth_trend')?.clientWidth
        };

        this.chart.generateAreaPlot('growth_trend', dimensions, this.populationData, this.uniqueYears)
      },
      error: (err: any) => {},
    });
  }

  filterByYear(year: any) {

    this.filteredPopulationData = this.populationData.filter(
      (item: any) => item.Year == year
    );
    
    this.totalPopulation = this.chart.convertToInternationalCurrencySystem(this.filteredPopulationData.reduce(
      (sum: any, val: any) => sum + (+val['Population (000s)']) , 0
    )* 1000);

    let dimensions: any = {
      height: 300,
      width: document.getElementById('scatter')?.clientWidth
    }

    this.chart.generateScatterPlot('scatter', dimensions, this.filteredPopulationData)
  }

  csvJSON(csv: any) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const obj: any = {};
      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j].trim()] = currentline[j].trim();
      }
      result.push(obj);
    }
    return result;
  }
}
