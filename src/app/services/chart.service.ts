import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})

export class ChartService {

  constructor() {}

  generateScatterPlot(selector: string, dimensions: any, data: any) {

    const container = d3.select(`#${selector}`);
    const margin = { top: 20, left: 40, bottom: 60, right: 40 };

    let tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style("padding", "10px")
                    .style("line-height", "20px")
                    .style("font-weight", "bold")
                    .style("background", "#000")
                    .style("width", "200px")
                    .style("color", "#FFF");

    let width: any =  dimensions.width - margin.left - margin.right,
        height: number = dimensions.height - margin.top - margin.bottom;

    container.select("*").remove();

    let svg = container.append("svg")
                        .attr("width", dimensions.width)
                        .attr("height", dimensions.height)
                        
    let g = svg.append("g")
                .attr("transform", `translate(${ margin.left }, ${ margin.top })`);

    let xScale: any = d3.scaleLinear().range([0, width]);
    let yScale: any = d3.scaleLinear().range([height, 0]);
    let radiusScale: any = d3.scaleLinear().range([4, 20]);
    let colorScale: any = d3.scaleOrdinal(d3.schemeAccent);

    xScale.domain([0, 800]);
    yScale.domain(d3.extent(data, (d: any) => +d['Population_Growth_Rate']));
    radiusScale.domain(d3.extent(data, (d: any) => +d['Population (000s)']));
    colorScale.domain([ ...new Set( data.map( (d: any) => d['Country']) )]);

    console.log(colorScale.domain());
    
    g.append("g")
      .attr("class", "axis--x")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .attr("class", "axis--y")
      .call(d3.axisLeft(yScale));

    g.append('g')
      .attr('class', 'circle_group')
      .selectAll("circle")
      .data(data)
      .enter()
      .append('circle')
      // .attr('class', 'circle')
      .attr('cx', (d: any) => {
        if(+d['Population_Density'] > 800) {
          return xScale(800)
        }
        return xScale(+d['Population_Density'])
      })
      .attr('cy', (d: any) => yScale(+d['Population_Growth_Rate']))
      .attr("r", (d: any) => radiusScale(+d['Population (000s)']))
      .attr("fill", (d: any) => colorScale(d['Country']))
      .on("mouseover", (event, d: any) => {
        console.log(d)
        tooltip.html(
          `<div>
              <div style="font-weight: bold">${d['Country']}</div>
              <div>Population: ${this.convertToInternationalCurrencySystem(d['Population (000s)']*1000)}</div>
              <div>Density: ${d['Population_Density']}</div>
              <div>Growth Rate: ${d['Population_Growth_Rate']}</div>
          </div>`
        ); 
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", (event, d) => {
        return event.pageX > (width - 100) ? 
          tooltip
                      .style("top", (event.pageY-10)+"px")
                      .style("right",(width - event.pageX+200)+"px")
          :
          tooltip
                      .style("top", (event.pageY-10)+"px")
                      .style("left",(event.pageX+10)+"px");
      })
      .on("mouseout", function(event, d){
        return tooltip.style("visibility", "hidden");
      });

  }

  generateAreaPlot(selector: string, dimensions: any, data: any, years: any) {

    const container = d3.select(`#${selector}`);
    const margin = { top: 0, left: 0, bottom: 20, right: 0 };

    let width: any =  dimensions.width,
        height: number = dimensions.height - margin.bottom - margin.top - 10;

    container.select("*").remove();

    let svg = container.append("svg")
                        .attr("width", dimensions.width)
                        .attr("height", dimensions.height)
                        
    let g = svg.append("g");

    let xScale: any = d3.scaleLinear().range([0, width]);
    let yScale: any = d3.scaleLinear().range([height, 0]);

    let groupedData: any = {}

    years.forEach(( dat: any) => {
      if(!groupedData[dat]) {
        groupedData[dat] = {}
      } 
      
      groupedData[dat]['year'] = dat;
      groupedData[dat]['population'] = data.reduce( (sum: any, ite: any) => {
        if(ite['Year'] == dat) { 
          return sum + (+ite['Population (000s)'])
        } else {
          return sum;
        }
      }, 0)
    });

    groupedData = Object.values(groupedData);

    xScale.domain(d3.extent(groupedData, (d: any) => d3.timeParse("%Y")(d['year']) ));
    yScale.domain([0, d3.max(groupedData, (d: any) => +d['population'])]);
    
    g.append("path")
      .datum(groupedData)
      .attr("fill", "#cce5df")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("d", d3.area()
        .x((d: any) => xScale(d3.timeParse("%Y")(d['year'])))
        .y0(yScale(0))
        .y1((d: any) => yScale(d['population']))
      )

    g.append('text')
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .attr('x', 0)
      .attr('y', yScale(groupedData[0]['population']) - 10)
      .text(this.convertToInternationalCurrencySystem(groupedData[0]['population']*1000))

    g.append('text')
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .attr('x', width - 45)
      .attr('y', yScale(groupedData.slice(-1)[0]['population']) + 15)
      .text(this.convertToInternationalCurrencySystem(groupedData.slice(-1)[0]['population']*1000))
 
    svg.append('text')
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .attr('x', 0)
      .attr('y', height + 15)
      .text(years[0])

    svg.append('text')
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .attr('x', width - 35)
      .attr('y', height + 15)
      .text(years.slice(-1)[0])
  }

  convertToInternationalCurrencySystem (total: number) {

    // Nine Zeroes for Billions
    return Math.abs(Number(total)) >= 1.0e+9

    ? (Math.abs(Number(total)) / 1.0e+9).toFixed(2) + "Bn"
    : Math.abs(Number(total)) >= 1.0e+6

    ? (Math.abs(Number(total)) / 1.0e+6).toFixed(2) + "Mn"
    : Math.abs(Number(total)) >= 1.0e+3
    
    ? (Math.abs(Number(total)) / 1.0e+3).toFixed(2) + "K"
    : Math.abs(Number(total));
  }
  
}
