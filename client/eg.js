// XXX: Is this useful? Probably should go into Meteor pack
Measurement = {
  // obtain the window size reactively
  getWindowSize: function() {
    var self = this;

    // one time init
    if (!this._dep) {
      this._dep = new Deps.Dependency;
      this._windowSize = this._calcSize();

      $( window ).resize(function() {
        var size = self._calcSize();

        // cache size
        if (! _.isEqual(size, self._windowSize)) {
          self._windowSize = self._calcSize();
          self._dep.changed();
        }
      });
    }

    this._dep.depend();
    return this._windowSize;
  },
  _calcSize: function() {
    return {
      width: $(window).width(),
      height: $(window).height()
    }
  }
}

// camelizeTheArguments
// XXX: Meteor pack?
var camelizeArgs = _.memoize(function camelizeArgs() { /*arguments*/
  return _.str.camelize(Array.prototype.slice.call(arguments).join(' '));
});

// take the raw data and construct a set of series to feed into the main graph
function prepareSeries(data) {
  var palette = new Rickshaw.Color.Palette();
  var series = [
    {//0
      name: 'Responses',
      color: palette.color(),
      data: []
    },
    {//1
      name: 'Comments',
      color: palette.color(),
      data: []
    },
    {//2
      name: 'Helpfuls',
      color: palette.color(),
      data: []
    }
  ]

  data.forEach(function(item) {
    var rickshawDate = item.day / 1000;

    series[0].data.push({x: rickshawDate, y: item.responseCount});
    series[1].data.push({x: rickshawDate, y: item.commentCount});
    series[2].data.push({x: rickshawDate, y: item.helpfulCount});
  });

  return series;
}

// prepare the dimension vs school average chart
function prepareAvgSeries(data, dimension) {
  var palette = new Rickshaw.Color.Palette();
  var series = [
    {//0
      name: 'Teacher',
      color: palette.color(),
      data: []
    },
    {//1
      name: 'School Average',
      color: palette.color(),
      data: []
    }
  ]

  data.forEach(function(item) {
    var rickshawDate = item.day / 1000;

    series[0].data.push({x: rickshawDate, 
      y: item[camelizeArgs(dimension, 'count')]});

    series[1].data.push({x: rickshawDate, 
      y: item[camelizeArgs('avg', dimension, 'count')]});
  });

  return series;
}


Template.eg.rendered = function() {
  var self = this;
  
  Deps.autorun(function(c) {
    var chartEl = self.find(".chart");
    var xAxisEl = self.find(".x-axis");
    var yAxisEl = self.find(".y-axis");
    $(chartEl).empty();
    $(yAxisEl).empty();
    
    // XXX: wtf?
    // var data = self.data.data.fetch();
    // var data = ExampleData.find().fetch();
    var data = TestFlipStatistics.find({}, {sort: {day: 1}}).fetch();
    
    console.log('rendering graph with ' + data.length + ' points');
    
    var size = Measurement.getWindowSize();
    console.log('window width = ' + size.width);

    var graphOptions = {
        element: chartEl,
        width: $(chartEl).width(), 
        height: $(chartEl).height(),
        interpolation: 'linear', //'cardinal' is smoothed
        stroke: true
    };

    var dimension = Session.get('eg-selected');

    if (dimension === 'engagement') {
      _.extend(graphOptions, {
        renderer: 'area',
        series: prepareSeries(data)
      });
    } else {
      _.extend(graphOptions, {
        renderer: 'line',
        series: prepareAvgSeries(data, dimension)
      });
    }
    
    var graph = new Rickshaw.Graph(graphOptions);
    
    var xAxis = new Rickshaw.Graph.Axis.Time({
      graph: graph
    });

    // var xAxis = new Rickshaw.Graph.Axis.X({
    //     graph: graph,
    //     // orientation: 'bottom',
    //     // element: xAxisEl,
    //     // pixelsPerTick: 64,
    //     tickFormat: function(n) {
    //       return moment(n*1000).format('ddd');
    //     }
    // });
    
    var y_axis = new Rickshaw.Graph.Axis.Y({
      graph: graph,
      orientation: 'left',
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
      element: yAxisEl,
    });
    
    // var hoverDetail = new Rickshaw.Graph.HoverDetail({
    //   graph: graph
    // });

    graph.render();
  });
}

Session.setDefault('eg-selected', 'engagement');

Template.eg.helpers({
  selected: function(what) {
    return Session.equals('eg-selected', what) ? 'selected' : '';
  }
});

Template.eg.events({
  'change select': function(e, t) {
    Session.set('eg-selected', e.target.options[e.target.selectedIndex].value);
  }
});