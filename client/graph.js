var WIDTH = 500;
var HEIGHT = 300;
var PADDING = 50;
var TICK_SIZE = 5;
var Y_TICK_COUNT = 5;
var X_TICK_COUNT = 7;

Template.graph.rendered = function() {
  $('.hover-region').qtip({
      content: {
          text: function(event, api) {
            var jsonData = this.attr('data-data');
            return jsonData;
          }
      },
      position: {
          my: 'top center',
          at: 'bottom center'
      }
  });
}

// Takes an array of Statistic. Returns an array of series
function createSeries(rawData) {
  var series = [
    {name: 'engagement', points: []}, //0
    {name: 'responsesPlusComments', points: []}, //1
    {name: 'responses', points: []} //2
  ];

  rawData.forEach(function(item) {
    series[0].points.push({x: item.day, y: item.responseCount 
      + item.commentCount + item.helpfulCount});
    series[1].points.push({x: item.day, y: item.responseCount 
      + item.commentCount});
    series[2].points.push({x: item.day, y: item.responseCount});
  });

  return series;
}

Template.graph.helpers({
  rawData: function() {
    return this.Statistics.find().fetch();
  },
  mappedData: function() {
    var series = createSeries(this); //this=rawData
    var dimensions = Template.graph._dimensionsForSeries(series, WIDTH, HEIGHT);

    // add the paths to each series
    series.forEach(function(s) {
      _.extend(s, {
        paths: Template.graph._pathsForPoints(s.points, dimensions)
      });
    });

    return {
      dimensions: dimensions,
      series: series,
      xTicks: Template.graph._xTicks(dimensions),
      yTicks: Template.graph._yTicks(dimensions),
      hoverRegions: Template.graph._hoverRegions(this, dimensions)
    }
  },
  padding: PADDING,
  totalWidth: WIDTH + (PADDING * 2),
  totalHeight: HEIGHT + (PADDING * 2),
  log: function() {
    console.log(arguments);
  }
});

// points: {x, y}
// returns {area: String (Path), line: String (Path)}
Template.graph._pathsForPoints = function(points, dimensions) {
  var interpolation = 'monotone';
  var tension = 0.8;
  
  var d3area = d3.svg.area()
    .x(function(d) {return dimensions.xScale(d.x);})
    .y0(function(d) {return dimensions.height;})
    .y1(function(d) {return dimensions.yScale(d.y);})
    .interpolate(interpolation).tension(tension);

  var d3line = d3.svg.line()
    .x(function(d) {return dimensions.xScale(d.x);})
    .y(function(d) {return dimensions.yScale(d.y);})
    .interpolate(interpolation).tension(tension);

  return {
    area: d3area(points),
    line: d3line(points)
  }
}

// XXX: This could be optimized by measuring in createSeries instead
// Creates a dimensions object from an array of series
// Returns: Dimensions
Template.graph._dimensionsForSeries = function(series, width, height) {
  var xValues = [];
  var yValues = [];
  
  // measure the series
  series.forEach(function(s) {
    s.points.forEach(function(point) {
      xValues.push(point.x);
      yValues.push(point.y);
    });
  });

  return {
    xScale: d3.time.scale().range([0, width]).domain(d3.extent(xValues)),
    yScale: d3.scale.linear().range([height, 0]).domain(d3.extent(yValues)),
    width: width,
    height: height
  }
}

// Takes a dimensions object
// Returns: [{x, label}]
Template.graph._xTicks = function(dimensions) {
  var format = d3.time.format("%a %e");

  return _.map(dimensions.xScale.ticks(X_TICK_COUNT), function(label) {
    return {
      x: dimensions.xScale(label),
      label: format(label),
      size: TICK_SIZE
    }
  });
}

// Takes a dimensions object
// Returns: [{y, label}]
Template.graph._yTicks = function(dimensions) {
  return _.map(dimensions.yScale.ticks(Y_TICK_COUNT), function(label) {
    return {
      y: dimensions.yScale(label),
      label: label,
      size: TICK_SIZE
    }
  });
}

// Takes a dimensions object
// Returns: [{x, boundaryWidth, height, data}] <- data is point from rawData
Template.graph._hoverRegions = function(rawData, dimensions) {
  // just take the first series
  // XXX: check if there are none
  var dates = rawData.map(function(r) {return r.day});
  var boundaryWidth = dates.length > 1 ? WIDTH / (dates.length - 1) : WIDTH;

  return _.map(dates, function(date, idx) {
    return {
      x: dimensions.xScale(date),
      boundaryWidth: boundaryWidth,
      height: dimensions.height,
      data: EJSON.stringify(rawData[idx])
    }
  });
},

// ---------- Testing ----------------
Template.graph.test = {
  weekly: function() {
    var now = new Date();

    function randomItem(daysAgo) {
      return {
        //uses .getTime() for integer timestamp
        day: moment(now).subtract('days', daysAgo).startOf('day').toDate(),
        helpfulCount: _.random(0, 30),
        commentCount: _.random(0, 30 * 2),
        responseCount: _.random(0, 30),
        avgHelpfulCount: _.random(0, 30),
        avgCommentCount: _.random(0, 30 * 2),
        avgResponseCount: _.random(0, 30)
      }
    }

    var Statistics = new Meteor.Collection(null);
    _.times(7, function(i) {
      Statistics.insert(randomItem(i));
    })
    
    return {
      Statistics: Statistics
    }
  }
}

function getEngagement(statistic) {
  return statistic.responseCount 
    + statistic.commentCount + statistic.helpfulCount;
}

// XXX: copied from verso
// Expose Template in templates so that e.g one can specify test data 
// on templates 
UI.registerHelper('Template', function() { return Template; });

