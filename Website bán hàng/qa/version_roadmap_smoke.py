"""Regression: new standalone caption sales retired; old orders and iPhone demo preserved."""
import base64
import hashlib
import json
import os
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright

BASE="http://127.0.0.1:3000"
TOKEN="a"*64
def request(path,method="GET",payload=None,token=None):
    body=json.dumps(payload).encode() if payload is not None else None
    headers={"Content-Type":"application/json","Origin":BASE}
    if token:headers["Authorization"]="Bearer "+token
    r=urllib.request.Request(BASE+path,data=body,method=method,headers=headers)
    try:
        with urllib.request.urlopen(r,timeout=12) as response:
            return response.status,json.loads(response.read())
    except urllib.error.HTTPError as exc:
        return exc.code,json.loads(exc.read())
code,payload=request("/api/store/checkout",method="POST",payload={"items":["genz"]},token=TOKEN)
assert code==410,(code,payload)
assert payload["salesEnabled"] is False
code,catalog=request("/api/store/checkout?catalog=1")
assert code==200 and catalog["mode"]=="retired" and catalog["products"]==[]
code,old=request("/api/store/checkout?order=5001",token=TOKEN)
assert code==200 and old["status"]=="DEMO_COMPLETED" and old["items"][0]["id"]=="genz",(code,old)
code,noAccess=request("/api/store/checkout?order=5001",token="b"*64)
assert code==404,(code,noAccess)
print("PASS server refuses standalone checkout and preserves authenticated old orders")

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for w,h in [(1440,900),(390,844),(320,740)]:
        page=browser.new_page(viewport={"width":w,"height":h})
        errors=[]
        page.on("pageerror",lambda err:errors.append(str(err)))
        r=page.goto(BASE+"/welcome/index.html",wait_until="networkidle",timeout=20000)
        assert r and r.status==200,r
        assert page.locator("#versions .an-version-card").count()==4
        assert page.locator("#an-v5-device").count()==1
        assert page.locator("#preview-v1").count()==1
        assert page.locator("#preview-v2").count()==1
        assert page.locator("#caption-marquee .caption-track").count()==3
        assert page.locator("a[href='/store/']").count()==0
        assert page.locator("a[href='#versions']").count()>=1
        overflow=page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
        assert overflow<=4,f"Overflow at {w}px: {overflow}"
        if w==1440:
            page.locator("#preview-v1").click()
            assert page.locator("#preview-v1").get_attribute("aria-pressed")=="true"
            page.locator("#preview-v2").click()
            assert page.locator("#preview-v2").get_attribute("aria-pressed")=="true"
            page.locator("#caption-marquee").hover()
            assert all(x=="running" for x in page.locator("#caption-marquee .caption-track").evaluate_all("(els)=>els.map(el=>getComputedStyle(el).animationPlayState)"))
        assert not errors,errors
        print(f"PASS home V1/V2/3D + roadmap/animation at {w}px (overflow={overflow})")
        if w==390:page.screenshot(path="/tmp/version-roadmap-mobile.png",full_page=True,animations="disabled")
        if w==1440:page.screenshot(path="/tmp/version-roadmap-desktop.png",full_page=True,animations="disabled")
        page.close()
    page=browser.new_page()
    page.goto(BASE+"/store/index.html",wait_until="domcontentloaded")
    assert page.url.endswith("/welcome/index.html#versions"),page.url
    page.goto(BASE+"/store",wait_until="domcontentloaded")
    assert page.url.endswith("/welcome/index.html#versions"),page.url
    page.goto(BASE+"/versions",wait_until="domcontentloaded")
    assert page.url.endswith("/welcome/index.html#versions"),page.url
    old=page.goto(BASE+"/store/checkout.html?order=5001",wait_until="domcontentloaded")
    assert old and old.status==200,old
    print("PASS retired storefront redirects while legacy checkout URL remains available")
    browser.close()
