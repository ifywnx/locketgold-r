"""Sales-first An Store: deep links, honest purchase state, responsive actions."""
import json
from playwright.sync_api import sync_playwright
from urllib.request import Request,urlopen
from urllib.error import HTTPError

BASE="http://127.0.0.1:3000"
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in (1440,390,320):
        context=browser.new_context(viewport={"width":width,"height":820},
          permissions=["clipboard-read","clipboard-write"])
        page=context.new_page()
        errors=[]
        page.on("pageerror",lambda err:errors.append(str(err)))
        # Default path: prices first, selected V1 and roadmap below the selling journey.
        r=page.goto(BASE+"/welcome/index.html",wait_until="networkidle",timeout=30000)
        assert r and r.status==200
        assert page.locator("#packages .plan-shell").count()==3
        assert page.locator("#packages [data-plan=v1]").count()==0 # V1 maps to legacy standard plan
        assert "49.000đ" in page.locator("#selection").inner_text()
        assert "Bảng giá" in page.locator("header nav").text_content()
        assert page.evaluate("""() => {
          const s=['packages','compare','captions','how-it-works','faq','versions','policies'];
          return s.every((id,i)=>i===0||document.getElementById(id).compareDocumentPosition(document.getElementById(s[i-1]))&2)
        }""")  # all early sections occur before roadmap
        assert page.locator("#sales-share-status").count()==1
        # Visitors see plans and comparison before optional engineering tools.
        assert page.locator("#store-qa-tools").get_attribute("open") is None
        assert page.locator("#demo-checkout").is_hidden()
        assert page.evaluate("""() => document.getElementById('compare').compareDocumentPosition(document.getElementById('store-qa-tools')) & Node.DOCUMENT_POSITION_FOLLOWING""")
        assert page.locator("#demo-checkout").count()==1
        assert page.evaluate("window.IFYWNX_CONFIG.paymentsEnabled===false")
        # Customer can share the version; no order gets created.
        page.locator("#packages [data-plan=v2]").click()
        assert "Locket V2 · 89.000đ" in page.locator("#selection").inner_text()
        assert "goi=v2" in page.url
        page.locator("#share-plan").click()
        page.wait_for_function("() => document.getElementById('sales-share-status').textContent.includes('Đã sao chép')",timeout=6000)
        saved=page.evaluate("navigator.clipboard.readText()")
        assert saved.endswith("?goi=v2#packages"),saved
        page.locator("#copy-plan-info").click()
        page.wait_for_function("() => document.getElementById('sales-share-status').textContent.includes('thông tin')",timeout=6000)
        txt=page.evaluate("navigator.clipboard.readText()")
        assert "89.000đ" in txt and "300 caption" in txt and "chưa nhận đơn mới" in txt
        assert page.locator("#checkout").is_hidden()
        # Product deep link is resolved via the same catalog, not a separate lookup.
        page.goto(BASE+"/welcome/index.html?goi=v3#packages",wait_until="networkidle")
        assert "Locket V3 · 129.000đ" in page.locator("#selection").inner_text()
        assert page.locator('[data-plan=v3]').get_attribute("aria-pressed")=="true"
        assert "chưa nhận đơn" in page.locator(".sales-availability").inner_text().lower()
        page.goto(BASE+"/welcome/index.html?goi=plus",wait_until="networkidle")
        assert "Locket V1 · 49.000đ" in page.locator("#selection").inner_text()
        assert page.locator("#buy").inner_text().lower().find("thanh toán")>=0
        assert page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")<=7
        assert (page.locator(".sales-mobile-quick").is_visible())==(width<=700)
        if width<=700:
            assert "V1" in page.locator("#sales-quick-summary").inner_text()
            page.locator('[data-plan=v3]').click()
            assert "V3 · 129.000đ" in page.locator("#sales-quick-summary").inner_text()
        assert not errors,errors[:5]
        print(f"PASS storefront price, deep-links, copy, closed checkout and responsive layout at {width}px")
        context.close()
    browser.close()
# Confirm new orders cannot be created via endpoint, even for deep-linked products.
req=Request(BASE+"/api/payments",method="POST",data=b'{"plan":"v3"}',
  headers={"Content-Type":"application/json"})
try:
    with urlopen(req) as r:raise AssertionError("Payment unexpectedly enabled")
except HTTPError as err:
    assert err.code==410,err.code
    data=json.load(err)
    assert data["salesEnabled"] is False
print("PASS server blocks direct payment POST with 410")
