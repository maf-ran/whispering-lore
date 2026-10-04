const stories = require('../../data/datasets/stories.json');
const ids = ['story824','story825','story826','story827','story828','story829','story830',
  'story1634','story1635','story1636','story1637','story1638','story1639',
  'story1640','story1641','story1642','story1643','story1644','story1645',
  'story1646','story1647','story1648','story1649','story1650','story1651',
  'story1652','story1653','story1654','story1655','story1656','story1657',
  'story1658','story1659','story1660','story1661','story1662'];

ids.forEach(id => {
  const s = stories.find(st => st.id === id);
  if (s) {
    console.log(`\n=== ${s.id} ===`);
    console.log(`Title: ${s.title}`);
    console.log(`Country: ${s.country}`);
    console.log(`Tags: ${JSON.stringify(s.tags || [])}`);
    console.log(`Summary:\n${s.summary}`);
    console.log(`---END---`);
  }
});
