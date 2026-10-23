"""Smoke test read-only An Store dashboard and existing access-code screen."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('qa/artifacts')
OUT.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:3000'
PW=os.environ['ADMIN_PASSWORD']

def validate(browser, width, height, mobile):
    context=browser.new_context(http_credentials={'username':'admin','password':PW},
        viewport={'width':width,'height':height},device_scale_factor=1,
        is_mobile=mobile,has_touch=mobile)
    page=context.new_page()
    exceptions=[]
    page.on('pageerror',lambda error:exceptions.append(str(error)))
    response=page.goto(BASE+'/admin',wait_until='networkidle',timeout=30000)
    assert response and response.status==200, f'Admin HTTP {response.status if response else "none"}'
    page.get_by_role('heading',name='Quản lý cửa hàng').wait_for(timeout=15000)
    page.get_by_text('Doanh thu đã xác minh').wait_for(timeout=15000)
    page.get_by_text('39.000đ').wait_for(timeout=15000)
    assert page.get_by_text('CHẾ ĐỘ DEMO').count()>0,'Payment mode no longer clearly labeled'
    assert page.locator('body').evaluate('el => el.scrollWidth - el.clientWidth') <= 4, 'Page horizontal overflow'
    page.screenshot(path=str(OUT/f'admin-{width}.png'),full_page=True,animations='disabled')
    page.get_by_role('button',name='Đơn hàng',exact=True).click()
    page.get_by_text('SỔ ĐƠN HÀNG').wait_for()
    page.get_by_text('#5001').wait_for()
    page.get_by_role('button',name='Chi tiết').first.click()
    page.get_by_text('Các bộ trong đơn').wait_for()
    page.screenshot(path=str(OUT/f'orders-{width}.png'),full_page=True,animations='disabled')
    page.get_by_role('button',name='Mã kích hoạt').click()
    page.get_by_text('Tạo mã kích hoạt').wait_for()
    assert page.locator('input[maxlength="80"]').count()==1,'Access code form missing'
    assert not exceptions, f'Unhandled JS errors: {exceptions[:3]}'
    print(f'PASS admin dashboard, order details and code tools at {width}px')
    context.close()

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
        validate(browser,1440,900,False)
        validate(browser,390,844,True)
    finally:
        browser.close()
