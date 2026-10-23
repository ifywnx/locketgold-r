'use client';
import {Fragment,useCallback,useEffect,useMemo,useState} from 'react';

type AccessCode={id:string,label:string,expires:number,revoked:number};
type Order={id:number,created:number,mode:string,status:string,quotedAmount:number,paid:number|null,eligibleForFiles:boolean,products:{id:string,name:string}[]};
type Report={
  readonly:boolean;storeMode:'demo'|'live';period:{days:number,from:number,to:number};
  metrics:{allOrders:number,demoOrders:number,liveOrders:number,verifiedLiveOrders:number,verifiedRevenue:number,awaitingPayment:number,eligibleForFiles:number,errors:number};
  trend:{date:string,demo:number,live:number}[];
  productPopularity:{id:string,name:string,demo:number,live:number}[];
  pagination:{page:number,pageSize:number,total:number,pages:number};
  orders:Order[];
};

const labels:Record<string,string>={
  DEMO_COMPLETED:'Demo hoàn tất',DEMO_PENDING:'Demo chưa hoàn tất',
  CREATING:'Đang tạo link',PENDING:'Chờ thanh toán',
  PAID_AWAITING_DELIVERY:'Đã xác minh thanh toán',
  CANCELLED:'Đã hủy',EXPIRED:'Hết hạn',ERROR:'Xử lý lỗi'
};
const fmtMoney=(value:number)=>Number(value||0).toLocaleString('vi-VN')+'đ';
const fmtTime=(value:number)=>new Date(value).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'});
const fields=['Tất cả','Demo','Thanh toán thật'];
function csvCell(value:unknown){return '"'+String(value??'').replace(/"/g,'""')+'"';}

export default function Panel(){
  const [tab,setTab]=useState<'overview'|'orders'|'codes'>('overview');
  const [days,setDays]=useState(30);
  const [mode,setMode]=useState('all');
  const [status,setStatus]=useState('all');
  const [query,setQuery]=useState('');
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const [report,setReport]=useState<Report|null>(null);
  const [loading,setLoading]=useState(true);
  const [reportError,setReportError]=useState('');
  const [refreshKey,setRefreshKey]=useState(0);
  const [expanded,setExpanded]=useState<number|null>(null);
  const [codes,setCodes]=useState<AccessCode[]>([]);
  const [codesLoaded,setCodesLoaded]=useState(false);
  const [codesError,setCodesError]=useState('');
  const [recipient,setRecipient]=useState('');
  const [duration,setDuration]=useState(30);
  const [token,setToken]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    if(tab==='codes')return;
    const controller=new AbortController();
    const params=new URLSearchParams({days:String(days),mode,status,page:String(page)});
    if(search)params.set('search',search);
    setLoading(true);setReportError('');
    fetch('/api/admin/store?'+params.toString(),{cache:'no-store',signal:controller.signal})
      .then(async response=>{
        const data=await response.json();
        if(!response.ok)throw Error(data.error||'Không lấy được dữ liệu đơn hàng');
        return data as Report;
      }).then(data=>{if(!controller.signal.aborted)setReport(data)})
      .catch(error=>{if(!controller.signal.aborted)setReportError(error instanceof Error?error.message:'Lỗi kết nối')})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return ()=>controller.abort();
  },[tab,days,mode,status,search,page,refreshKey]);

  const reloadCodes=useCallback(async()=>{
    const res=await fetch('/api/admin',{cache:'no-store'});
    const data=await res.json();
    if(!res.ok)throw Error(data.error||'Không tải được danh sách mã');
    setCodes(data as AccessCode[]);setCodesLoaded(true);
  },[]);
  useEffect(()=>{
    if(tab!=='codes'||codesLoaded)return;
    reloadCodes().catch(error=>setCodesError(error instanceof Error?error.message:'Lỗi tải mã'));
  },[tab,codesLoaded,reloadCodes]);

  async function codeAction(body:unknown){
    setBusy(true);setCodesError('');
    try{
      const res=await fetch('/api/admin',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
      });
      const data=await res.json() as {error?:string,token?:string};
      if(!res.ok)throw Error(data.error||'Không xử lý được');
      if(data.token)setToken(data.token);
      await reloadCodes();
    }catch(error){setCodesError(error instanceof Error?error.message:'Lỗi kết nối')}
    finally{setBusy(false)}
  }

  const metrics=report?.metrics;
  const maxTrend=useMemo(()=>Math.max(1,...(report?.trend||[]).map(d=>d.demo+d.live)),[report]);
  const trendDisplay=report?.trend.slice(-30)||[];

  function changeFilter(which:'days'|'mode'|'status',value:string){
    setPage(1);setExpanded(null);
    if(which==='days')setDays(Number(value));
    if(which==='mode')setMode(value);
    if(which==='status')setStatus(value);
  }
  function exportCurrentPage(){
    if(!report?.orders.length)return;
    const head=['Mã đơn','Ngày tạo','Chế độ','Trạng thái','Giá niêm yết (VND)','Ngày xác minh','Điều kiện lấy file','Các gói'];
    const rows=report.orders.map(o=>[
      o.id,fmtTime(o.created),o.mode,labels[o.status]||o.status,o.quotedAmount,
      o.paid?fmtTime(o.paid):'',o.eligibleForFiles?'Có':'Chưa',
      o.products.map(p=>p.name).join(' | ')
    ]);
    const csv='\uFEFF'+[head,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');
    const link=document.createElement('a');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    link.href=url;link.download='an-store-don-hang-trang-'+report.pagination.page+'.csv';
    document.body.append(link);link.click();link.remove();URL.revokeObjectURL(url);
  }
  return <main className="an-admin-shell an-ops-shell">
    <header className="ops-top">
      <a className="ops-back" href="/">← Website An</a>
      <span className="ops-brand"><span className="ops-brand-mark">A</span> AN STORE <span className="ops-brand-sub">CONTROL CENTER</span></span>
      <button type="button" className="ops-refresh" onClick={()=>{setRefreshKey(x=>x+1);if(tab==='codes')setCodesLoaded(false)}}>↻ Làm mới</button>
    </header>
    <div className="ops-heading">
      <div><span className="ops-kicker">BẢNG ĐIỀU KHIỂN · QUẢN TRỊ</span>
        <h1>Quản lý cửa hàng<span className="ops-period">.</span></h1>
        <p>Đơn hàng, hoạt động thử nghiệm và trạng thái cấp file trong cùng một nơi.</p></div>
      <div className="ops-mode-pill"><span className="ops-live-dot"/> {report?.storeMode==='live'?'Cần kiểm tra cấu hình live':'CHẾ ĐỘ DEMO · 0Đ'}</div>
    </div>
    <nav className="ops-tabs" aria-label="Khu vực quản trị">
      {([['overview','◫','Tổng quan'],['orders','▤','Đơn hàng'],['codes','◇','Mã kích hoạt']] as const).map(([id,ico,label])=>
        <button key={id} type="button" className={tab===id?'is-active':''} onClick={()=>setTab(id)} aria-current={tab===id?'page':undefined}>
          <span aria-hidden="true">{ico}</span> {label}
        </button>)}
    </nav>

    {tab!=='codes'&&<>
      <div className="ops-filters">
        <label>Thời gian
          <select value={days} onChange={e=>changeFilter('days',e.target.value)}>
            <option value={7}>7 ngày</option><option value={30}>30 ngày</option><option value={90}>90 ngày</option>
          </select>
        </label>
        <label>Loại đơn
          <select value={mode} onChange={e=>changeFilter('mode',e.target.value)}>
            <option value="all">{fields[0]}</option><option value="demo">{fields[1]}</option><option value="live">{fields[2]}</option>
          </select>
        </label>
        {tab==='orders'&&<label>Trạng thái
          <select value={status} onChange={e=>changeFilter('status',e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(labels).map(([key,name])=><option key={key} value={key}>{name}</option>)}
          </select>
        </label>}
        {tab==='orders'&&<form className="ops-search" onSubmit={e=>{e.preventDefault();setPage(1);setSearch(query.trim())}}>
          <label>Mã đơn
            <input type="search" inputMode="numeric" value={query} placeholder="Tìm mã đơn…" onChange={e=>setQuery(e.target.value)}/>
          </label><button type="submit" className="ops-filter-submit">Tìm</button>
        </form>}
      </div>
      {reportError&&<div className="ops-alert" role="alert">{reportError}<button type="button" onClick={()=>setRefreshKey(x=>x+1)}>Thử lại</button></div>}
      {loading&&<p className="ops-loading" role="status">Đang cập nhật dữ liệu…</p>}
      {!loading&&report&&<>
        <div className="ops-metrics">
          {([
            ['Tổng đơn trong kỳ',metrics?.allOrders||0,'Bao gồm đơn thử','all'],
            ['Đơn demo',metrics?.demoOrders||0,'Không thu tiền','demo'],
            ['Đơn thật đã xác minh',metrics?.verifiedLiveOrders||0,'Chỉ tính giao dịch hợp lệ','paid'],
            ['Doanh thu đã xác minh',fmtMoney(metrics?.verifiedRevenue||0),'Không tính đơn demo','money']
          ] as const).map(([label,value,note,tone])=>
            <div className={'ops-metric ops-metric-'+tone} key={label}>
              <div className="ops-metric-label">{label}</div>
              <strong className="ops-metric-value">{value}</strong>
              <div className="ops-metric-note">{note}</div>
            </div>)}
        </div>
        {tab==='overview'&&<>
          <div className="ops-two-col">
            <section className="ops-panel">
              <div className="ops-panel-head"><div><span className="ops-eyebrow">XU HƯỚNG</span><h2>Đơn hàng theo ngày</h2></div><span className="ops-meta">UTC+7</span></div>
              <div className="ops-legend"><span><i className="ops-key-demo"/>Đơn demo</span><span><i className="ops-key-live"/>Đơn thật</span></div>
              <div className="ops-chart" role="img" aria-label="Biểu đồ cột số đơn demo và đơn thật theo ngày">
                {trendDisplay.map((d,index)=><div key={d.date} className="ops-day" title={d.date+': '+d.demo+' demo, '+d.live+' thật'}>
                  <div className="ops-bars">
                    {d.live>0&&<div className="ops-bar-live" style={{height:Math.max(2,d.live/maxTrend*100)+'%'}}/>}
                    {d.demo>0&&<div className="ops-bar-demo" style={{height:Math.max(2,d.demo/maxTrend*100)+'%'}}/>}
                    {!d.demo&&!d.live&&<div className="ops-bar-zero"/>}
                  </div>
                  <small>{(index===0||index===trendDisplay.length-1||index%Math.max(1,Math.ceil(trendDisplay.length/6))===0)?d.date.slice(5):''}</small>
                </div>)}
              </div>
              <p className="ops-footnote">Biểu đồ hiển thị tối đa 30 ngày gần nhất của khoảng đã chọn.</p>
            </section>
            <section className="ops-panel">
              <div className="ops-panel-head"><div><span className="ops-eyebrow">BỘ CAPTION</span><h2>Mức độ quan tâm</h2></div><span className="ops-meta">Lượt chọn</span></div>
              <div className="ops-products">
                {report.productPopularity.map((item,index)=>{
                  const amount=item.demo+item.live;
                  const max= Math.max(1,...report.productPopularity.map(p=>p.demo+p.live));
                  return <div className="ops-product" key={item.id}>
                    <div className="ops-product-head"><strong><span>{String(index+1).padStart(2,'0')}</span>{item.name}</strong><b>{amount}</b></div>
                    <div className="ops-product-meter"><span style={{width:amount/max*100+'%'}}/></div>
                    <small>{item.demo} demo · {item.live} đơn thật</small>
                  </div>;
                })}
              </div>
              <p className="ops-footnote">Lượt chọn không đồng nghĩa với lượt bán thành công.</p>
            </section>
          </div>
          <div className="ops-bottom-grid">
            <div className="ops-note"><span className="ops-note-ic">↗</span><div><b>{metrics?.eligibleForFiles||0} đơn đủ điều kiện nhận file</b><p>Đã xác nhận trạng thái trên máy chủ. Chưa có dữ liệu để kết luận khách đã tải/cài thành công.</p></div></div>
            <div className="ops-note"><span className="ops-note-ic">◷</span><div><b>{metrics?.awaitingPayment||0} đơn thật đang chờ thanh toán</b><p>Không chuyển trạng thái thủ công từ bảng điều khiển này.</p></div></div>
          </div>
          <div className="ops-action-row"><button type="button" onClick={()=>setTab('orders')}>Xem tất cả đơn hàng →</button><span>Quản trị chỉ đọc đối với dữ liệu giao dịch.</span></div>
        </>}
        {tab==='orders'&&<>
          <section className="ops-panel ops-orders-panel">
            <div className="ops-panel-head">
              <div><span className="ops-eyebrow">SỔ ĐƠN HÀNG</span><h2>{report.pagination.total.toLocaleString('vi-VN')} đơn phù hợp</h2></div>
              <button className="ops-export" type="button" disabled={!report.orders.length} onClick={exportCurrentPage}>↓ Xuất CSV trang này</button>
            </div>
            <div className="ops-mobile-orders" aria-label="Đơn hàng trên thiết bị di động">
              {report.orders.map(order=><article className="ops-mobile-order" key={order.id}>
                <div className="ops-mobile-order-top">
                  <strong>#{order.id}</strong>
                  <span className={'ops-order-mode '+(order.mode==='demo'?'is-demo':'is-live')}>{order.mode==='demo'?'Đơn demo 0đ':'Đơn thật'}</span>
                </div>
                <p className="ops-mobile-order-date">{fmtTime(order.created)}</p>
                <span className={'ops-status '+(order.status==='DEMO_COMPLETED'||order.status==='PAID_AWAITING_DELIVERY'?'is-completed':'')}>{labels[order.status]||order.status}</span>
                <div className="ops-mobile-order-summary">
                  <span>{order.products.length?order.products.map(p=>p.name).join(', '):'Không rõ sản phẩm'}</span>
                </div>
                <div className="ops-mobile-order-bottom">
                  <div><small>Giá tham khảo</small><strong>{fmtMoney(order.quotedAmount)}</strong></div>
                  <button className="ops-detail" type="button" aria-expanded={expanded===order.id} onClick={()=>setExpanded(expanded===order.id?null:order.id)}>{expanded===order.id?'Thu gọn':'Xem chi tiết'}</button>
                </div>
                {expanded===order.id&&<div className="ops-mobile-order-detail">
                  <div><b>Điều kiện lấy file</b><p>{order.eligibleForFiles?'Đủ điều kiện tạo liên kết, chưa xác nhận đã tải':'Chưa đủ điều kiện'}</p></div>
                  <div><b>Thanh toán xác minh</b><p>{order.mode==='demo'?'Không, demo 0đ':order.paid?fmtTime(order.paid):'Chưa có xác nhận'}</p></div>
                </div>}
              </article>)}
              {!report.orders.length&&<p className="ops-empty">Không có đơn phù hợp bộ lọc.</p>}
            </div>
            <div className="ops-table-scroll">
              <table className="ops-table">
                <thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Loại</th><th>Trạng thái</th><th>Giá tham khảo</th><th></th></tr></thead>
                <tbody>
                  {report.orders.map(order=><Fragment key={order.id}>
                    <tr>
                      <td><strong>#{order.id}</strong></td>
                      <td>{fmtTime(order.created)}</td>
                      <td><span className={'ops-order-mode '+(order.mode==='demo'?'is-demo':'is-live')}>{order.mode==='demo'?'Demo 0đ':'Thanh toán thật'}</span></td>
                      <td><span className={'ops-status '+(order.status==='DEMO_COMPLETED'||order.status==='PAID_AWAITING_DELIVERY'?'is-completed':'')}>{labels[order.status]||order.status}</span></td>
                      <td>{fmtMoney(order.quotedAmount)}</td>
                      <td><button className="ops-detail" type="button" aria-expanded={expanded===order.id} onClick={()=>setExpanded(expanded===order.id?null:order.id)}>{expanded===order.id?'Thu gọn':'Chi tiết'}</button></td>
                    </tr>
                    {expanded===order.id&&<tr className="ops-expanded"><td colSpan={6}><div className="ops-order-detail">
                      <div><b>Các bộ trong đơn</b><p>{order.products.length?order.products.map(p=>p.name).join(' · '):'Không đọc được danh sách sản phẩm'}</p></div>
                      <div><b>Khả năng lấy file</b><p>{order.eligibleForFiles?'Đủ điều kiện tạo liên kết tải, chưa biết đã tải':'Chưa đủ điều kiện'}</p></div>
                      <div><b>Thanh toán được xác minh</b><p>{order.mode==='demo'?'Không, đây là đơn thử 0đ':order.paid?fmtTime(order.paid):'Chưa có xác nhận'}</p></div>
                    </div></td></tr>}
                  </Fragment>)}
                  {!report.orders.length&&<tr><td colSpan={6}><p className="ops-empty">Không tìm thấy đơn hàng phù hợp bộ lọc.</p></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="ops-pagination">
              <span>Trang {report.pagination.page}/{Math.max(1,report.pagination.pages)} · {report.pagination.total} đơn</span>
              <div><button type="button" disabled={page<=1} onClick={()=>{setPage(p=>p-1);setExpanded(null)}}>← Trước</button>
              <button type="button" disabled={page>=report.pagination.pages} onClick={()=>{setPage(p=>p+1);setExpanded(null)}}>Sau →</button></div>
            </div>
          </section>
          <p className="ops-footnote">Giá tham khảo của đơn demo không phải doanh thu; dữ liệu không bao gồm danh tính hoặc phiên đăng nhập khách hàng.</p>
        </>}
      </>}
    </>}

    {tab==='codes'&&<>
      <section className="ops-panel ops-code-panel">
        <div className="ops-panel-head"><div><span className="ops-eyebrow">CẤP QUYỀN</span><h2>Tạo mã kích hoạt</h2></div><span className="ops-meta">Quản trị viên</span></div>
        <p>Mã thủ công chỉ hiển thị một lần khi tạo. Không gửi mã hoặc đường dẫn quản trị công khai.</p>
        <form className="ops-code-form" onSubmit={e=>{e.preventDefault();setToken('');void codeAction({label:recipient,days:duration})}}>
          <label>Tên người nhận<input value={recipient} maxLength={80} required onChange={e=>setRecipient(e.target.value)}/></label>
          <label>Số ngày<input type="number" min={1} max={365} value={duration} required onChange={e=>setDuration(Number(e.target.value))}/></label>
          <button type="submit" disabled={busy}>Tạo mã</button>
        </form>
        {token&&<div className="ops-token"><strong>Sao chép mã ngay (chỉ hiển thị lần này)</strong><textarea readOnly value={token} onFocus={e=>e.target.select()}/></div>}
        {codesError&&<p role="alert" className="ops-alert">{codesError}</p>}
      </section>
      <section className="ops-panel ops-code-panel">
        <div className="ops-panel-head"><div><span className="ops-eyebrow">LỊCH SỬ MÃ</span><h2>{codes.length} mã đã tạo</h2></div></div>
        {codes.map(code=><div className="ops-code-row" key={code.id}>
          <div><strong>{code.label}</strong><p>Hết hạn {code.expires>4102444800000?'khi thu hồi':fmtTime(code.expires)}</p></div>
          <div><span className="ops-status">{code.revoked?'Đã thu hồi':code.expires<Date.now()?'Hết hạn':'Đang hoạt động'}</span>
            {!code.revoked&&<button type="button" disabled={busy} onClick={()=>{if(confirm('Thu hồi mã của '+code.label+'?'))void codeAction({action:'revoke',id:code.id})}}>Thu hồi</button>}</div>
        </div>)}
      </section>
    </>}
    <footer className="ops-footer">AN STORE · ADMIN DASHBOARD <span>Không tự động bật thanh toán hoặc phát hành mã cho đơn demo.</span></footer>
  </main>;
}
