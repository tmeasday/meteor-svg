Points1 = new Meteor.Collection(null);

[ { x: 0, y: 40 }, 
  { x: 1, y: 49 }, 
  { x: 2, y: 38 }, 
  { x: 3, y: 30 }, 
  { x: 4, y: 32 } ].forEach(function(point) {
    Points1.insert(point);
  });