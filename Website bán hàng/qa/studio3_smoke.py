"""Caption Studio 3 integration: real V1/V2/V3 data, favorites and mobile layout."""
import json
from playwright.sync_api import sync_playwright

BASE='http://127.0.0.1:3000'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in (1440,390,320):
        context=browser.new_context(viewport={'width':width,'height':850},
            accept_downloads=True,permissions=['clipboard-read','clipboard-write'])
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        response=page.goto(BASE+'/captions/index.html',wait_until='networkidle',timeout=30000)
        assert response and response.status==200
        page.locator('[data-explore-version]').first.wait_for(timeout=12000)
        assert page.locator('[data-explore-version]').count()==3
        assert '705' in page.locator('#explore-count').inner_text()
        assert page.locator('#explore-grid .explore-card').count()==36
        assert page.locator('#explore-group option').count()==22
        assert page.locator('#explore-more').is_visible()
        # Version switch uses audited file counts, not a hardcoded demo list.
        for version,number,groups in [('v1',107,13),('v2',300,22),('v3',705,22)]:
            page.locator(f'[data-explore-version="{version}"]').click()
            assert str(number) in page.locator('#explore-count').inner_text()
            assert page.locator('#explore-group option').count()==groups
        page.locator('#explore-new').check()
        assert 'không trùng' in page.locator('#explore-difference').inner_text()
        unique_cards=page.locator('#explore-grid .explore-card').count()
        assert unique_cards>0
        page.locator('#explore-new').uncheck()
        # Favorites are shared with Studio local storage and never enter script export.
        assert page.locator('#selected').inner_text()=='0'
        page.locator('#explore-grid .explore-heart').first.click()
        assert page.locator('#favorite-total').inner_text()=='1'
        assert page.locator('#selected').inner_text()=='0'
        assert page.locator('#script').is_disabled()
        page.locator('#explore-favorites').check()
        assert page.locator('#explore-grid .explore-card').count()==1
        page.reload(wait_until='networkidle')
        page.locator('[data-explore-version="v3"]').wait_for()
        page.locator('#explore-favorites').check()
        assert page.locator('#explore-grid .explore-card').count()==1
        assert page.locator('#favorite-total').inner_text()=='1'
        # Unified JSON backup contains version-explorer likes; v1 backup still restores.
        with page.expect_download() as event:
            page.locator('#backup').click()
        payload=json.loads(open(event.value.path(),encoding='utf-8').read())
        assert payload['version']==2
        assert len(payload['favorites'])==1
        assert payload['favorites'][0].startswith('studio:preview:')
        page.locator('#restore').set_input_files({
            'name':'studio-backup-v1.json','mimeType':'application/json',
            'buffer':json.dumps({'version':1,'custom':[],'selected':[]}).encode()
        })
        page.wait_for_function("() => document.querySelector('#favorite-total').textContent==='0'",timeout=6000)
        page.locator('#explore-favorites').uncheck()
        page.locator('#explore-search').fill('chao')
        assert page.locator('#explore-grid .explore-card').count()>0
        page.locator('#explore-search').fill('')
        page.locator('#explore-group').select_option(label='🎨 Holiday Caption')
        assert page.locator('#explore-grid .explore-card').count()>0
        page.locator('#explore-group').select_option('')
        overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
        assert overflow<=5, f'explorer overflows by {overflow}px at {width}px'
        assert not errors,errors[:5]
        print(f'PASS Studio 3 V1/V2/V3 explorer, favorites, backup, search, 320px layout at {width}px')
        context.close()
    # Historical Studio URL redirects to same version explorer.
    page=browser.new_page()
    page.goto(BASE+'/welcome/captions/index.html',wait_until='networkidle')
    assert page.locator('[data-explore-version]').count()==3
    print('PASS legacy Studio redirect exposes same V1/V2/V3 explorer')
    browser.close()
