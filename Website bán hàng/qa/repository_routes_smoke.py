"""Regression for canonical sources, backwards compatible public URLs and no checkout."""
import json
from urllib.request import urlopen, Request
from urllib.error import HTTPError
from playwright.sync_api import sync_playwright

base = "http://127.0.0.1:3000"
def read(path):
    with urlopen(base+path, timeout=20) as r:
        return r.status,r.read(),r.headers.get('Content-Type','')
for path1,path2 in [
  ('/captions/catalog.json','/welcome/captions/catalog.json'),
  ('/captions/studio.js','/welcome/captions/studio.js'),
  ('/captions/studio-effects.js','/welcome/captions/studio-effects.js'),
  ('/captions/studio-effects.css','/welcome/captions/studio-effects.css'),
  ('/welcome/images/locket-welcome-ifywnx-v5.png','/images/locket-welcome-ifywnx-v5.png'),
]:
    left=read(path1);right=read(path2)
    assert left[0]==right[0]==200,(path1,path2,left[0],right[0])
    assert left[1]==right[1],(path1,path2,'Content mismatch')
    print(f'PASS canonical URL -> legacy URL byte-identical: {path1}')
with urlopen(base+'/api/versions',timeout=12) as response:
    metadata=json.load(response)
assert metadata['paymentStatus']=='disabled'
assert [v['priceVnd'] for v in metadata['versions']]==[49000,89000,129000]
assert [v['captionCount'] for v in metadata['versions']]==[107,300,705]
assert all(v['verification']['device']=='not-tested' for v in metadata['versions'])
print('PASS catalog API matches canonical pricing and evidence')
for version in ('v1','v2','v3'):
    code,content,_=read(f'/api/install-test/{version}/Locket_Unlocked.js')
    assert code==200 and b'$done' in content
    code,module,_=read(f'/api/install-test/{version}/An-Locket.sgmodule')
    assert code==200 and b'__ASSET_BASE__' not in module
    print('PASS package API',version)
request=Request(base+'/api/store/checkout',method='POST',data=b'{"items":["trend"]}',
        headers={'Content-Type':'application/json','Origin':base})
try:
    with urlopen(request) as r:raise AssertionError('Unexpected new caption order')
except HTTPError as exc:assert exc.code==410,exc.code
print('PASS retired caption checkout still disabled')

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in (390,1440):
        page=browser.new_page(viewport={'width':width,'height':900})
        errors=[]
        page.on('pageerror',lambda err:errors.append(str(err)))
        response=page.goto(base+'/welcome/index.html',wait_until='networkidle',timeout=30000)
        assert response.status==200
        assert page.locator('#packages .plan-shell').count()==3
        assert page.locator('#preview-v3').count()==1
        assert '129.000' in page.locator('[data-plan="v3"]').inner_text()
        assert page.locator('link[rel="canonical"]').get_attribute('href')=='https://an-store-flame.vercel.app/welcome/index.html'
        assert page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')<=5
        assert page.evaluate('window.IFYWNX_CONFIG.paymentsEnabled===false')
        assert not errors,errors
        print('PASS landing and Vercel canonical at '+str(width)+'px')
        page.close()
    page=browser.new_page()
    res=page.goto(base+'/welcome/captions/index.html',wait_until='networkidle',timeout=30000)
    assert res and res.status==200
    assert page.locator('#category option').count()>5,'Legacy studio failed to load canonical catalog'
    page.goto(base+'/captions/index.html',wait_until='networkidle',timeout=30000)
    assert page.locator('#category option').count()>5,'Canonical studio did not load'
    print('PASS Caption Studio old and current URLs')
    browser.close()
