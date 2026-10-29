// ============================================================
// Locket - RevenueCat Header Bypass (Safe)
// Chỉ chạy với Locket, chỉ xóa header cache RevenueCat
// ============================================================
(function () {
  try {
    var headers = $request.headers || {};
    var ua = headers['User-Agent'] || headers['user-agent'] || headers['USER-AGENT'] || '';
    if (!ua.includes('Locket')) return $done({});

    var result = Object.assign({}, headers);
    var stripList = ['x-revenuecat-etag', 'x-revenuecat-request-id'];

    for (var key in result) {
      if (result.hasOwnProperty(key) && stripList.indexOf(key.toLowerCase()) !== -1) {
        delete result[key];
      }
    }
    $done({ headers: result });
  } catch (e) {
    $done({});
  }
})();
