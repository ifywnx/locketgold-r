'use strict';
/*
 * One catalog powers the three product cards and the comparison table.
 * All data is prepared from lib/version-catalog.json during the build.
 * This is not a remote Locket runtime/entitlement verification tool.
 */
(() => {
  const data=window.AN_STORE_VERSION_CATALOG;
  if(!data||data.schemaVersion!==1||!Array.isArray(data.versions))return;
  const money=n=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
  const make=(tag,className,text)=>{
    const e=document.createElement(tag);
    if(className)e.className=className;
    if(text!==undefined)e.textContent=text;
    return e;
  };
  const cardRoot=document.getElementById('version-plan-cards');
  const compareRoot=document.getElementById('version-compare-table');
  const controls=document.getElementById('version-compare-controls');

  function renderCards(){
    if(!cardRoot)return;
    cardRoot.replaceChildren();
    for(const v of data.versions){
      const outer=make('div','plan-shell'+(v.featured?' featured-plan':''));
      if(v.featured){
        const ribbon=make('span','plan-featured-ribbon','✦ Bộ đầy đủ');
        outer.append(ribbon);
      }
      const btn=make('button','plan'+(v.planId==='standard'?' selected':''));
      btn.type='button';btn.dataset.plan=v.planId;
      btn.setAttribute('aria-pressed',String(v.planId==='standard'));
      btn.append(
        make('span','pill',v.shortName+' · '+v.tier.toLocaleUpperCase('vi')),
        make('h3','',v.name),
      );
      const price=make('strong','',money(v.priceVnd));
      price.append(make('span','',' / gói'));
      btn.append(price,make('p','',v.tagline));
      const ul=make('ul');
      for(const feature of v.features)ul.append(make('li','',feature));
      btn.append(ul,make('span','choose',v.planId==='standard'?'● Đang chọn':'○ Chọn gói này'));
      const more=make('button','plan-more','Xem '+v.captionCount+' caption '+v.shortName+' →');
      more.type='button';more.dataset.detail=v.planId;
      more.setAttribute('aria-haspopup','dialog');
      more.setAttribute('aria-controls','plan-dialog');
      outer.append(btn,more);cardRoot.append(outer);
      const phoneButton=document.getElementById('preview-'+v.id);
      if(phoneButton)phoneButton.textContent=v.shortName+' · '+v.captionCount;
    }
    const selection=document.getElementById('selection');
    if(selection)selection.textContent=data.versions[0].name+' · '+money(data.versions[0].priceVnd);
  }

  // Only repository-backed observations are called "verified".
  // External app behavior and third-party paid rights are explicitly unknown.
  const rows=[
    {name:'Giá niêm yết',value:v=>money(v.priceVnd),evidence:'Giá An Store'},
    {name:'Caption tĩnh',value:v=>String(v.captionCount)+' mẫu',evidence:'Đã đối chiếu JSON'},
    {name:'Nhóm chủ đề',value:v=>String(v.groupCount)+' nhóm',evidence:'Đã đối chiếu JSON'},
    {name:'Kiểu overlay động trong mã',value:v=>String(v.dynamicOverlayCount)+' kiểu',evidence:'Có khai báo trong source'},
    {name:'Phạm vi dữ liệu',value:v=>v.compareDetail,evidence:'Đã kiểm tra nguồn'},
    {name:'Bộ cài riêng',value:v=>v.verification.configuration==='source-present'?'Có tệp nguồn':'Không rõ',evidence:'Tồn tại trong repo'},
    {name:'Chạy thật trên iOS/Locket',value:v=>v.verification.device==='not-tested'?'Chưa kiểm thử':'Chưa xác minh',evidence:'Chưa có bài thử thiết bị'},
    {name:'Gold chính thức',value:()=> 'Không xác nhận',evidence:'Không kiểm chứng máy chủ Locket'},
    {name:'Thanh toán website',value:()=>data.paymentStatus==='disabled'?'Đang tắt':'Chưa rõ',evidence:'Không nhận đơn mới'}
  ];

  let selected='v3',differencesOnly=false;
  function renderCompare(){
    if(!compareRoot||!controls)return;
    compareRoot.replaceChildren();
    controls.replaceChildren();
    const label=make('p','an-compare-hint','Chọn một phiên bản để xem nổi bật trong bảng. Vuốt ngang trên màn hình hẹp.');
    controls.append(label);
    const toggle=make('button','an-compare-filter'+(differencesOnly?' is-on':''),differencesOnly?'Hiện tất cả tiêu chí':'Chỉ xem khác biệt');
    toggle.type='button';toggle.setAttribute('aria-pressed',String(differencesOnly));
    toggle.onclick=()=>{differencesOnly=!differencesOnly;renderCompare()};
    controls.append(toggle);
    const table=make('table','an-compare-table');
    const caption=make('caption','an-compare-caption','So sánh dựa trên tệp trong GitHub, không thay cho kiểm thử trên iPhone thật.');
    const thead=make('thead'), headRow=make('tr');
    const th=make('th','an-compare-first','Tiêu chí');
    th.scope='col';headRow.append(th);
    for(const v of data.versions){
      const column=make('th',v.id===selected?'is-selected':'');
      column.scope='col';
      const button=make('button','an-compare-pick',v.shortName);
      button.type='button';button.setAttribute('aria-label','Chọn '+v.name);
      button.setAttribute('aria-pressed',String(v.id===selected));
      const number=make('span','an-compare-price',money(v.priceVnd));
      button.append(number);
      button.onclick=()=>{
        selected=v.id;
        window.AnStoreSelectPlan?.(v.planId);
        document.getElementById('preview-'+v.id)?.click();
        renderCompare();
      };
      column.append(button);headRow.append(column);
    }
    thead.append(headRow);
    const tbody=make('tbody');
    let visible=0;
    for(const row of rows){
      const values=data.versions.map(row.value);
      if(differencesOnly&&new Set(values).size===1)continue;
      visible++;
      const tr=make('tr');
      const labelCell=make('th','an-compare-row-title');
      labelCell.scope='row';labelCell.append(make('span','',row.name),make('small','',row.evidence));
      tr.append(labelCell);
      for(const [i,v] of data.versions.entries()){
        tr.append(make('td',v.id===selected?'is-selected':'',values[i]));
      }
      tbody.append(tr);
    }
    table.append(caption,thead,tbody);
    compareRoot.append(table);
    const footer=document.getElementById('version-compare-note');
    if(footer)footer.textContent='Hiển thị '+visible+'/'+rows.length+' tiêu chí. Số mẫu và nhóm đã đối chiếu file; chưa xác nhận tính năng trên Locket thật.';
  }

  renderCards();
  renderCompare();
})();
