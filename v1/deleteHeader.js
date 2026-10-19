// Locket only: preserve requests from every other application.
(function(){
 const headers=$request.headers||{};
 const ua=headers['User-Agent']||headers['user-agent']||'';
 if(!ua.includes('Locket'))return $done({});
 const result={...headers};
 for(const key of Object.keys(result))if(key.toLowerCase()==='x-revenuecat-etag')delete result[key];
 $done({headers:result});
})();
