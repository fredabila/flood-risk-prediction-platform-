import urllib.request, json, urllib.error
req = urllib.request.Request('http://localhost:8005/api/predict', data=b'{}', headers={'Content-Type': 'application/json'})
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode())
