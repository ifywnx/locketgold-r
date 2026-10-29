"""Caption Studio 2 regression: local favorite state, old backups, copy and mobile UI."""
import json
import unicodedata
from playwright.sync_api import sync_playwright

BASE="http://127.0.0.1:3000"
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in (1440,390,320):
        context=browser.new_context(viewport={"width":width,"height":850},accept_downloads=True,permissions=["clipboard-read","clipboard-write"])
        page=context.new_page()
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        response=page.goto(BASE+"/captions/index.html",wait_until="networkidle",timeout=30000)
        assert response and response.status==200
        page.locator(".card").first.wait_for(state="visible",timeout=10000)
        assert page.locator("#favorite-total").inner_text()=="0"
        favorite=page.locator(".card .favorite-action").first
        favorite.click()
        assert page.locator("#favorite-total").inner_text()=="1"
        assert page.locator(".card .favorite-action").first.get_attribute("aria-pressed")=="true"
        page.locator("#only-favorites").check()
        assert page.locator(".card").count()==1
        # State persists in the current browser, not on any backend.
        page.reload(wait_until="networkidle")
        page.locator(".card").first.wait_for()
        assert page.locator("#favorite-total").inner_text()=="1"
        page.locator("#only-favorites").check()
        assert page.locator(".card").count()==1
        page.locator("#only-favorites").uncheck()
        # Accent insensitive: 'chao' should match 'chào'.
        page.locator("#search").fill("chao")
        assert page.locator(".card").count()>=1
        assert "chào" in page.locator("#grid").inner_text().lower()
        page.locator("#search").fill("")
        # Copy does not automatically mark a caption as selected for export.
        item=page.locator(".card").filter(has=page.locator(".copy-caption")).first
        preview=item.locator(".preview").inner_text()
        item.locator(".copy-caption").click()
        page.wait_for_function("() => document.getElementById('status').textContent.includes('sao chép')",timeout=5000)
        assert any(token in page.locator("#status").inner_text() for token in ("Đã sao chép", "không cho sao chép"))
        assert page.locator("#selected").inner_text()=="0"
        # JSON backup contains favorites and retains compatibility with previous backups.
        with page.expect_download() as capture:
            page.locator("#backup").click()
        download=capture.value
        payload=json.loads(open(download.path(),encoding="utf-8").read())
        assert payload["version"]==2 and len(payload["favorites"])==1
        page.locator("#restore").set_input_files({
            "name":"legacy-v1.json","mimeType":"application/json",
            "buffer":json.dumps({"version":1,"custom":[],"selected":[]}).encode()
        })
        assert page.locator("#favorite-total").inner_text()=="0"
        page.locator("#restore").set_input_files({
            "name":"studio-v2.json","mimeType":"application/json",
            "buffer":json.dumps(payload).encode()
        })
        assert page.locator("#favorite-total").inner_text()=="1"
        # Delete a custom caption and its favorite/selected IDs consistently.
        page.locator("#caption").fill("Lời nhắn mới")
        page.locator("#create button").click()
        assert page.locator("#selected").inner_text()=="1"
        page.locator("#category").select_option("✨ Của tôi")
        page.locator(".card .favorite-action").first.click()
        assert page.locator("#favorite-total").inner_text()=="2"
        page.locator(".card button").filter(has_text="Xoá").click()
        assert page.locator("#selected").inner_text()=="0"
        assert page.locator("#favorite-total").inner_text()=="1"
        assert page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")<=5
        assert not errors,errors
        print(f"PASS Studio 2 favorites, backups, copy, search, delete at {width}px")
        context.close()
    # Legacy studio still serves the same canonical files.
    page=browser.new_page()
    page.goto(BASE+"/welcome/captions/index.html",wait_until="networkidle")
    assert page.locator("#favorite-total").count()==1
    assert page.locator("#category option").count()>5
    print("PASS legacy Caption Studio URL")
    browser.close()
