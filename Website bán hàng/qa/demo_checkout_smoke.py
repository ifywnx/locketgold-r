"""Isolated demo order: create quote, simulate confirmation, version-only delivery.
No database mutation, payOS call, real Gold, activation, or paid assets.
"""
import json,base64,hashlib,hmac,time,uuid
from urllib.request import urlopen,Request
from urllib.error import HTTPError
from playwright.sync_api import sync_playwright

BASE="http://127.0.0.1:3000"
SECRET="an-store-demo-ci-only-signing-secret-not-for-live"
def request(path,body=None,origin=BASE):
    data=None if body is None else json.dumps(body).encode()
    headers={"Origin":origin,"Content-Type":"application/json"}
    try:
        with urlopen(Request(BASE+path,data=data,headers=headers),timeout=20) as r:
            raw=r.read();return r.status,json.loads(raw) if path.startswith("/api/demo/") and "/files/" not in path else raw
    except HTTPError as e:
        raw=e.read()
        try:raw=json.loads(raw)
        except:raw=raw.decode()
        return e.code,raw
def mint_old(version,phase,old_seconds):
    now=int(time.time())-old_seconds
    duration=900 if phase=="quote" else 3600
    body={"schema":1,"scope":"an-store-demo-only","phase":phase,
          "order":str(uuid.uuid4()),"version":version,"amount":{"v1":49000,"v2":89000,"v3":129000}[version],
          "issued":now,"expires":now+duration}
    payload=base64.urlsafe_b64encode(json.dumps(body,separators=(",",":"),ensure_ascii=False).encode()).rstrip(b"=").decode()
    mac=hmac.new(SECRET.encode(),b"an-store:demo-only:v1:"+payload.encode(),hashlib.sha256).digest()
    return payload+"."+base64.urlsafe_b64encode(mac).rstrip(b"=").decode()

for version,amount,total in [("v1",49000,107),("v2",89000,300),("v3",129000,705)]:
    status,quote=request("/api/demo/checkout",{"version":version})
    assert status==200,(version,status,quote)
    assert quote["order"]["version"]==version
    assert quote["order"]["amount"]==amount
    assert quote["order"]["paid"] is False
    assert quote["order"]["status"]=="DEMO_PENDING"
    status,inspected=request("/api/demo/inspect",{"quoteToken":quote["quoteToken"]})
    assert status==200 and inspected["order"]["status"]=="DEMO_PENDING"
    assert inspected["order"]["version"]==version and inspected["order"]["paid"] is False
    status,denied=request(f"/api/demo/files/{version}/sample.json?ticket={quote['quoteToken']}")
    assert status==403,(version,status,denied)
    status,confirmed=request("/api/demo/complete",{"quoteToken":quote["quoteToken"]})
    assert status==200,(version,status,confirmed)
    assert confirmed["order"]["status"]=="DEMO_FULFILLED"
    assert confirmed["order"]["paid"] is False
    receipt=confirmed["receiptToken"]
    status,restored=request("/api/demo/restore",{"receiptToken":receipt})
    assert status==200 and restored["order"]["orderId"]==quote["order"]["orderId"]
    for file in ("sample.json","instructions.txt","receipt.json"):
        with urlopen(BASE+f"/api/demo/files/{version}/{file}?ticket={receipt}",timeout=20) as r:
            data=r.read()
            assert r.status==200 and len(data)>50
            assert "no-store" in r.headers["Cache-Control"]
            assert "attachment" in r.headers["Content-Disposition"]
            if file=="sample.json":
                obj=json.loads(data)
                assert obj["version"]==version and obj["fullCaptionCount"]==total
                assert obj["deliveredSampleCount"]==12
                assert obj["demo"] is True
            elif file=="receipt.json":
                obj=json.loads(data)
                assert obj["paid"] is False and obj["simulatedStatus"]=="DEMO_FULFILLED"
            else:
                assert b"DEMO" in data and b"Gold" in data
    wrong="v2" if version!="v2" else "v1"
    status,_=request("/api/demo/inspect",{"quoteToken":receipt})
    assert status==403  # signed receipt cannot be used as a pending quote
    status,_=request(f"/api/demo/files/{wrong}/sample.json?ticket={receipt}")
    assert status==403,(version,wrong,status)
    status,_=request("/api/demo/restore",{"receiptToken":receipt[:-2]+"xy"})
    assert status==403
    print("PASS demo API quote -> confirm -> restore -> version-only samples",version)
for phase in ("quote","fulfilled"):
    expired=mint_old("v3",phase,5000)
    if phase=="quote":
        status,_=request("/api/demo/inspect",{"quoteToken":expired})
        assert status==410,(phase,status)
        status,_=request("/api/demo/complete",{"quoteToken":expired})
    else:status,_=request("/api/demo/files/v3/sample.json?ticket="+expired)
    assert status==410,(phase,status)
status,_=request("/api/demo/checkout",{"version":"plus"})
assert status==400
status,_=request("/api/demo/inspect",{"quoteToken":"invalid"},origin="https://foreign.invalid")
assert status==403
status,_=request("/api/demo/checkout",{"version":"v3"},origin="https://foreign.invalid")
assert status==403
status,_=request("/api/payments",{"plan":"standard"})
assert status==410
status,_=request("/api/store/checkout",{"items":["love"]})
assert status==410
print("PASS forged/expired/wrong-origin/legacy/payment safeguards")
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in (1440,390,320):
        context=browser.new_context(viewport={"width":width,"height":844},
            permissions=["clipboard-read","clipboard-write"],accept_downloads=True)
        page=context.new_page()
        errors=[];page.on("pageerror",lambda err:errors.append(str(err)))
        page.goto(BASE+"/welcome/index.html",wait_until="networkidle",timeout=30000)
        page.locator("#demo-version").select_option("v3")
        assert "129.000đ" in page.locator("#demo-summary").inner_text()
        assert page.locator("#demo-confirm").is_disabled()
        page.locator("#demo-create").click()
        page.locator("#demo-order").wait_for(state="visible",timeout=8000)
        assert page.locator("#demo-order-status").inner_text()=="Chờ xác nhận DEMO"
        assert page.locator("#demo-files").is_hidden()
        assert "Phiếu chờ" in page.locator("#demo-expires").inner_text()
        # A pending signed quote survives refresh and is verified server-side.
        page.reload(wait_until="networkidle")
        page.locator("#demo-order").wait_for(state="visible",timeout=8000)
        assert page.locator("#demo-order-status").inner_text()=="Chờ xác nhận DEMO"
        assert page.locator("#demo-confirm").is_enabled()
        page.locator("#demo-confirm").click()
        page.locator("#demo-files").wait_for(state="visible",timeout=8000)
        assert "Đã xác nhận" in page.locator("#demo-order-status").inner_text()
        assert page.locator("#demo-delivery a").count()==3
        assert "Biên nhận mẫu" in page.locator("#demo-expires").inner_text()
        assert page.evaluate("sessionStorage.getItem('an-store-demo-pending-v1')") is None
        assert page.evaluate("!!sessionStorage.getItem('an-store-demo-receipt-v1')")
        with page.expect_download() as result:
            page.locator("#demo-delivery a").first.click()
        downloaded=json.loads(open(result.value.path(),encoding="utf8").read())
        assert downloaded["version"]=="v3" and len(downloaded["samples"])==12
        page.locator("#demo-copy-receipt").click()
        page.wait_for_function("() => document.getElementById('demo-status').textContent.includes('sao chép')",timeout=6000)
        receipt=page.evaluate("navigator.clipboard.readText()")
        assert receipt.count(".")==1
        # New session can restore the signed DEMO receipt.
        page.goto(BASE+"/welcome/index.html",wait_until="networkidle")
        page.locator(".demo-restore summary").click()
        page.locator("#demo-receipt-input").fill(receipt)
        page.locator("#demo-restore").click()
        page.locator("#demo-files").wait_for(state="visible",timeout=8000)
        assert "129.000" in page.locator("#demo-order-price").inner_text()
        assert "Không phải" in page.locator("#demo-files").inner_text()
        # A receipt is valid for one version only; switching clears old download links.
        page.locator("#demo-version").select_option("v1")
        assert page.locator("#demo-files").is_hidden()
        assert page.locator("#demo-order").is_hidden()
        assert "49.000đ" in page.locator("#demo-summary").inner_text()
        assert page.locator("#demo-expires").is_hidden()
        page.evaluate("sessionStorage.setItem('an-store-demo-pending-v1','invalid')")
        page.reload(wait_until="networkidle")
        assert page.locator("#demo-order").is_hidden()
        assert page.locator("#demo-confirm").is_disabled()
        assert page.evaluate("sessionStorage.getItem('an-store-demo-pending-v1')") is None
        overflow=page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
        assert overflow<=7,(width,overflow)
        assert not errors,errors[:3]
        context.close()
        print(f"PASS demo browser create, fulfill, download, restore at {width}px")
    browser.close()
