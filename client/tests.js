ExampleData = new Meteor.Collection(null);
[ { x: -1893456000, y: 92228531 }, { x: -1577923200, y: 106021568 }, { x: -1262304000, y: 123202660 }, { x: -946771200, y: 132165129 }, { x: -631152000, y: 151325798 }, { x: -315619200, y: 179323175 }, { x: 0, y: 203211926 }, { x: 315532800, y: 226545805 }, { x: 631152000, y: 248709873 }, { x: 946684800, y: 281421906 }, { x: 1262304000, y: 308745538 } ].forEach(function(point) {
  ExampleData.insert(point);
});

TestFlipStatistics = new Meteor.Collection(null);
for (var i = 7;i >= 0;i--) {
  var now = new Date();
  var item = {
    //use .getTime() for integer timestamp
    day: moment(now).subtract('days', i).startOf('day').toDate().getTime(),
    helpfulCount: _.random(0, 30),
    commentCount: _.random(0, 30 * 2),
    responseCount: _.random(0, 30),
    avgHelpfulCount: _.random(0, 30),
    avgCommentCount: _.random(0, 30 * 2),
    avgResponseCount: _.random(0, 30),
    _day: moment(now).subtract('days', i).startOf('day').toDate()
  }
  TestFlipStatistics.insert(item);
}

Template.tests.helpers({
  weekly1: function() {
    return TestFlipStatistics.find();
  }
});