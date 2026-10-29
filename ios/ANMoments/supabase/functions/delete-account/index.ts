// AN Moments — authenticated self-service account deletion.
// Requires deployment to the dedicated AN Moments Supabase project.
// NO service_role key is embedded in the mobile app.
// See https://supabase.com/docs/guides/functions/auth
import { withSupabase } from 'npm:@supabase/server@1'

async function clearOwnedMedia(admin: any, bucket: string, userID: string) {
  const limit = 100
  // The bucket contains only paths under userID/*.jpg or *.mov.
  // Delete a page before listing the next page to avoid offset skips.
  for (let page = 0; page < 500; page++) {
    const { data: files, error: listError } = await admin.storage
      .from(bucket)
      .list(userID, { limit, offset: 0 })
    if (listError) throw listError
    const names = (files ?? [])
      .filter((file: any) => file.name && file.id)
      .map((file: any) => userID + '/' + file.name)
    if (!names.length) return
    const { error: removeError } = await admin.storage
      .from(bucket)
      .remove(names)
    if (removeError) throw removeError
  }
  throw new Error('Media cleanup exceeded operation budget; retry required')
}

async function preserveOtherMembersRooms(admin: any, userID: string) {
  const { data: rooms, error } = await admin
    .from('conversations')
    .select('id')
    .eq('created_by', userID)
  if (error) throw error
  for (const room of rooms ?? []) {
    const { data: successor, error: lookupError } = await admin
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', room.id)
      .neq('user_id', userID)
      .limit(1)
      .maybeSingle()
    if (lookupError) throw lookupError
    if (successor) {
      const { error: transferError } = await admin.from('conversations')
        .update({ created_by: successor.user_id })
        .eq('id', room.id).eq('created_by', userID)
      if (transferError) throw transferError
    }
  }
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, ctx) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 })
    }
    const id = ctx.userClaims?.id
    if (!id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    // Dangerous operations must only execute against the caller's verified id.
    const admin = ctx.supabaseAdmin
    try {
      await preserveOtherMembersRooms(admin, id)
      await clearOwnedMedia(admin, 'moments', id)
      await clearOwnedMedia(admin, 'chat_media', id)

      // auth deletion cascades the profile and its dependent rows.
      // Sessions/access tokens may remain valid until JWT expiry;
      // use short expiry, revoke sessions and sign out client.
      const { error: deleteError } = await admin.auth.admin.deleteUser(id)
      if (deleteError) throw deleteError
      return Response.json({ deleted: true })
    } catch (error) {
      // Repeated calls may be necessary after partial media cleanup.
      // Do not return successful deletion if any operation fails.
      console.error('Account deletion failed for current authenticated user:', error)
      return Response.json({
        error: 'Could not complete account deletion. Retry or contact support.'
      }, { status: 500 })
    }
  }),
}
