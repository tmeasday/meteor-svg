WIDTH = 300;
HEIGHT = 200;

function data() {
  return Points1.find().fetch();
}

Template.graph2.rendered = function() {
  var self = this;

  var graph = new Rickshaw.Graph( {
      element: self.find(".chart1"),
      width: 300, 
      height: 200, 
      series: [{
          color: 'steelblue',
          data: data()
      }]
  });
   
  graph.render();
}

Template.graph2.helpers({
});