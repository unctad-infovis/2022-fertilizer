import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// https://vis4.net/chromajs/
import chroma from 'chroma-js';
// Use chroma to make the color scale.
// https://gka.github.io/chroma.js/
const scaleMax = 3,
      scaleMin = 1,
      f = chroma.scale(['rgba(174, 162, 154, 0.05)', '#ED1847']).domain([scaleMax, scaleMin]);
const margin = {top: 0, right: 0, bottom: 0, left: 0},
      inner_radius = 0,
      outer_radius = 350,
      my_domain = [0, 0.2],
      legend_ring_points = [0.05, 0.1, 0.15, 0.2],
      height = (window.innerHeight > window.innerWidth) ? window.innerWidth - margin.left - margin.right : window.innerHeight - margin.left - margin.right,
      width = (window.innerHeight > window.innerWidth) ? window.innerHeight - margin.top - margin.bottom : window.innerWidth - margin.top - margin.bottom;

const x = d3.scaleBand()
  .range([0.06, Math.PI * 2 - 0.1])
  .align(0);
const y = d3.scaleLinear()
  .range([inner_radius, outer_radius])
  .domain(my_domain);

let chart_elements,
    scales = [],
    temperature = scaleMax;
while (temperature > scaleMin) {
  temperature = temperature - 0.025;
  scales.push(temperature);
}

const pie = d3.pie()
  .startAngle(0.025)
  .endAngle(Math.PI * 2 - 0.05)
  .value(d => d.value)
  .sort(null);
const months_data = [{
    name:'January',
    value:6
  },{
    name:'February',
    value:6
  },{
    name:'March',
    value:6
  },{
    name:'April',
    value:6
  },{
    name:'May',
    value:5.2
  },{
    name:'',
    value:0.8
  },{
    name:'June',
    value:5.2
  },{
    name:'',
    value:0.8
  },{
    name:'July',
    value:5.2
  },{
    name:'',
    value:0.8
  },{
    name:'August',
    value:5.2
  },{
    name:'September',
    value:6
  },{
    name:'October',
    value:6
  },{
    name:'November',
    value:6
  },{
    name:'December',
    value:6
  }];

class App extends Component {
  constructor(props) {
    super(props);
  
  }
  componentDidMount() {
    this.getData();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {
  }
  getData() {
    d3.json('./data/data.json').then((data) => {
      x.domain(data.map(d => d.id));
      this.data = data;
      this.createRadialChart(data);
    });
  }
  createRadialChart(data) {
    // Define contants.
    // Create the svg.
    const svg = d3.select('.' + style.chart_container)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '-0 -0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .classed('svg-content', true);

    // Svg chart container.
    chart_elements = svg.append('g')
      .attr('class', style.chart_elements)
      .attr('transform', 'translate(0, ' + margin.top + ')');

    chart_elements.append('g')
      .attr('class', 'months_arcs1')
      .selectAll('path')
      .data(pie(months_data))
      .enter().append('path')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
      .attr('d',  d3.arc().innerRadius(0).outerRadius(350))
      .style('fill', (d) => {
        if (d.index === 4) {
          return 'rgba(247, 223, 223, 0.8)';
        }
        if (d.index === 6) {
          return 'rgba(247, 223, 223, 0.6)';
        }
        if (d.index === 8) {
          return 'rgba(247, 223, 223, 0.4)';
        }
        if (d.index === 10) {
          return 'rgba(247, 223, 223, 0.2)';
        }
        else {
          return 'transparent';
        }
      })
      .each((d, i, nodes) => {
        let first_arc_section = /(^.+?)L/;  
        let new_arc = first_arc_section.exec(d3.select(nodes[i]).attr('d'))[1].replace(/,/g , ' ');;
        // Reverse the path if needed.
        if (d.endAngle > (100 * Math.PI / 180) && d.endAngle < (270 * Math.PI / 180)) {
          const start_loc = /M(.*?)A/,
                middle_loc  = /A(.*?)0 0 1/,
                end_loc = /0 0 1 (.*?)$/;
          const new_start = end_loc.exec(new_arc)[1];
          const new_end = start_loc.exec(new_arc)[1];
          const middle_sec = middle_loc.exec(new_arc)[1];
          new_arc = 'M' + new_start + 'A' + middle_sec + '0 0 0 ' + new_end;
        }
    });

    // Create radial bars.
    this.createRadialBars(data);
    // Create the center container.
    this.createCenterContainer();
    // Create radial rings.
    this.createRadialRings();
    // Create bar info.
    this.createBarInfo(data);
    // Create interactive layer.
    this.createInteractiveLayer(data);
    // Create line legend.
    // this.createLineLegend();
  }
  createCenterContainer() {
    const center_diameter = 175;
    chart_elements.append('g')
      .attr('transform', 'translate(' + (width / 2 - center_diameter / 2) + ',' + (height / 2 - center_diameter / 2) + ')')
      .append('foreignObject')
      .style('width', center_diameter + 'px')
      .style('height', center_diameter + 'px')
      .html('<div class="' + style.center_container + '" style="width: ' + center_diameter + 'px; height: ' + center_diameter + 'px;"></div>');
    chart_elements.append('g')
      .attr('class', style.center_text)
      .append('text')
      .attr('y', margin.top + height / 2)
      .style('text-anchor', 'middle')
      .html('<tspan class="' + style.year_text + '"x="' + (width / 2) + '" y="' + (margin.top + (height / 2) - 35) + '">Priority</tspan><tspan class="' + style.year + '" x="' + (width / 2) + '" y="' + (margin.top + (height / 2) + 12) + '">in May</tspan><tspan class="' + style.temp + '" x="' + (width / 2) + '" y="' + (margin.top + (height / 2) + 45) + '">to Africa</tspan>');
  }
  createRadialBars(data) {
    chart_elements.append('g')
      .attr('class', style.bars_container)
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
      .selectAll('path')
      .data(data).enter()
      .append('path')
      .attr('fill', d => f(d['concern']))
      .attr('data-id', d => d.id)
      .attr('d', d3.arc()
        .innerRadius(d => y(my_domain[0]))
        .outerRadius(d => (d.region !== '') ? y(d['value']) : y(my_domain[0]))
        .startAngle(d => x(d.id))
        .endAngle(d => x(d.id) + x.bandwidth())
        .padRadius(inner_radius))
      .attr('opacity', 0)
      .transition()
      .duration(300)
      .delay((d, i) => i * 30)
      .attr('opacity', 1)
      .style('pointer-events', 'none');
  }
  createRadialRings() {
    const chart_legend_rings = chart_elements.append('g').attr('class', style.chart_legend_rings);
    chart_legend_rings.selectAll('circle')
      .data(legend_ring_points)
      .join('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', d => y(d))
      .style('fill', 'none')
      .style('stroke', d => (d === 0) ? 'rgba(235, 234, 230, 0.5)' : 'rgba(235, 234, 230, 0.5)')
      .style('stroke-width', d => (d === 0) ? 4 : 2)
      .style('pointer-events', 'none');
    chart_legend_rings.selectAll('text')
      .data(legend_ring_points)
      .join('text')
      .attr('x', d => width / 2 + y(d) + 3)
      .attr('y', d => height / 2 + 3)
      .text(d => (d > 0) ? '' + d * 100 + '%' : d * 100 + '%')
      .style('opacity', 0.7)
      .style('font-size', d => (d === 0) ? '11pt' : '11pt')
      .style('font-weight', d => (d === 0) ? 700 : 700)
      .style('pointer-events', 'none');
  }
  createBarInfo(data) {
    chart_elements.append('g')
      .attr('class', style.bars_info_container)
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
      .selectAll('g')
      .data(data).enter()
      .append('g')
      .attr('class', style.bar_info_container)
      .attr('id', d => d.id)
      .attr('opacity', 1)
      .attr('transform', d => 'rotate(' + (((x(d.id) + x.bandwidth() / 2) * 180) / Math.PI - 90) + ')')
      .attr('text-anchor', d => (x(d.id) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? 'end' : 'start')
      .each((d, i, nodes) => {
        // Name.
        d3.select(nodes[i]).append('text')
          .attr('data-id', d => d.id)
          .attr('x', d => (x(d.id) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? -y(my_domain[1]) - 10 : y(my_domain[1]) + 10)
          .attr('y', 0)
          .text(d => d.region)
          .style('font-weight', d => (d.concern < 1.5 && d.value > 0.10) ? 700 : 400)
          .style('fill', d => (d.concern < 1.5 && d.value > 0.10) ? '#ED1847' : '#AEA29A')
          .style('font-size', d => (d.concern < 1.5 && d.value > 0.10) ? '12pt' : '9pt')
          .style('dominant-baseline', 'middle')
          .attr('transform', d => (x(d.id) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? 'rotate(180)' : 'rotate(0)')
        // Radial line
        d3.select(nodes[i]).append('line')
          .attr('x1', 87)
          .attr('x2', y(my_domain[1]) + 5)
          .attr('y1', 0)
          .attr('y2', 0)
          .style('opacity', (d) => {
            return (d.region === '') ? 0 : 0.5
          })
          .style('stroke', '#000')
          .style('stroke-width', 0.15);
      })
      .style('pointer-events', 'none');

    chart_elements.append('g')
      .attr('class', 'months_arcs')
      .selectAll('path')
      .data(pie(months_data))
      .enter().append('path')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
      .attr('d',  d3.arc().innerRadius(300).outerRadius(301))
      .style('fill', (d) => 'transparent')
      .each((d, i, nodes) => {
        let first_arc_section = /(^.+?)L/;  
        let new_arc = first_arc_section.exec(d3.select(nodes[i]).attr('d'))[1].replace(/,/g , ' ');;
        // Reverse the path if needed.
        if (d.endAngle > (100 * Math.PI / 180) && d.endAngle < (270 * Math.PI / 180)) {
          const start_loc = /M(.*?)A/,
                middle_loc  = /A(.*?)0 0 1/,
                end_loc = /0 0 1 (.*?)$/;
          const new_start = end_loc.exec(new_arc)[1];
          const new_end = start_loc.exec(new_arc)[1];
          const middle_sec = middle_loc.exec(new_arc)[1];
          new_arc = 'M' + new_start + 'A' + middle_sec + '0 0 0 ' + new_end;
        }
        d3.select('.months_arcs').append('path')
          .attr('class', 'hidden_months_arcs')
          .attr('id', 'months_arc' + i)
          .attr('d', new_arc)
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
          .style('fill', 'none');
    });
    //Append the months names within the arcs.
    chart_elements.append('g')
      .attr('class', style.months_text)
      .selectAll('text')
      .data(pie(months_data))
      .enter().append('text')
      .attr('dy', d => (d.endAngle > (90 * Math.PI / 180) && d.endAngle < (270 * Math.PI / 180) ? 10 : 0))
      .append('textPath')
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .style('fill', (d) => {
        return (d.index === 4) ? '#ED1847' : '#6E6259';
      })
      .attr('xlink:href', (d, i) => '#months_arc' + i)
      .text((d) => d.data.name);
  }
  createLineLegend() {
    chart_elements.append('defs')
      .append('marker')
        .attr('id', 'arrow')
        .attr('refX', 6)
        .attr('refY', 6)
        .attr('markerWidth', 30)
        .attr('markerHeight', 30)
        .attr('markerUnits','userSpaceOnUse')
        .attr('orient', 'auto')
        .attr('fill', '#000')
      .append('path')
        .attr('d', 'M 0 0 12 6 0 12 3 6')
        .attr('fill', '#000')
        .attr('stroke', '#000');

    chart_elements.append('path')
      .attr('d', d3.line()([[1060, 650], [770, 650]]))
      .attr('stroke', '#000')
      .attr('marker-end', 'url(#arrow)')
      .attr('fill', 'none');
    chart_elements.append('text')
      .attr('transform', 'translate(780, 645)rotate(0)')
      .attr('class', style.legend_text)
      .attr('text-anchor', 'start')
      .text('High priority & High demand');

    chart_elements.append('path')
      .attr('d', d3.line()([[160, 700], [440, 700]]))
      .attr('stroke', '#000')
      .attr('marker-end', 'url(#arrow)')
      .attr('fill', 'none');
    chart_elements.append('text')
      .attr('transform', 'translate(160, 695)rotate(0)')
      .attr('class', style.legend_text)
      .attr('text-anchor', 'start')
      .text('Low priority & High demand');
  }
  createInteractiveLayer(data) {
    // Interactive layer.
    chart_elements.selectAll('.' + style.bars_aux).remove();
    chart_elements.append('g')
      .attr('class', style.bars_aux)
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
      .selectAll('a')
      .data(data).enter()
      .append('a')
      .attr('target', '_blank')
      .attr('href', d => '')
      .append('path')
      .attr('class', style.aux)
      .attr('data-id', d => d.id)
      .attr('fill', 'transparent')
      .attr('d', d3.arc()
        .innerRadius(inner_radius)
        .outerRadius(outer_radius + 35)
        .startAngle(d => x(d.id))
        .endAngle(d => x(d.id) + x.bandwidth())
        .padRadius(inner_radius))
      // https://stackoverflow.com/questions/63693132/unable-to-get-node-datum-on-mouseover-in-d3-v6
      .on('mouseover', (event, d) => this.onMouseOver(event, d))
      .on('mouseout', (event, d) => this.onMouseOut(event, d));
  }
  onMouseOver(event, d) {
    if (d.region !== '') {
      d3.select('.' + style.bars_container)
        .selectAll('path:not(path[data-id="' + d.id + '"])')
        .style('opacity', 0.2);
      d3.select('.' + style.bars_info_container)
        .select('text[data-id="' + d.id + '"]')
        .style('opacity', 1);
      d3.select('.' + style.bars_info_container)
        .selectAll('text:not(text[data-id="' + d.id + '"])')
        .style('opacity', 0.2);
      d3.select(event.currentTarget).style('opacity', 1);
      d3.select('.' + style.tooltip)
        .style('left', (event.pageX + 20) + 'px')
        .style('top', (event.pageY + 20) + 'px')
        .style('opacity', 1)
        .html(d.region + ': ' + ((d.value > 0) ? '' : '') + (d.value * 100).toFixed(0) + '%');
    }
  }
  onMouseOut(event, d) {
    d3.select(event.currentTarget).style('opacity', 0.8);
    d3.select('.' + style.bars_container)
      .selectAll('path')
      .style('opacity', 1);
    d3.select('.' + style.bars_info_container)
      .selectAll('text')
      .style('opacity', d => 1);
    d3.select('.' + style.tooltip)
      .style('opacity', 0)
  }

  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <div className={style.heading_container}>
          <h1>Relative fertilizer procurement</h1>
        </div>
        <div className={style.chart_container}></div>
        <div className={style.scales_container}>
          {
            // The scale on the right.
            scales.map((scale, i) => (<div key={i} className={style.scale_container} style={{backgroundColor:f(scale)}}></div>))
          }
          <div className={style.scale_label}>Relative procurement</div>
        </div>
        <div className={style.meta_container}>
          <div>Relative fertilizer procurement and the priority for selected areas</div>
          <div>Source: <a href="https://unctad.org">UNCTAD</a></div>
        </div>
        <div className={style.tooltip}></div>
      </div>
    );
  }
}
export default App;