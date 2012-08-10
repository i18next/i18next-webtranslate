define([
    'backbone',
    'namespace'
],

function(Backbone, ns) {
	var app = ns.app;

    // Create a new module
    var module = ns.module({ name: 'charts', append: false, charts: {} });

    var charts = module.charts = {
    
        renderOverview: function(ele, data, options) {
            if (!options) options = {};

            var w = options.width || 800,
                h = w,
                r = w / 2,
                x = d3.scale.linear().range([0, 2 * Math.PI]),
                y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, r]),
                p = 5,
                duration = 1000;

            var div = d3.select(ele);

            var vis = div.append("svg")
                .attr("width", w + p * 2)
                .attr("height", h + p * 2)
              .append("g")
                .attr("transform", "translate(" + (r + p) + "," + (r + p) + ")");

            if (options.appendFooter !== false) {
                div.append("p")
                    .attr("id", "intro")
                    .text("Klicken Sie auf einen Abschnitt um es zu vergrössern!");
            }

            var tooltip = div.append("div")
                .attr('class', 'vis-tooltip')
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .text("a simple tooltip");

            var partition = d3.layout.partition()
                .sort(null)
                .value(function(d) { return 5.8 - d.depth; });

            var arc = d3.svg.arc()
                .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
                .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
                .innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
                .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

          var nodes = partition.nodes({children: data});

          var path = vis.selectAll("path").data(nodes);
          path.enter().append("path")
              .attr("id", function(d, i) { return "path-" + i; })
              .attr("d", arc)
              .attr("fill-rule", "evenodd")
              .style("stroke-width", 1)
              .style("stroke", "#ddd")
              .style("fill", colour)
              .on("click", click)
              .on("mouseover", function(d) {
                  if (d.text) {
                    tooltip.text(d.text);
                    tooltip.style("visibility", "visible");
                  }
                  return;
              })
              .on("mousemove", function() {
                    if (event.pageX > 640) { 
                        var cWidth = tooltip.style("width");
                        cWidth = parseInt(cWidth.substring(0, cWidth.length-2), 10);
                        tooltip
                            .style("top", (event.pageY-10)+"px")
                            .style("left",(event.pageX-(cWidth + 20))+"px");
                    } else {
                        tooltip
                            .style("top", (event.pageY-10)+"px")
                            .style("left",(event.pageX+10)+"px");
                    }
                    return;
                })
              .on("mouseout", function() { return tooltip.style("visibility", "hidden");});

          var text = vis.selectAll("text").data(nodes);
          var textEnter = text.enter().append("text")
              .style("opacity", 1)
              .style("fill", function(d) {
                return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#000";
              })
              .attr("text-anchor", function(d) {
                return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
              })
              .attr("dy", ".2em")
              .attr("y", function(d) {
                  if ((d.name || "").split("\n").length > 1) {
                      return "-" + (((d.name || "").split("\n").length / 2) - 0.5) + "em";
                  } else {
                      return 0;
                  }
              }) 
              .attr("transform", function(d) {
                var multiline = (d.name || "").split("\n").length > 1,
                    angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                    rotate = angle + (multiline ? 0 : 0);
                return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
              })
              .on("click", click);
          textEnter.append("tspan")
              .attr("x", 0)
              .attr("width", 100)
              .text(function(d) { return d.depth ? d.name.split("\n")[0] || "" : ""; });
          textEnter.append("tspan")
              .attr("x", 0)
              .attr("dy", "1em")
              .text(function(d) { return d.depth ? d.name.split("\n")[1] || "" : ""; });
          textEnter.append("tspan")
              .attr("x", 0)
              .attr("dy", "1em")
              .text(function(d) { return d.depth ? d.name.split("\n")[2] || "" : ""; });
          textEnter.append("tspan")
              .attr("x", 0)
              .attr("dy", "1em")
              .text(function(d) { return d.depth ? d.name.split("\n")[3] || "" : ""; });

          function click(d) { 
            if (options.onClick) options.onClick(d);

            if (!d.children) return;

            path.transition()
              .duration(duration)
              .attrTween("d", arcTween(d));

            // Somewhat of a hack as we rely on arcTween updating the scales.
            text
              .style("visibility", function(e) {
                return isParentOf(d, e) ? null : d3.select(this).style("visibility");
              })
              .transition().duration(duration)
              .attrTween("text-anchor", function(d) {
                return function() {
                  return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                };
              })
              .attrTween("transform", function(d) {
                var multiline = (d.name || "").split("\n").length > 1;
                return function() {
                  var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                      rotate = angle + (multiline ? -0.5 : 0);
                  return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
                };
              })
              .style("opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
              .each("end", function(e) {
                d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
              });
          }

            function isParentOf(p, c) {
              if (p === c) return true;
              if (p.children) {
                return p.children.some(function(d) {
                  return isParentOf(d, c);
                });
              }
              return false;
            }

            function colour(d) {
                return d.colour || '#fff';
              // if (d.children) {
              //   // There is a maximum of two children!
              //   var colours = d.children.map(colour),
              //       a = d3.hsl(colours[0]),
              //       b = d3.hsl(colours[1]);
              //   // L*a*b* might be better here...
              //   return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
              // }
              // return d.colour || "#fff";
            }

            // Interpolate the scales!
            function arcTween(d) {
              var my = maxY(d),
                  xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                  yd = d3.interpolate(y.domain(), [d.y, my]),
                  yr = d3.interpolate(y.range(), [d.y ? 20 : 0, r]);
              return function(d) {
                return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
              };
            }

            function maxY(d) {
              return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
            }

            // http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
            function brightness(rgb) {
              return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
            }
        }

    };

    // Required, return the module for AMD compliance
    return module.charts;
});