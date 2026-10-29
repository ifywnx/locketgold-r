"""Owner-only Shadowrocket testing: signed version-bound URL and closed public API."""
import base64,json
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import urlparse,parse_qs
base="http://127.0.0.1:3000"
def expect_error(url,status,headers=None,data=None):
  req=Request(url,headers=headers or {},data=data,method="POST" if data else "GET")
  try:
    with urlopen(req,timeout=30) as res:raise AssertionError("Unexpected "+str(res.status))
  except HTTPError as err:assert err.code==status,(url,err.code,status)
for ver in ("v1","v2","v3"):
  expect_error(base+"/api/version-test/files/"+ver+"/An-Locket.sgmodule",403)
  expect_error(base+"/api/version-test/files/"+ver+"/Locket_Unlocked.js?token=invalid",403)
expect_error(base+"/api/version-test/session",403,{"Origin":"https://example.invalid"},b'{"version":"v1"}')
expect_error(base+"/api/version-test/session",401,{"Origin":base,"Content-Type":"application/json"},b'{"version":"v1"}')
password="an-store-ci-admin-only-secret-very-long"
auth="Basic "+base64.b64encode(("admin:"+password).encode()).decode()
token_per_version={}
for ver in ("v1","v2","v3"):
  req=Request(base+"/api/version-test/session",headers={"Origin":base,"Authorization":auth,"Content-Type":"application/json"},data=json.dumps({"version":ver}).encode(),method="POST")
  with urlopen(req,timeout=15) as resp:
    assert resp.status==200
    d=json.load(resp)
  assert d["version"]==ver and d["expiresInSeconds"]==43200
  url=base+d["moduleUrl"]
  with urlopen(url,timeout=15) as resp:module=resp.read().decode()
  assert "An · Locket "+ver.upper() in module or "An · Locket V1" in module,(ver,module[:120])
  assert "__ASSET_BASE__" not in module
  assert "/api/version-test/files/"+ver+"/Locket_Unlocked.js?token=" in module
  token=parse_qs(urlparse(url).query)["token"][0]
  token_per_version[ver]=token
  with urlopen(base+"/api/version-test/files/"+ver+"/Locket_Unlocked.js?token="+token,timeout=30) as resp:
    script=resp.read().decode()
    assert "$done" in script
    assert "__ASSET_BASE__" not in script
    assert (base+"/welcome/images/locket-gold-an.png") in script
    assert base+base not in script
  print("PASS owner test "+ver)
for ver in ("v1","v2"):
  wrong="v2" if ver=="v1" else "v3"
  expect_error(base+"/api/version-test/files/"+wrong+"/An-Locket.sgmodule?token="+token_per_version[ver],403)
print("PASS server auth, wrong SKU, no unauthenticated full bundle")
