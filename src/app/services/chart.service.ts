import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})

interface columns {
  x_name: string,
  y_name: string,
  category: string
}

interface sizes {
  height: string,
  width: string
}

export class ChartService {

  constructor() {}

  generateScatterPlot(selector: string, dimensions: sizes, col_names: columns, data: any) {

    const container = d3.select(`#${selector}`);
    const margin = { top: 20, left: 80, bottom: 60, right: 20 };
    
    let width =  dimensions.width - margin.left - margin.right,
        height = dimensions.height - margin.top - margin.bottom;

    let svg = container.append("svg")
                        .attr("width", dimensions.width)
                        .attr("height", dimensions.height)
                        
    let g = svg.append("g")
                .attr("transform", `translate(${ margin.left }, ${ margin.top })`);

    let xScale = d3.scaleLinear().range([0, width]);
    let yScale = d3.scaleLinear().range([height, 0]);
    let colorScale = d3.scaleOrdinal(d3.schemeCategory20);

    xScale.domain(d3.extent(data, d => d['Population_Density']));
    yScale.domain(d3.extent(data, d => d['Population_Growth_Rate']));
    colorScale.domain([ ...new Set( data.map( d => d['Country']) )]);

    console.log(xScale.domain(), yScale.domain(), colorScale.domain());
  }
  
}
