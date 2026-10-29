"""An Store three-version smoke: no real third-party app, account or payment."""
import json
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

base="http://127.0.0.1:3000"
for version,expected in [("v1",107),("v2",300),("v3",705)]:
    uri=base+"/welcome/"+("v1-caption-data.json" if version=="v1" else "v2-caption-data.json" if version=="v2" else "caption-data.json")
    with urlopen(uri,timeout=12) as r:
        data=json.load(r)
    assert len(data)==expected,(version,len(data))
    with urlopen(base+f"/api/install-test/{version}/An-Preview.sgmodule",timeout=15) as response:
        body=response.read()
        assert response.status==200 and b"an-store-preview.invalid" in body
        assert b"api.revenuecat.com" not in body and b"[MITM]" not in body
print("PASS: three datasets and safe read-only import previews")

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width,height in [(1440,900),(390,844),(320,740)]:
        page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1)
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        resp=page.goto(base+"/welcome/index.html",wait_until="domcontentloaded",timeout=25000)
        assert resp and resp.status==200,resp
        assert page.locator("#packages .plan-shell").count()==3
        assert "129.000" in page.locator('#packages [data-plan="v3"]').inner_text()
        assert page.locator("#compare .an-compare-table tbody tr").count()==9
        assert "129.000đ" in page.locator('#compare thead th').nth(3).inner_text()
        page.locator('#version-compare-controls button').click()
        assert page.locator("#compare .an-compare-table tbody tr").count()<9
        page.locator('#version-compare-controls button').click()
        assert page.locator("#compare .an-compare-table tbody tr").count()==9
        page.get_by_role("button",name="Chọn Locket V2").click()
        assert "Locket V2 · 89.000đ" in page.locator("#selection").inner_text()
        page.get_by_role("button",name="Chọn Locket V3").click()
        assert "Locket V3 · 129.000đ" in page.locator("#selection").inner_text()
        assert page.locator("#an-v5-device").count()==1
        assert page.evaluate("window.IFYWNX_CONFIG.paymentsEnabled===false"),"Payment was switched on"
        page.locator("#preview-v1").click()
        assert page.locator("#preview-v1").get_attribute("aria-pressed")=="true"
        page.locator("#preview-v2").click()
        assert page.locator("#preview-v2").get_attribute("aria-pressed")=="true"
        page.locator("#preview-v3").click()
        assert page.locator("#preview-v3").get_attribute("aria-pressed")=="true"
        if width==1440:
            page.locator("#phone-camera-view").click()
            assert page.locator("#phone-camera-scene").is_visible()
            page.locator("#phone-shutter").click()
            assert page.locator("#phone-send-scene").is_visible()
        for v,total in [("standard",107),("v2",300),("v3",705)]:
            page.locator(f'[data-detail="{v}"]').click()
            page.locator("#plan-dialog").wait_for(state="visible",timeout=8000)
            page.wait_for_function("n=>document.getElementById('plan-caption-total').textContent.includes(n)",arg=str(total),timeout=10000)
            assert page.locator("#plan-caption-total").inner_text().find(str(total))>=0
            if v=="v3":
                assert page.locator("#plan-dialog-price").inner_text()=="129.000đ / gói"
            page.locator("#plan-dialog-close").click()
        page.locator('#packages [data-plan="v3"]').click()
        assert "Locket V3 · 129.000đ" in page.locator("#selection").inner_text()
        assert page.evaluate("window.IFYWNX_CONFIG.paymentsEnabled===false")
        page.locator("#versions").scroll_into_view_if_needed()
        assert page.locator("#versions .an-version-card").count()==3
        over=page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
        assert over<=7, f"Horizontal overflow at {width}: {over}px"
        assert not errors,errors[:3]
        print(f"PASS: V1/V2/V3 iPhone+modal/roadmap at {width}px, overflow={over}")
        page.close()
    browser.close()
