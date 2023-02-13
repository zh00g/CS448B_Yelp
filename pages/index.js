import Head from 'next/head';
import * as d3 from 'd3';
import {event as currentEvent} from 'd3';
import styles from '../styles/Home.module.css';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Slider } from '@mui/material';
import Box from '@mui/material/Box';


//brak down data loding into sep func
function parseCoord(coord) {
  let idx = coord.indexOf(",");
  return idx;
}



function drawMap(svgRef, filterButton, rating) {
  let width = 1200;
  let height = 1200;
  if (filterButton === true) {
    d3.selectAll("svg").remove();
  }
  const svg = d3.select(svgRef.current)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMinYMin meet")
  
  //Define path generator

  var path = d3.geoPath()
    .projection(projection);
  var center = [-122.1430, 37.4419];
  var scale = 30000;
  var offset = [width / 2, height / 2];
  console.log("center", center)
  var projection = d3.geoMercator().center(center).scale(scale)
    .translate(offset);
  path = path.projection(projection);


  //get draggable points A and B

  let locA = [600,600];
  const radiusA = svg.append("circle")
  .attr("cx", locA[0])
  .attr("cy", locA[1])
  .attr("r", 400)
  .attr("fill", "red")
  .attr('opacity', 0.3)
  .attr("id", "radiusA")
  .style("z-index", 50);

  

  d3.json('/Bay_Area.json')
    .then((data) => {
      console.log("json", data);
      //Binding data and creating one path per GeoJSON feature
      svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "dimgray")
        .attr('fill', 'lightsteelblue');
      console.log("svg3?", svg);
    })
    .catch((err) => {
      console.log("error");
    });

  d3.csv('/asst3_yelp.csv')
    .then((data) => {
      if (rating) {
        console.log("button true");
        data = data.filter(function (d) {
          return (d.rating === rating)
        })
      }
      console.log(data);

      let tooltip = d3.select("main")
        .append("div")
        .style("position", "fixed")
        .style("text-align", "left")
        .style("padding", "5px")
        .style("font", "12px sans-serif")
        .style("background", "white")
        .style("opacity", "0.8")
        .style("border", "1px solid black")
        .style("border-radius", "10px")
        .style("z-index", "10")
        .style("visibility", "hidden")

      const circleGroup = svg
        .append("g")
        .attr("id", "circleGroup")
        .selectAll("circle")
        .data(data)
        // .enter()
        // .append("circle")
        .join(
          enter => enter.append("circle")
            .attr("cx", (d) => {
              let idx = parseCoord(d.coordinates);
              let long = d.coordinates.slice(idx + 1);
              let lat = d.coordinates.slice(0, idx);
              let cx = ([+long, +lat]);
              return projection(cx)[0];
            })
            .attr("cy", (d) => {
              let idx = parseCoord(d.coordinates);
              let long = d.coordinates.slice(idx + 1);
              let lat = d.coordinates.slice(0, idx);
              let cy = ([+long, +lat]);
              return projection(cy)[1];
            })
            .attr("r", 1)
            .style("fill", 'black')
            .attr("stroke-width", 1)
            .attr("fill-opacity", 0.6)
            .on("mouseover", (data, event) => {
              return tooltip.style("visibility", "visible");
            })
            .on("mousemove", (event, data) => {
              return tooltip.style("top",
                (event.clientY) + "px").
                style("left", (event.clientX) + "px")
                .html(data.name
                  + "<br><br>" + "Rating:" + data.rating
                  + "<br><br>" + "Cuisine:" + data.categories);
            })
            .on("mouseleave", (data, event) => {
              return tooltip.style("visibility", "hidden");
            })
            .on("centerMove", function(d) {
              d3.select(this).attr("fill", inBothCircle(d));
            }),
          update => update,
          // Add code to customize how countries exit the scene.
          // Idea: use transition to fade out to transparent and shrink to zero size before removal
          exit => exit.transition()
            .attr('r', d => 0)
            .attr('opacity', 0)
            .remove()
        )

      
    
      console.log("end of csv");
    })
    .catch((err) => {
      console.log(err)
      console.log("csv error");
    });
}

function updateMap(svgRef, locA, locB) {
  console.log("shit and balls");
  //define l
  const svg = d3.select(svgRef.current).select("svg");


  var dragger = d3.drag()
    .on("drag", (event, d) => {
      d3.select("#pointA")
        .attr("cx", event.x)
        .attr("cy", event.y);
      locA = [event.x, event.y];
      setLocA([event.x, event.y]);
      d3.select("#radiusA")
        .attr("cx", event.x)
        .attr("cy", event.y);
    });
  var dragger2 = d3.drag()
    .on("drag", (event, d) => {
      d3.select("#pointB")
        .attr("cx", event.x)
        .attr("cy", event.y);
      locB = [event.x, event.y];
      setLocB([event.x, event.y]);
      d3.select("#radiusB")
        .attr("cx", event.x)
        .attr("cy", event.y);
    });
  
  const radiusA = svg.append("circle")
    .attr("cx", locA[0])
    .attr("cy", locA[1])
    .attr("r", 400)
    .attr("fill", "red")
    .attr('opacity', 0.3)
    .attr("id", "radiusA")
    .style("z-index", 25);
  const radiusB = svg.append("circle")
    .attr("cx", locB[0])
    .attr("cy", locB[1])
    .attr("r", 400)
    .attr("fill", "blue")
    .attr('opacity', 0.3)
    .attr("id", "radiusB")
    .style("z-index", 0);

  const pointA = svg.append("circle")
    .attr("cx", locA[0])
    .attr("cy", locA[1])
    .attr("r", 5)
    .attr("fill", "red")
    .attr("id", "pointA")
    .attr("stroke", "black")
    .style("z-index", 10)
    .call(dragger);
  const pointB = svg.append("circle")
    .attr("cx", locB[0])
    .attr("cy", locB[1])
    .attr("r", 5)
    .attr("fill", "blue")
    .attr("id", "pointB")
    .style("z-index", 10)
    .attr("stroke", "black")
    .call(dragger2);
  
  /**
  svg.select("#circleGroup").selectAll('.data-point')
  .style('fill', d => {
    const distanceToLocA = Math.sqrt(Math.pow(d.x - locA.x, 2) + Math.pow(d.y - locA.y, 2));
    const distanceToLocB = Math.sqrt(Math.pow(d.x - locB.x, 2) + Math.pow(d.y - locB.y, 2));
    return (distanceToLocA >= 500 && distanceToLocB >= 500) ? 'black' : 'grey';
  });
  function inBothCircle(d) {
    let idx = parseCoord(d.coordinates);
    let long = d.coordinates.slice(idx + 1);
    let lat = d.coordinates.slice(0, idx);
    let cx = ([+long, +lat]);
    let distA = Math.sqrt(Math.pow(projection(cx)[0] - locA[0],2) + Math.pow(projection(cx)[1] - locA[1],2));
    let distB = Math.sqrt(Math.pow(projection(cx)[0] - locB[0],2) + Math.pow(projection(cx)[1] - locB[1],2));
    if (distA >= radiusA && distB >= radiusB) {
      return true;
    }
    else {
      return false;
    }
  }
  */
}

export default function Home() {
  const [filterButton, setFilterButton] = useState(true);
  const [rating, setRating] = useState("");
  const [locA, setLocA] = useState([600,600]);
  const [locB, setLocB] = useState([594,594]);

  const handleSlider = (event, newRating) => {
    if (newRating === 4) {
      setRating("4.0");
    }
    else if (newRating === 3) {
      setRating("3.0")
    }
    else if (newRating === 4.5) {
      setRating("4.5")
    }
    else if (newRating === 3.5) {
      setRating("3.5")
    }
    else if (newRating === 5) {
      setRating("5.0")
    }
  };

  const marks = [
    {
      value: "3.0",
      label: '3.0',
    },
    {
      value: "3.5",
      label: '3.5',
    },
    {
      value: "4.0",
      label: '4.0',
    },
    {
      value: "4.5",
      label: '4.5',
    },
    {
      value: "5.0",
      label: '5.0',
    },
  ];

  const svg = useRef();
  useEffect(() => {
    updateMap(svg, locA, locB);
  },[locA, locB]);
  
  useEffect(() => {
    drawMap(svg, filterButton, rating);
  }, [rating]);



  // const handleFilter = () => {
  //   console.log("button pressed");
  //   console.log("rating", rating)
  //   setFilterButton(true);
  // }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          Yelp Viz!
        </h1>

        <p className={styles.description}>
          pls where is my <code>map</code>
        </p>

        <Box sx={{ width: 300 }}>
          <Slider
            aria-label="Custom marks"
            min={3.0}
            onChange={handleSlider}
            step={0.5}
            max={5.0}
            valueLabelDisplay="auto"
            marks={marks}
          />
        </Box>

        <svg-container ref={svg}>
        

        </svg-container>

      </main>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        svg-container {
          display: inline-block;
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          vertical-align: top;
          overflow: hidden;
      }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
