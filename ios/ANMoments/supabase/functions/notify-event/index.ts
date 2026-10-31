// APNs notification worker. Invoke only from a trusted Supabase Database Webhook
// with a secret apikey; never from the public iOS client.
// Requires environment secrets APNS_PRIVATE_KEY, APNS_KEY_ID, APNS_TEAM_ID,
// APNS_BUNDLE_ID, APNS_ENVIRONMENT. No Apple credentials are committed.
import { withSupabase } from 'npm:@supabase/server@1'
import { importPKCS8, SignJWT } from 'npm:jose@6'

type EventPayload = {
  record?: { id?: string }
  type?: string
  table?: string
}

export default {
  fetch: withSupabase({ auth: 'secret' }, async (request, ctx) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 })
    }
    let payload: EventPayload
    try { payload = await request.json() }
    catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }) }
    const eventID = payload?.record?.id
    if (!eventID || !/^[0-9a-f-]{36}$/i.test(eventID)) {
      return Response.json({ error: 'Invalid event id' }, { status: 400 })
    }

    // Do not trust recipient IDs in webhook JSON. Re-fetch from DB by event id.
    const { data: event, error: readError } = await ctx.supabaseAdmin
      .from('activity_events')
      .select('id,recipient_id,event_kind')
      .eq('id', eventID).single()
    if (readError || !event) return Response.json({ error: 'Event not found' }, { status: 404 })

    const keyID = Deno.env.get('APNS_KEY_ID')
    const teamID = Deno.env.get('APNS_TEAM_ID')
    const bundleID = Deno.env.get('APNS_BUNDLE_ID')
    const privateKey = Deno.env.get('APNS_PRIVATE_KEY')
    if (!keyID || !teamID || !bundleID || !privateKey) {
      return Response.json({ error: 'APNs is not configured' }, { status: 503 })
    }
    const cryptoKey = await importPKCS8(privateKey.replace(/\\n/g, '\n'), 'ES256')
    const jwt = await new SignJWT({ iss: teamID })
      .setProtectedHeader({ alg: 'ES256', kid: keyID })
      .setIssuedAt().sign(cryptoKey)

    const { data: devices, error: deviceError } = await ctx.supabaseAdmin
      .from('device_push_tokens').select('token')
      .eq('user_id', event.recipient_id)
    if (deviceError) return Response.json({ error: 'Device lookup failed' }, { status: 500 })

    const environment = Deno.env.get('APNS_ENVIRONMENT') === 'production'
      ? 'https://api.push.apple.com'
      : 'https://api.sandbox.push.apple.com'
    const message = event.event_kind === 'message'
      ? 'Bạn có tin nhắn mới.'
      : event.event_kind === 'moment'
        ? 'Bạn nhận được một khoảnh khắc.'
        : 'Bạn có lời mời kết bạn.'
    let sent = 0
    for (const device of devices ?? []) {
      const response = await fetch(environment + '/3/device/' + device.token, {
        method: 'POST',
        headers: {
          authorization: 'bearer ' + jwt,
          'apns-topic': bundleID,
          'apns-push-type': 'alert',
          'apns-priority': '10',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          aps: {
            alert: { title: 'AN Moments', body: message },
            sound: 'default',
          },
        }),
        signal: AbortSignal.timeout(8000),
      }).catch(() => null)
      if (response?.ok) sent++
    }
    return Response.json({ sent, devices: (devices ?? []).length })
  }),
}
