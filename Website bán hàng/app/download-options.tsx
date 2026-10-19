 'use client';
const options=[
['ifywnx-Locket-Captions.sgmodule','1 · Locket + Caption','Chọn bộ này nếu chỉ dùng Locket.'],
['ifywnx-Locket-DNS.mobileconfig','3 · DNS bản cũ — tuỳ chọn','Hồ sơ dùng dịch vụ my.ublockdns.com của bên thứ ba, không do ifywnx quản lý. Không bảo đảm duy trì Gold.']
];
export default function Downloads({base}:{base:string}){return <>{options.map(([file,title,description])=>{const url=base+file;return <article key={file}><h3>{title}</h3><p>{description}</p><a className="button" href={file.endsWith('.mobileconfig')?url:file.endsWith('.conf')?'shadowrocket://config/add/'+url:'shadowrocket://install?module='+encodeURIComponent(url)}>{file.endsWith('.mobileconfig')?'Tải hồ sơ DNS':'Mở Shadowrocket để cài'} ↗</a><details><summary>Liên kết thủ công</summary><input readOnly aria-label={title} value={url} onFocus={e=>e.target.select()}/></details></article>})}</>}