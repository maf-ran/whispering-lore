import json, collections
d = json.load(open('data/datasets/stories.json'))
print('count', len(d))
print('sample keys', sorted(d[0].keys()))
cnt = collections.Counter()
for s in d:
    for k in ['slug', 'title', 'summary', 'country', 'region', 'tribe', 'type', 'themes', 'lastUpdated']:
        if s.get(k) not in (None, ''):
            cnt[k] += 1
print(dict(cnt))