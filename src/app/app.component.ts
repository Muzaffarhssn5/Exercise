import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
@Component({
  selector: 'my-app',
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

  totalPopulation: number = 0;

  constructor(private data: DataService) {}

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
      },
      error: (err: any) => {},
    });
  }

  filterByYear(year: any) {
    this.filteredPopulationData = this.uniqueYears.filter(
      (item: any) => item.Year == year
    );

    this.totalPopulation = this.filteredPopulationData.reduce(
      (sum: any, val: any) => sum + Number(val['Population (000s)']),
      0
    );
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
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return result;
  }
}
