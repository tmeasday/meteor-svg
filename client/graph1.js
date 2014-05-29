WIDTH = 300;
HEIGHT = 200;

Template.graph1.helpers({
  line: function() {
    var points = [
        {'x': 3,  'y': 7 },
        {'x': 5,  'y': 15},
        {'x': 7,  'y': 8 },
        {'x': 11, 'y': 17},
        {'x': 13, 'y': 13},
        {'x': 17, 'y': 23}
    ];
    
    var x = d3.time.scale().range([0, WIDTH]);
    var y = d3.scale.linear().range([HEIGHT, 0]);

    x.domain(d3.extent(points, function(d) {return d.x}));
    y.domain(d3.extent(points, function(d) {return d.y}));
    
    var d3line = d3.svg.line()
      .x(function(d) {return x(d.x);})
      .y(function(d) {return y(d.y);});

    return d3line(points);
  },
  width: WIDTH,
  height: HEIGHT,
  poly: '0 50, 10, 70, 30 30, 60 100, 100, 70,' + WIDTH + ' 50'
});