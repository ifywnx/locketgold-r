"""Version-bound future paid access; never mistake legacy Plus as V3."""
import json
from urllib.request import Request,urlopen
from urllib.error import HTTPError
base="http://127.0.0.1:3000"
def denied(path,status,headers=None):
  try:
    with urlopen(Request(base+path,headers=headers or {}),timeout=15) as r:
      raise AssertionError("Unexpected access: "+str(r.status))
  except HTTPError as err:
    assert err.code==status,(path,err.code,status)
    return json.load(err)
for v in ("v1","v2","v3"):
  assert denied("/api/version-access/"+v+"?order=1",401)["error"]
  fake={"Authorization":"Bearer "+"a"*64}
  assert denied("/api/version-access/"+v+"?order=zero",400,fake)["error"]
  assert denied("/api/version-access/"+v+"?order=999999",404,fake)["error"]
assert denied("/api/version-access/plus?order=1",404)["error"]
assert denied("/api/version-access/v4?order=1",404)["error"]
print("PASS no version access without authenticated matching paid SKU")
