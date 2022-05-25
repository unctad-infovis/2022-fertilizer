import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// https://vis4.net/chromajs/
import chroma from 'chroma-js';

// https://github.com/edeno/d3-save-svg
import d3_save_svg from 'd3-save-svg';

// Use chroma to make the color scale.
// https://gka.github.io/chroma.js/
import fertilizer_img from './../../media/img/fertilizer.png';

const scaleMax = 2.8,
      scaleMin = 1,
      // f = chroma.scale(['rgba(124, 112, 103, 0.4)', '#0077B8']).domain([scaleMax, scaleMin]);
      f = chroma.scale(['rgba(124, 112, 103, 0.4)', 'rgba(124, 112, 103, 0.4)', 'rgba(0, 119, 184, 0.6)', '#0077B8', '#0077B8']).domain([2.8, 2.7, 1.9, 1.3, 1]);
const margin = {top: 0, right: 0, bottom: 0, left: 0},
      inner_radius = 0,
      outer_radius = 300,
      my_domain = [0, 0.2],
      legend_ring_points = [0.1, 0.15, 0.2],
      // height = (window.innerHeight > window.innerWidth) ? window.innerWidth - margin.left - margin.right : window.innerHeight - margin.left - margin.right,
      // width = (window.innerHeight > window.innerWidth) ? window.innerHeight - margin.top - margin.bottom : window.innerWidth - margin.top - margin.bottom;
      height = 1000,
      width = 1100;

const may_push = 0.49;
const x = d3.scaleBand()
  .range([0.06 + Math.PI/2 + may_push, Math.PI * 2 + Math.PI/2 + may_push])
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
const months_data = [{name:'January',value:6},{name:'February',value:6},{name:'March',value:6},{name:'April',value:6},{name:'May',value:5.2},{name:'',value:0.8},{name:'June',value:5.2},{name:'',value:0.8},{name:'July',value:5.2},{name:'',value:0.8},{name:'August',value:5.2},{name:'September',value:6},{name:'October',value:6},{name:'November',value:6},{name:'December',value:6}];

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
    // Create the svg.
    const svg = d3.select('.' + style.chart_container)
      .append('svg')
      // .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', -margin.left + ' ' + -margin.top + ' ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .classed('svg-content', true);

    // Svg chart container.
    chart_elements = svg.append('g')
      .attr('class', style.chart_elements)
      .attr('transform', 'translate(-20, 30)');

    chart_elements.append('g')
      .attr('class', 'months_arcs1')
      .selectAll('path')
      .data(pie(months_data))
      .enter().append('path')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
      .attr('d',  d3.arc().innerRadius(0).outerRadius(300))
      .style('fill', (d) => {
        if (d.index === 4) {
          return 'rgba(197, 223, 239, 0.2)';
        }
        if (d.index === 6) {
          return 'rgba(197, 223, 239, 0.2)';
        }
        if (d.index === 8) {
          return 'rgba(197, 223, 239, 0.2)';
        }
        if (d.index === 10) {
          return 'rgba(197, 223, 239, 0.2)';
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
    setTimeout(() => {
      // Create interactive layer.
      this.createInteractiveLayer(data);
      // Create line legend.
      this.createLineLegend();
    }, 13000);
    d3.select('button#export').on('click', function() {
    var config = {
      filename: 'customFileName',
    }
    d3_save_svg.save(d3.select('svg').node(), config);
  });
  }
  createCenterContainer() {
    const center_diameter = 150;
    chart_elements.append('g')
      .attr('transform', 'translate(' + (width / 2 - center_diameter / 2) + ',' + (height / 2 - center_diameter / 2) + ')')
      .append('foreignObject')
      .style('width', center_diameter + 'px')
      .style('height', center_diameter + 'px')
      .html('<div class="' + style.center_container + '" style="width: ' + center_diameter + 'px; height: ' + center_diameter + 'px;"><img src="' + fertilizer_img + '" /></div>');
  }
  createRadialBars(data) {
    chart_elements.append('g')
      .attr('class', style.bars_container)
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
      .selectAll('path')
      .data(data).enter()
      .append('path')
      .attr('fill', d => ((d.month === 'May' || d.month === 'Jul' || d.month === 'Jun' || d.month === 'Aug') ? f(d['concern']) : f(d['concern'])))
      .attr('data-id', d => d.region)
      .attr('d', d3.arc()
        .innerRadius(d => y(my_domain[0]))
        .outerRadius(d => (d.region !== '') ? y(d['value']) : y(my_domain[0]))
        .startAngle(d => x(d.id))
        .endAngle(d => x(d.id) + x.bandwidth())
        .padRadius(inner_radius))
      .style('opacity', 0)
      .transition()
      .duration(30)
      .delay(d => d.delay_multiplier2 * 30 + d.delay_multiplier * 1000)
      .style('opacity', d => ((d.month === 'May' || d.month === 'Jul' || d.month === 'Jun' || d.month === 'Aug') ? 1 : 1))
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
      .style('stroke', d => (d === 0) ? 'rgba(124, 112, 103, 0.1)' : 'rgba(124, 112, 103, 0.1)')
      .style('stroke-width', d => (d === 0) ? 4 : 2)
      .style('pointer-events', 'none');
    chart_legend_rings.selectAll('text')
      .data(legend_ring_points)
      .join('text')
      .attr('x', d => width / 2 + y(d) + -10)
      .attr('y', d => height / 2 + 7)
      .text(d => (d === 0.2) ? d * 100 + '% of annual procurement' : d * 100 + '%')
      .style('opacity', 1)
      .style('font-size', d => (d === 0) ? '13pt' : '13pt')
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
          .attr('data-id', d => d.region)
          .attr('x', d => (x(d.id) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? -y(my_domain[1]) - 10 : y(my_domain[1]) + 10)
          .attr('y', 0)
          .text(d => d.region)
          .style('font-weight', d => (d.concern < 2 && d.value > 0.10 && (d.month === 'May' || d.month === 'Jul' || d.month === 'Jun' || d.month === 'Aug')) ? 700 : 400)
          .style('fill', d => (d.concern < 1.5 && (d.month === 'May' || d.month === 'Jul' || d.month === 'Jun' || d.month === 'Aug')) ? '#0077B8' :(d.concern < 2 && (d.month === 'May' || d.month === 'Jul' || d.month === 'Jun' || d.month === 'Aug') && d.value > 0.10) ? 'rgba(0, 119, 184, 0.6)' : '#7C7067')
          .style('font-size', d => (d.concern < 2 && d.value > 0.10 && (d.month === 'May' || d.month === 'Jul' || d.month === 'Jun' || d.month === 'Aug')) ? '16pt' : '11pt')
          .style('text-transform', d => (d.concern < 2 && d.value > 0.10 && (d.month === 'May' || d.month === 'Jul' || d.month === 'Jun' || d.month === 'Aug')) ? 'uppercase' : 'none')
          .style('dominant-baseline', 'middle')
          .attr('transform', d => (x(d.id) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? 'rotate(180)' : 'rotate(0)')
          .style('opacity', 0)
          .transition()
          .duration(30)
          .delay((d, i) => d.delay_multiplier2 * 30 + d.delay_multiplier * 1000)
          .style('opacity', 1);
        // Radial line
        d3.select(nodes[i]).append('line')
          .attr('x1', 75)
          .attr('x2', y(my_domain[1]) + 5)
          .attr('y1', 0)
          .attr('y2', 0)
          .style('opacity', d => (d.region === '') ? 0 : 0.5)
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
      .attr('d',  d3.arc().innerRadius(270).outerRadius(271))
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
      .style('fill', d => (d.index === 4 || d.index === 6 || d.index === 8 || d.index === 10) ? '#0077B8' : '#6e6259')
      .style('font-weight', d => (d.index === 4 || d.index === 6 || d.index === 8 || d.index === 10) ? 700 : 400)
      .attr('xlink:href', (d, i) => '#months_arc' + i)
      .text((d) => d.data.name);
  }
  createLineLegend() {
    chart_elements.append('defs')
      .append('marker')
        .attr('id', 'arrow1')
        .attr('refX', 10)
        .attr('refY', 10)
        .attr('markerWidth', 36)
        .attr('markerHeight', 36)
        .attr('markerUnits','userSpaceOnUse')
        .attr('orient', 'auto')
        .attr('fill', '#000')
      .append('path')
        .attr('d', 'M 0 0 20 10 0 20 6 10')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .attr('stroke', 'rgba(0, 0, 0, 1)');
    chart_elements.append('defs')
      .append('marker')
        .attr('id', 'arrow2')
        .attr('refX', 10)
        .attr('refY', 10)
        .attr('markerWidth', 36)
        .attr('markerHeight', 36)
        .attr('markerUnits','userSpaceOnUse')
        .attr('orient', 'auto')
        .attr('fill', 'rgba(0, 0, 0, 1)')
      .append('path')
        .attr('d', 'M 0 0 20 10 0 20 6 10')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .attr('stroke', 'rgba(0, 0, 0, 1)');
    chart_elements.append('defs')
      .append('marker')
        .attr('id', 'arrow3')
        .attr('refX', 10)
        .attr('refY', 10)
        .attr('markerWidth', 36)
        .attr('markerHeight', 36)
        .attr('markerUnits','userSpaceOnUse')
        .attr('orient', 'auto')
        .attr('fill', 'rgba(0, 0, 0, 1)')
      .append('path')
        .attr('d', 'M 0 0 20 10 0 20 6 10')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .attr('stroke', 'rgba(0, 0, 0, 1)');
    // Africa
    setTimeout(() => {
      chart_elements.append('path')
        .attr('d', d3.line()([[930, 870],[885, 810]]))
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        .attr('class', style.legend_path)
        .attr('stroke-width', '3px')
        .attr('stroke-dasharray', '5,5')
        .attr('marker-end', 'url(#arrow1)');
      chart_elements.append('path')
        .attr('d', d3.line()([[830, 920],[740, 910]]))
        .attr('class', style.legend_path)
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        .attr('stroke-width', '3px')
        .attr('stroke-dasharray', '5,5')
        .attr('marker-end', 'url(#arrow1)');
      chart_elements.append('text')
        .attr('transform', 'translate(840, 900)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .html('In Africa farmers');
      chart_elements.append('text')
        .attr('transform', 'translate(840, 925)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .html('<tspan>urgently</tspan> need');
      chart_elements.append('text')
        .attr('transform', 'translate(840, 954)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .html('fertilizer imports');
    }, 500);

    // Latin America
    setTimeout(() => {
      chart_elements.append('path')
        .attr('d', d3.line()([[160, 820],[415, 680]]))
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        .attr('class', style.legend_path)
        .attr('stroke-width', '3px')
        .attr('stroke-dasharray', '5,5')
        .attr('marker-end', 'url(#arrow2)');
      chart_elements.append('path')
        .attr('d', d3.line()([[150, 820],[402, 525]]))
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        .attr('class', style.legend_path)
        .attr('stroke-width', '3px')
        .attr('stroke-dasharray', '5,5')
        .attr('marker-end', 'url(#arrow2)');
      chart_elements.append('text')
        .attr('transform', 'translate(50, 850)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .html('In Latin America');
      chart_elements.append('text')
        .attr('transform', 'translate(50, 875)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .style('font-family', 'Roboto')
        .html('and South-East Asia,');
      chart_elements.append('text')
        .attr('transform', 'translate(50, 900)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .html('farmers appear to');
      chart_elements.append('text')
        .attr('transform', 'translate(50, 925)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', 'rgba(0, 0, 0, 1)')
        .html('be better sourced');
    }, 2000);

    // South Asia
    setTimeout(() => {
      chart_elements.append('path')
        .attr('d', d3.line()([[170, 240],[265, 390]]))
        .attr('stroke', 'rgba(0, 0, 0, 1)')
        .attr('class', style.legend_path)
        .attr('stroke-width', '3px')
        .attr('stroke-dasharray', '5,5')
        .attr('marker-end', 'url(#arrow3)');
      chart_elements.append('text')
        .attr('transform', 'translate(50, 150)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', '#000')
        .html('In South Asia,');
      chart_elements.append('text')
        .attr('transform', 'translate(50, 175)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', '#000')
        .html('some countries');
      chart_elements.append('text')
        .attr('transform', 'translate(50, 200)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', '#000')
        .html('may face challenges');
      chart_elements.append('text')
        .attr('transform', 'translate(50, 225)rotate(0)')
        .attr('class', style.legend_text)
        .attr('text-anchor', 'start')
        .attr('fill', '#000')
        .html('later this year');
    }, 4000);
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
      .attr('data-id', d => d.region)
      .attr('fill', 'transparent')
      .attr('d', d3.arc()
        .innerRadius(outer_radius)
        .outerRadius(outer_radius + 100)
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
        .selectAll('path:not(path[data-id="' + d.region + '"])')
        .style('opacity', 0.0);
      d3.select('.' + style.bars_info_container)
        .select('text[data-id="' + d.region + '"]')
        .style('opacity', 1);
      d3.select('.' + style.bars_info_container)
        .selectAll('text:not(text[data-id="' + d.region + '"])')
        .style('opacity', 0.0);
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
          <h1>In Africa countries are in urgent need<br />of fertilizer but lack supplies</h1>
        </div>
        <div className={style.chart_container} id="svg"></div>
        <div className={style.scales_container}>
          {
            // The scale on the right.
            scales.map((scale, i) => (<div key={i} className={style.scale_container} style={{backgroundColor:f(scale)}}></div>))
          }
        </div>
        <div className={style.meta_container}>
          <div>Relative fertilizer procurement and the priority for selected areas</div>
          <div>Source: <a href="https://unctad.org">UNCTAD</a></div>
        </div>
        <div className={style.tooltip}></div>
        <div><button id="export">Export SVG</button></div>
      </div>
    );
  }
}
export default App;

