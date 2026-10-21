"""Browser-based smoke check against existing production (no real payment)."""
import os
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "https://an-store-production.up.railway.app").rstrip("/")
OUT = Path("qa/screenshots")
OUT.mkdir(parents=True, exist_ok=True)
failures = []
successes = []


def check(name, action):
    try:
        value = action()
        print(f"PASS {name}: {value if value is not None else 'OK'}", flush=True)
        successes.append(name)
    except Exception as exc:
        msg = str(exc).split("Call log:")[0].strip()
        failures.append((name, msg))
        print(f"FAIL {name}: {msg[:700]}", flush=True)


def opening(page, path):
    response = page.goto(BASE + path, wait_until="domcontentloaded", timeout=30000)
    assert response and response.status < 400, f"HTTP {response.status if response else '?'}"
    page.locator("body").wait_for(timeout=10000)
    return response.status


def safe_screenshot(page, filename):
    page.screenshot(path=str(OUT / filename), full_page=True, animations="disabled", timeout=20000)


def desktop_checks(browser):
    page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    check("Desktop landing loads", lambda: opening(page, "/welcome/index.html"))

    def grid():
        shells = page.locator("#packages .plans-two .plan-shell")
        assert shells.count() == 2
        boxes = [shells.nth(i).bounding_box() for i in (0,1)]
        assert boxes[0] and boxes[1]
        assert boxes[1]["x"] > boxes[0]["x"] + boxes[0]["width"] - 5, f"not two columns: {boxes}"
        assert abs(boxes[0]["width"]-boxes[1]["width"]) < 3, f"unequal card widths: {boxes}"
        return f"two equal columns: {boxes[0]['width']:.0f}px each"
    check("V1/V2 cards centered in 2-column layout", grid)
    check("iPhone demo visible", lambda: page.locator("#an-v5-device").wait_for(state="visible", timeout=10000))

    def phone_version():
        page.locator("#preview-v1").click()
        assert page.locator("#preview-v1").get_attribute("aria-pressed") == "true"
        page.wait_for_function("document.querySelector('#phone-preview-status')?.textContent.includes('/')", timeout=12000)
        before = page.locator("#phone-caption-text").inner_text()
        page.locator("#phone-next").click()
        after = page.locator("#phone-caption-text").inner_text()
        assert before != after, f"caption did not change: {before}"
        page.locator("#preview-v2").click()
        assert page.locator("#preview-v2").get_attribute("aria-pressed") == "true"
        return "V1/V2 and Next caption switch"
    check("iPhone V1/V2 and caption navigation", phone_version)

    def camera():
        page.locator("#phone-camera-view").click()
        assert page.locator("#phone-camera-scene").is_visible()
        page.locator("#phone-shutter").click()
        assert page.locator("#phone-send-scene").is_visible()
        return "camera-to-send flow"
    check("iPhone camera mock flow", camera)

    def marquee_always_scrolling():
        tracks = page.locator("#caption-marquee .caption-track")
        tracks.first.wait_for(state="visible",timeout=15000)
        assert tracks.count() == 3, f"Expected 3 scrolling rows, got {tracks.count()}"
        assert page.locator("#caption-motion").count() == 0, "Pause button still exists"
        before = tracks.evaluate_all("(els) => els.map(el => getComputedStyle(el).animationPlayState)")
        assert all(x == "running" for x in before), f"Marquee unexpectedly paused: {before}"
        page.locator("#caption-marquee").hover()
        page.wait_for_timeout(250)
        after = tracks.evaluate_all("(els) => els.map(el => getComputedStyle(el).animationPlayState)")
        assert all(x == "running" for x in after), f"Marquee paused when hovered: {after}"
        return f"{tracks.count()} caption rows still running on hover"
    check("Caption marquee runs without pause control", marquee_always_scrolling)

    check("Desktop screenshot", lambda: safe_screenshot(page,"home-desktop.png"))
    check("Desktop no JS uncaught exceptions", lambda: (_ for _ in ()).throw(AssertionError(str(errors[:5]))) if errors else "none")
    page.close()


def mobile_checks(browser):
    context = browser.new_context(viewport={"width":390,"height":844}, device_scale_factor=3, is_mobile=True, has_touch=True)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))

    for width in [320,375,390,430]:
        page.set_viewport_size({"width":width,"height":844})
        for path,short in [("/welcome/index.html","home"),("/store/index.html","store")]:
            def width_check(path=path,short=short,width=width):
                opening(page,path)
                page.wait_for_timeout(700)
                excess = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
                if excess>7:
                    offenders=page.evaluate("""() => [...document.querySelectorAll('body *')]
                      .map(el=>{const r=el.getBoundingClientRect(),c=getComputedStyle(el);
                        return {tag:el.tagName.toLowerCase(),id:el.id,cls:String(el.className).slice(0,90),
                          x:Math.round(r.x),right:Math.round(r.right),width:Math.round(r.width),
                          position:c.position,overflowX:c.overflowX,scrollWidth:el.scrollWidth};})
                      .filter(r=>r.width>0 && r.right>innerWidth+5)
                      .sort((a,b)=>b.right-a.right).slice(0,12)""")
                    visible=page.evaluate("""() => {
                      const clipped=(el)=>{for(let p=el.parentElement;p;p=p.parentElement){
                        if(['hidden','clip','scroll','auto'].includes(getComputedStyle(p).overflowX)) return true;
                      }return false};
                      return [...document.querySelectorAll('body *')].map(el=>{
                        const r=el.getBoundingClientRect();
                        return {tag:el.tagName.toLowerCase(),id:el.id,cls:String(el.className).slice(0,70),
                          left:Math.round(r.left),right:Math.round(r.right),
                          client:el.clientWidth,scroll:el.scrollWidth};})
                        .filter((r,i)=>r.right>innerWidth+5 && !clipped(document.querySelectorAll('body *')[i]))
                        .sort((a,b)=>b.right-a.right).slice(0,18)
                    }""")
                    bounds=page.evaluate("""() => ['body','main','header','.hero','.hero-stage','.an-v5-stage','.an-v5-wrap','#packages','.caption-gallery','#caption-marquee'].map(q=>{
                      const e=document.querySelector(q),r=e?.getBoundingClientRect();
                      return {q,right:Math.round(r?.right||0),client:e?.clientWidth,scroll:e?.scrollWidth};
                    })""")
                    print(f"VISIBLE OVERFLOW {short} {width}px: {visible}",flush=True)
                    print(f"BOUNDS {short} {width}px: {bounds}",flush=True)
                    print(f"OVERFLOW {short} {width}px: {offenders}", flush=True)
                assert excess <= 7, f"horizontal overflow {excess}px at {width}px"
                return f"{short} {width}px overflow={excess}px"
            check(f"Mobile layout: {short} at {width}px",width_check)
    page.set_viewport_size({"width":390,"height":844})
    check("Mobile home screenshot", lambda: (opening(page,"/welcome/index.html"),safe_screenshot(page,"home-mobile.png")))

    def swipe():
        page.locator("#preview-v2").click()
        page.wait_for_function("document.querySelector('#phone-preview-status')?.textContent.includes('/')", timeout=15000)
        before=page.locator("#phone-preview-status").inner_text()
        page.evaluate("""() => {
          const el=document.getElementById('an-v5-device');
          const from=new Touch({identifier:1,target:el,clientX:270,clientY:370});
          const to=new Touch({identifier:1,target:el,clientX:80,clientY:374});
          el.dispatchEvent(new TouchEvent('touchstart',{touches:[from],changedTouches:[from],bubbles:true}));
          el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[to],bubbles:true}));
        }""")
        after=page.locator("#phone-preview-status").inner_text()
        assert before!=after, f"swipe didn't change status: {before}"
        return f"{before} -> {after}"
    check("iPhone touch swipe changes captions",swipe)

    def purchase_demo():
        opening(page,"/store/index.html")
        page.locator('[data-store-preview="genz"]').click()
        page.locator("#an-store-dialog").wait_for(state="visible",timeout=12000)
        page.locator("#an-store-dialog-close").click()
        page.locator("#an-store-dialog").wait_for(state="hidden",timeout=8000)
        page.locator('[data-store-add="trend"]').wait_for(state="visible",timeout=15000)
        page.locator('[data-store-add="trend"]').click()
        assert page.locator("#store-cart-badge").inner_text()=="1"
        assert page.locator("#an-store-mobile-cart").is_visible()
        mode=page.locator("#an-store-cart-mode").inner_text()
        assert "DÙNG THỬ" in mode, f"Refusing live-payment interaction: {mode}"
        safe_screenshot(page,"store-mobile-cart.png")
        page.locator("#an-store-checkout-button").click()
        page.wait_for_url("**/store/checkout.html?order=*",timeout=15000)
        page.wait_for_function("document.querySelector('#order-state')?.textContent.includes('Đã hoàn tất')",timeout=15000)
        page.locator("#an-order-downloads").wait_for(state="visible",timeout=15000)
        links=page.locator(".an-download-links a[href*='/api/store/files/']")
        assert links.count() >= 1, "No signed files available"
        safe_screenshot(page,"demo-order-mobile.png")
        jsonlink=page.locator(".an-download-links a[href*='.json?']").first
        url=jsonlink.get_attribute("href") if jsonlink.count() else links.first.get_attribute("href")
        response=context.request.get(url,timeout=15000)
        assert response.status==200, f"signed file returned HTTP {response.status}"
        assert len(response.body())>20, "empty signed file"
        return f"0 VND demo order created, {links.count()} links, signed file HTTP 200"
    check("Store preview -> cart -> 0 VND demo -> files",purchase_demo)
    check("Mobile no JS uncaught exceptions", lambda: (_ for _ in ()).throw(AssertionError(str(errors[:5]))) if errors else "none")
    context.close()


with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
        desktop_checks(browser)
        mobile_checks(browser)
    finally:
        browser.close()

print(f"RESULT {len(successes)} pass, {len(failures)} fail", flush=True)
for name,msg in failures:
    print(f"ERROR {name}: {msg[:800]}", flush=True)
sys.exit(1 if failures else 0)
