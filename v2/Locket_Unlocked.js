// An V15 - FULL ICON / SEMANTIC & EDITORIAL COLOR / VERTICAL LOCKET PREVIEW
// Only caption catalog / overlay grouping logic changed; other config preserved.
// ============================================================
// An V15 - Video 30s / 0.9 Mbps
// Đưa thời lượng và bitrate video về mức V3; cần kiểm thử gửi/nhận trên thiết bị.
// ============================================================
(function () {
  var rawBody = (typeof $response !== "undefined" && $response && typeof $response.body === "string") ? $response.body : "{}";
  var result = { body: rawBody };

  function safeMergeJSON(rawValue, overrides) {
    if (typeof rawValue === "undefined" || rawValue === null || rawValue === "") {
      return JSON.stringify(overrides);
    }
    try {
      var parsed = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return JSON.stringify(Object.assign({}, parsed, overrides));
      }
      return rawValue;
    } catch (e) {
      return rawValue;
    }
  }

  try {
    if (typeof $request === "undefined" || !$request ||
        typeof $response === "undefined" || !$response || !$response.body) {
      return $done(result);
    }

    var headers = $request.headers || {};
    var ua = headers["User-Agent"] || headers["user-agent"] || headers["USER-AGENT"] || "";
    var reqUrl = typeof $request.url === "string" ? $request.url : "";

    var matchesProject = /^https:\/\/firebaseremoteconfig\.googleapis\.com\/v1\/projects\/locket-4252a\/.+/i.test(reqUrl);
    var matchesUA = /(?:^|[^a-z0-9])locket(?=$|[^a-z0-9])/i.test(ua);

    if ((reqUrl && !matchesProject) || (!reqUrl && !matchesUA)) return $done(result);

    var data = JSON.parse($response.body);
    if (!data || typeof data !== "object" || Array.isArray(data) || !data.entries) return $done(result);

    var entries = data.entries;

    // V3 compatibility experiment. Storage buckets remain server-controlled.
    Object.assign(entries, {
      live_photos: JSON.stringify({
            capture: true,
            viewing: true,
            catch_up: true,
            widget_looping_mode: "never"
        }),
      friend_limit_geo_override: JSON.stringify({ experiments: {}, area_code_overrides: {} }),
      friends_sheet_locket_count_config: JSON.stringify({
            items: [
                { threshold: 0, icon_name: "heart" },
                { threshold: 1, icon_name: "heart.fill" },
                { threshold: 10, emoji: "🤍" },
                { threshold: 100, emoji: "💛" },
                { threshold: 500, emoji: "❤️‍🔥" },
                { threshold: 1000, emoji: "🌟🫶🌟" },
                { threshold: 2000, emoji: "✨💟✨" },
                { threshold: 5000, emoji: "⚡️😵‍💫⚡" },
                { threshold: 10000, emoji: "✨⚡️😱⚡✨" }
            ]
        }),
      friend_locket_count_config: JSON.stringify({
            items: [
                { threshold: 0, icon_name: "heart" },
                { threshold: 1, icon_name: "heart.fill" },
                { threshold: 10, emoji: "🤍" },
                { threshold: 100, emoji: "💛" },
                { threshold: 500, emoji: "❤️‍🔥" },
                { threshold: 1000, emoji: "✨💗✨" },
                { threshold: 2000, emoji: "✨️⭐️✨" },
                { threshold: 5000, emoji: "✨💎✨" },
                { threshold: 10000, emoji: "✨🔐💛✨" }
            ]
        }),
      prompt_contact_permissions_on_search: "true",
      populate_phone_numbers_from_suggest_friends: "true",
      get_moment_views_as_cloud_function: "true",
      messages_integration: "true",
      fetch_moments_in_conversation: "true",
      hide_chat_button: "false",
      calendar_rewind_enabled: "false",
      locket_yearbook_story_sharing_encouraged: "true",
      rollcall_comment_actions: "true",
      rollcall_profile_button: "true",
      rollcall_prompt_export_after_share: "true",
      rollcall_confirm_skip_tagging: "false",
      rollcall_tap_to_tag_enabled: "false",
      widget_last_sent_indicator: "false",
      widget_sync_token_reload_mode: "clearTokenNever",
      live_activity_onboarding: "true",
      live_activity_onboarding_variant: "friending",
      register_live_activity_push_to_start_token: "true",
      live_activity_remove_stale_start_token: "true",
      notification_preferences_live_activities: "true",
      prompt_notification_permissions_after_friending: "true",
      qr_code_config: JSON.stringify({ profile_enabled: true, scanning_enabled: true }),
      profile_menu_v2_enabled: "true",
      use_doc_dir_for_image_cache: "true",
      efficient_history_cache_invalidation: "true",
      timestamp_based_history_fetches: "true",
      get_latest_moment_v2: "true",
      fetch_users_from_cloud_function: "true",
      keychain_access_retries: "true",
      blocked_users_cached_sync_enabled: "true",
      invite_link_preview_variant: "4",
      share_history_config: JSON.stringify({ prompt_enabled: false, fetching_enabled: true }),
      share_history_prompt_enabled: "false",
      use_thumbnails_for_sharing: "true",
      use_thumbnails_in_timeline: "true"
    });

    // Restore V3 self-only recipient option; verify recipients before sending.
    entries.send_to_self_only_mode = "always_enabled";

    // ============================================================
    // 1. GOLD + FEATURE GATES
    // ============================================================
    entries.feature_gates = safeMergeJSON(entries.feature_gates, {
      app_icon_picker: "enabled", camera_roll: "enabled", camera_theme: "enabled",
      custom_widget_frames: "enabled", locket_views: "enabled", long_captions: "enabled",
      longer_video: "enabled", unlimited_friends: "enabled", priority_support: "enabled",
      profile_badge: "enabled", remove_ads: "enabled", streak_recovery: "enabled",
      video: "enabled", video_audio: "enabled", high_quality_video: "enabled",
      hd_media_upload: "enabled", rollcall: "enabled", time_travel: "enabled",
      group_chats: "enabled", magic_cutout: "enabled", ai_captions: "enabled",
      lenses: "enabled", photo_booth: "enabled"
    });

    entries.upsell_features = safeMergeJSON(entries.upsell_features, {
      app_icon_picker: true, camera_roll: true, camera_theme: true,
      custom_widget_frames: true, locket_views: true, remove_ads: true,
      longer_video: true, streak_recovery: true
    });

    entries.paywall_presentation_config = JSON.stringify({
      uid: "paywall_testflight",
      onboarding: false,
      after_sent_moment: false,
      on_foreground: false,
      interval: 2592000,
      profile_banner: true
    });

    // ============================================================
    // 2. VIDEO 30s - CẤU HÌNH KIỂM THỬ
    // 30s + bitrate 0.9 Mbps; chưa xác nhận upload trên thiết bị.
    // KHÔNG fake max_file_size_mb / upload_timeout
    // KHÔNG tạo media_upload / video_config
    // ============================================================
    Object.assign(entries, {
      camera_roll_preview_enabled: "true",
      camera_roll_video_enabled: "true",
      camera_roll_video_upload_enabled: "true",
      internal_camera_roll_video_upload_enabled: "true",
      longer_camera_roll_videos_enabled: "true",
      camera_roll_video_max_duration: "30.0",
      camera_roll_max_duration: "30.0",
      camera_roll_duration: "30.0",
      max_video_duration: "30.0",
      video_max_duration: "30.0",
      video_trim_max_duration: "30.0",
      trim_max_duration: "30.0",
      gold_max_duration: "30.0",
      goldMaxDuration: "30.0",
      max_video_length_seconds: "30.0",
      video_quality_mbps: "0.9",
      video_sound_enabled: "true",
      microphone_enabled: "true",
      camera_microphone_enabled: "true",
      audio_session_deactivation_enabled: "true",
      zoom_enabled: "true",
      upload_main: "false",
      upload_main_image_quality: "1.0",
      upload_main_image_size: "1440",
      upload_thumbnail_image_quality: "1.0",
      upload_thumbnail_image_size: "1020"
    });

    entries.camera = safeMergeJSON(entries.camera, {
      gold_max_duration: 30.0, goldMaxDuration: 30.0,
      max_duration: 30.0, maxDuration: 30.0,
      ultra_wide: true, ultraWide: true,
      volume_button: true, volumeButton: true,
      flash_button: true, telephoto: true,
      srgb: true, lanczos: true,
      quality_mbps: 0.9, qualityMbps: 0.9
    });

    entries.camera_roll = safeMergeJSON(entries.camera_roll, {
      gold_max_duration: 30.0, goldMaxDuration: 30.0,
      video_max_duration: 30.0, videoMaxDuration: 30.0,
      max_duration: 30.0, maxDuration: 30.0,
      trim_max_duration: 30.0, trimMaxDuration: 30.0,
      camera_roll_max_duration: 30.0,
      quality_mbps: 0.9, qualityMbps: 0.9,
      flash_button: true
    });

    if (!entries.camera_filter_config || entries.camera_filter_config === "") {
      entries.camera_filter_config = JSON.stringify({
        allows_custom_filters: true, show_filter_button: true,
        sheet_enabled: true, open_sheet_immediately: true,
        sheet_filters: [
          { title: { en: "Goofy" }, filter_ids: ["okay_wig","influencer","looks_maxxing","toothless","bye_brows"] },
          { title: { en: "Looks" }, filter_ids: ["bowling_ball","blonde_bleached","beard","bob_cut","buns","tatted","mohawk","braces","bye_brows"] },
          { title: { en: "Celebrate" }, filter_ids: ["slimed","princess","disco_lights","cash_money","happy_birthday"] },
          { title: { en: "Cute" }, filter_ids: ["cutesy","sticker_face","flower_crown","love_bug"] },
          { title: { en: "Costumes" }, filter_ids: ["wedding","cowboy_cowgirl","giraffe","clown"] },
          { title: { en: "Holidays" }, filter_ids: ["easter_bunney_cutout","easter_chick_cutout","bearded","leprechaun","lucky_face","sweet_hearts","elf_cutout","santa_cutout","frosty"] }
        ],
        picker_filters: [
          "okay_wig","influencer","looks_maxxing","toothless","bye_brows",
          "bowling_ball","blonde_bleached","beard","bob_cut","buns","tatted","mohawk","braces",
          "slimed","princess","disco_lights","cash_money","happy_birthday",
          "cutesy","sticker_face","flower_crown","love_bug",
          "wedding","cowboy_cowgirl","giraffe","clown",
          "easter_bunney_cutout","easter_chick_cutout","bearded","leprechaun","lucky_face","sweet_hearts","elf_cutout","santa_cutout","frosty"
        ]
      });
    } else {
      entries.camera_filter_config = safeMergeJSON(entries.camera_filter_config, {
        show_filter_button: true, sheet_enabled: true
      });
    }

    // ============================================================
    // 3. WIDGET SHIN-CHAN + POPUP AN
    // ============================================================
    entries.widget_frame_event = JSON.stringify({
      uid: "shin_chan_custom_anh",
      url: "https://i.ibb.co/sdx3xg0D/A-nh-Chat-GPT-12-39-54-18-thg-10-2026.png",
      placement: "below", use_local_time_zone: true,
      start_at: "2020-01-01T00:00:00", end_at: "2099-12-31T23:59:59"
    });
    entries.android_widget_frame_event_enabled = "true";
    entries.widget_badge_enabled = "true";

    entries.feature_discovery_popup_config = JSON.stringify({
      tag: "LOCKET GOLD", tag_gradient: true, tag_style: "gold_gradient",
      title: "Lên Locket Gold rồi đó 😎",
      feature_set: [{
        title: "Chào mừng đến với An ✨",
        body: "Chúc bạn chia sẻ thật nhiều khoảnh khắc đẹp 💛",
        imageURL: "__ASSET_BASE__/assets/locket-gold-an.png"
      }],
      primary_button_title: "Xong",
      campaign: "an_welcome_v2",
      start_at: "2020-01-01T00:00:00", end_at: "2099-12-31T23:59:59",
      use_local_time_zone: true
    });

    // ============================================================
    // 4. ADS / TRACKING / SENTRY / APP CONFIG
    // ============================================================
    Object.assign(entries, {
      history_ads_mode: "off",
      history_ads_prefetch_count: "0",
      history_ads_prefetch_immediate: "false",
      history_ads_prefetch_reroute: "false",
      history_ads_dynamic_insertion: "false",
      history_ads_refresh_prefetch_on_foreground: "false",
      history_ads_floor_price: "0",
      history_ads_floor_price_att: "0",
      history_ad_log_displayed_on_background: "false",
      history_ads_debug_menu: "false",
      sentry_sample_rate: "0",
      sentry_network_tracing: "false",
      sentry_performance_tracking: "false",
      sentry_trace_sample_rate: "0",
      sentry_profiles_sample_rate: "0",
      enable_analytics: "false",
      crashlytics_enabled: "false",
      firebase_performance_enabled: "false",
      disable_telemetry: "true",
      show_watermark: "false",
      watermark_enabled: "false",
      profile_badge_visible: "true",
      custom_profile_pics: "true",
      android_subscribe_gold_button_enabled: "false",
      lunar_new_year_app_icon_enabled: "true",
      settings_tiktok_url: "https://tiktok.com/@ifywnx"
    });

    // ============================================================
    // 5. FRIENDS / MOMENTS / STREAK / CHAT
    // ============================================================
    Object.assign(entries, {
      max_friends_count: "999999",
      friend_limit_mode: "0",
      soft_friend_limit_threshold_count: "999999",
      show_friend_limit_on_cam: "false",
      signup_max_friends_count: "999999",
      celebrity_inbox_limit: "999999",
      new_friends_monitoring_enabled: "true",
      improved_friend_suggestions: "true",
      show_friend_suggestions_by_default: "true",
      emoji_friend_suggestions: "true",
      hide_friends_enabled: "true",
      hide_invite_links: "false",
      hide_skip_contacts: "true",
      show_all_contacts: "true",
      show_invite_suggestions: "true",
      show_no_friends_bottom_sheet: "false",
      signup_allow_skip_add_friends: "true",
      moment_views_enabled: "true",
      moment_views_v2: "true",
      record_moment_views: "true",
      notify_moment_views: "true",
      moment_reactions_v2: "true",
      chat_reactions_enabled: "true",
      conversation_reactions: "true",
      typing_indicators_enabled: "true",
      unsend_message_enabled: "true",
      reply_prototype_enabled: "true",
      conversations_enabled: "true",
      groups_enabled: "true",
      time_travel_rewind_v2_enabled: "true",
      calendar_delete_moment_enabled: "true",
      rollcall_enabled: "true"
    });

    try {
      var streak = JSON.parse(entries.streak_config || "{}");
      streak.minimum_recovery_count = 0;
      streak.minimum_display_count = 0;
      entries.streak_config = JSON.stringify(streak);
    } catch (e) {}

    // ============================================================
    // 6. CACHE / CDN / STORAGE / WIDGET CONFIG
    // ============================================================
    Object.assign(entries, {
      cdn_domain_replacements: JSON.stringify({
        "firebasestorage.googleapis.com": "cdn.locketcamera.com"
      }),
      cdn_domain_replacements_video: "true",
      image_cache_max_age_sec: "157680000",
      image_cache_max_size: "400000000",
      history_cache_age_days: "1000",
      user_cache_max_age_sec: "691200",
      friends_cache_max_age_sec: "2592000",
      image_fetch_cache: "true",
      image_cache_use_shared: "true",
      refresh_interval: "60",
      firestore_refresh_v2: "true",
      firestore_refresh_v3: "true",
      beta_features_enabled: "true",
      join_testflight_enabled: "true",
      safety_center: "true",
      help_center: "true",
      support_v2: "true",
      privacy_choices_setting: "true",
      request_att_permission: "true",
      persist_onboarding_step: "true",
      onboarding_contact_permission_step: "true",
      widget_frame_event_max_images: "5",
      widget_badge_v2: "true",
      widget_stale_state_enabled: "false",
      notification_preferences: "true",
      notification_reply_body_visible: "true",
      activity_bar_enabled: "true",
      journal_activity_bar_enabled: "true"
    });

    try {
      var journal = JSON.parse(entries.journal_settings || "{}");
      Object.assign(journal, {
        debug_menu_enabled: false,
        focus_animation: true,
        compact_header: true,
        friends_button: true,
        reverse_scroll_direction: false,
        streak_visualization: true,
        streak_visualization_style: "gradient",
        streak_header_minimum_count: 0,
        streak_visualization_minimum_count: 2,
        overlay_indicators: { location: true, music: true, static_content: true, weather: true }
      });
      entries.journal_settings = JSON.stringify(journal);
    } catch (e) {}

    // ============================================================
    // 7. OVERLAY & CAPTIONS (P1 - bắt đầu catalog)
    // ============================================================
    entries.overlay_navigator_enabled = "true";
    entries.overlays_v2_config = JSON.stringify({ suggestions_enabled: true });
    entries.captions_enabled = "true";
    entries.music_caption_enabled = "true";
    entries.music_caption_song_preview_enabled = "true";
    entries.link_caption_link_enabled = "true";
    entries.overlay_dynamic_captions = JSON.stringify([
      "standard", "poll", "color_palette", "review", "music", "location",
      "weather", "time", "streak", "star_sign", "party_time", "locket_count",
      "good_morning", "goodnight", "ootd", "miss_you", "custom", "phunu_2010", "halloween_2026"
    ]);

    var existing = [];
    if (typeof entries.overlay_items === "string") {
      try { existing = JSON.parse(entries.overlay_items) || []; } catch (err) {}
    } else if (Array.isArray(entries.overlay_items)) {
      existing = entries.overlay_items;
    }

    // The user removed this decorative caption: also drop it from any existing remote list.
    if (Array.isArray(existing)) {
      existing = existing.map(function (group) {
        if (!group || !Array.isArray(group.items)) return group;
        var copy = Object.assign({}, group);
        copy.items = group.items.filter(function (item) {
          return item && item.overlay_id !== "caption:cu";
        });
        return copy;
      });
    }

    // Retire a removed caption even when it is already present in the server response.
    existing = existing.filter(function (grp) {
      if (!grp || !Array.isArray(grp.items)) return true;
      grp.items = grp.items.filter(function (it) { return it && it.overlay_id !== "caption:cu"; });
      return grp.items.length > 0;
    });

    // Only restore Holiday Caption and Decorative by Locket from the original bundle.
    // Remove nine unrelated legacy sections accidentally reintroduced by the previous build.
    var retiredLegacySections = ["🌸 Độc lạ", "🌸 Trend TikTok", "Gen Z Life 🩻", "🌸 Meme vui nhộn", "🌸 Đời sống", "🌸 Gen Z Slay", "🌸 Bất ổn & Khó đỡ", "🌸 Check VAR & Hóng hớt", "🌸 Góc Deadline & Đi Làm"];
    if (Array.isArray(existing)) {
      existing = existing.filter(function (group) {
        return group && retiredLegacySections.indexOf(group.section) === -1;
      });
    }


    // An: bỏ các caption nhắc tên thương hiệu cũ trong nhóm by ifywnx.
    // Nếu server còn gửi các overlay cũ, cũng loại bỏ trước khi gộp catalog.
    var retiredBrandCaptionIds = new Set(["caption:ifywnx_brand_beta_cinemas", "caption:ifywnx_brand_bhd_star", "caption:ifywnx_brand_bobapop", "caption:ifywnx_brand_bong_bieng", "caption:ifywnx_brand_cgv", "caption:ifywnx_brand_chagee", "caption:ifywnx_brand_cheese_coffee", "caption:ifywnx_brand_cinestar", "caption:ifywnx_brand_cong_ca_phe", "caption:ifywnx_brand_ding_tea", "caption:ifywnx_brand_galaxy_cinema", "caption:ifywnx_brand_life4cuts", "caption:ifywnx_brand_lotte_cinema", "caption:ifywnx_brand_man_man", "caption:ifywnx_brand_maycha", "caption:ifywnx_brand_phe_la", "caption:ifywnx_brand_photoism", "caption:ifywnx_brand_starbucks", "caption:ifywnx_brand_the_alley", "caption:ifywnx_brand_vien_vien", "caption:ifywnx_place_bach_hoa_xanh", "caption:ifywnx_place_cinema_time", "caption:ifywnx_place_circle_k_time", "caption:ifywnx_place_familymart_time", "caption:ifywnx_place_gongcha_time", "caption:ifywnx_place_gs25_time", "caption:ifywnx_place_highlands_time", "caption:ifywnx_place_jollibee_time", "caption:ifywnx_place_katinat_time", "caption:ifywnx_place_kfc_time", "caption:ifywnx_place_koi_the_time", "caption:ifywnx_place_lotteria_time", "caption:ifywnx_place_ministop_time", "caption:ifywnx_place_mixue_time", "caption:ifywnx_place_ngo_gia_time", "caption:ifywnx_place_phuc_long_time", "caption:ifywnx_place_seven_eleven_time", "caption:ifywnx_place_tam_hao_time", "caption:ifywnx_place_the_coffee_house", "caption:ifywnx_place_tocotoco_time", "caption:ifywnx_place_winmart_time", "caption:mixue_time"]);
    if (Array.isArray(existing)) {
      existing = existing.map(function (group) {
        if (!group || group.section !== "🎨 Decorative by An" || !Array.isArray(group.items)) return group;
        var nextGroup = Object.assign({}, group);
        nextGroup.items = group.items.filter(function (item) {
          return item && !retiredBrandCaptionIds.has(item.overlay_id);
        });
        return nextGroup;
      });
    }

    var seen = new Set();
    if (Array.isArray(existing)) {
      existing.forEach(function (grp) {
        if (grp && Array.isArray(grp.items)) {
          grp.items.forEach(function (it) {
            if (it && it.overlay_id) seen.add(it.overlay_id);
          });
        }
      });
    } else {
      existing = [];
    }

    var catalog = [
  {
    "section": "💛 Ủng hộ An",
    "items": [
      {
        "overlay_id": "caption:ifywnx_ung_ho_an_locket_gold",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mua Locket Gold ủng hộ An nha",
          "max_lines": 2,
          "background": {
            "colors": [
              "#FFE680",
              "#FFC53D"
            ]
          },
          "text_color": "#5B4300",
          "icon": {
            "type": "emoji",
            "data": "💛"
          }
        }
      }
    ]
  },
  {
    "section": "🎨 General",
    "items": [
      {
        "overlay_id": "caption:standard",
        "source": "local",
        "caption": {
          "type": "standard"
        }
      },
      {
        "overlay_id": "caption:review",
        "source": "local",
        "caption": {
          "type": "review"
        }
      },
      {
        "overlay_id": "caption:music",
        "source": "local",
        "caption": {
          "type": "music"
        }
      },
      {
        "overlay_id": "caption:location",
        "source": "local",
        "caption": {
          "type": "location"
        }
      },
      {
        "overlay_id": "caption:weather",
        "source": "local",
        "caption": {
          "type": "weather"
        }
      },
      {
        "overlay_id": "caption:time",
        "source": "local",
        "caption": {
          "type": "time"
        }
      },
      {
        "overlay_id": "caption:streak",
        "source": "local",
        "caption": {
          "type": "streak"
        }
      },
      {
        "overlay_id": "caption:star_sign",
        "source": "local",
        "caption": {
          "type": "star_sign"
        }
      },
      {
        "overlay_id": "caption:poll",
        "source": "local",
        "caption": {
          "type": "poll"
        }
      },
      {
        "overlay_id": "caption:color_palette",
        "source": "local",
        "caption": {
          "type": "color_palette"
        }
      },
      {
        "overlay_id": "caption:locket_count",
        "source": "local",
        "caption": {
          "type": "locket_count"
        }
      }
    ]
  },
  {
    "section": "🎨 Holiday Caption",
    "items": [
      {
        "overlay_id": "caption:ifywnx_holiday_xuan_mong_mo",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một chiếc mùa xuân",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B4DECE",
              "#81C6A5"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌸"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_tet_xuan_sang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Xuân sang rực rỡ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F4BD6D",
              "#E8A552",
              "#DB8D36"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌺"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_ha_cham_cua",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hè chạm ngõ rồi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#42C3CD",
              "#2998C7"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌞"
          }
        }
      },
      {
        "overlay_id": "caption:autumn_2026",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#FFE0A0",
              "#F6A53A"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍂"
          },
          "max_lines": 1,
          "text": "Xin chào Mùa Thu",
          "localized_text": {
            "en": "Xin chào Mùa Thu",
            "vn": "Xin chào Mùa Thu"
          },
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_thu_nhe_nhang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hẹn nhau mùa thu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A86639",
              "#603C2B"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🍂"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_dong_am",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đông này có nhau",
          "max_lines": 1,
          "background": {
            "colors": [
              "#AFBAD9",
              "#8389B6"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧣"
          }
        }
      },
      {
        "overlay_id": "caption:new_years_day_2027",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EAB05C",
              "#C67E32"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💫"
          },
          "max_lines": 1,
          "text": "Chúc mừng năm mới!",
          "localized_text": {
            "en": "Chúc mừng năm mới!",
            "vn": "Chúc mừng năm mới!"
          },
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_tet_chuc_mung",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chúc mừng năm mới",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F2CF8B",
              "#D9A354"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧧"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_tet_tai_loc",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tết đến lộc về",
          "max_lines": 1,
          "background": {
            "colors": [
              "#832B31",
              "#CA4B2B"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🪙"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_tet_ong_tao",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ông Táo về trời",
          "max_lines": 1,
          "background": {
            "colors": [
              "#7FAAD2",
              "#917FCD"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🐟"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_international_childrens_day",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Vui Tết Thiếu nhi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F4C66C",
              "#D99739"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎈"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_doan_ngo",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tết Đoan Ngọ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#8C2633",
              "#D33F25"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🍃"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_tet_co_truyen",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tết Việt trong tim",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DC2837",
              "#97253B"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🧧"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_valentine",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Happy Valentine",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CCA8D8",
              "#A07FBF"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💘"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_international_womens_day",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chúc mừng 8/3",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E6C175",
              "#DA9365"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌷"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_seventh_day",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thất tịch có đôi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E6C0AD",
              "#BE8A8E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💞"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_april_30",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mừng ngày 30/4",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C35521",
              "#832623"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🇻🇳"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_hung_kings",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nhớ ngày Giỗ Tổ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D53739",
              "#A81725"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🏮"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_ngay_gia_dinh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày Gia đình Việt Nam",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CF4337",
              "#9B2E36"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🏡"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_ha_noi_10_10",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hà Nội ngày trở về",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E7A983",
              "#D1708B"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🏛️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_sach_viet_nam",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày Sách Việt Nam",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DF3124",
              "#991D22"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_khai_giang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Khai giảng rộn ràng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#85BDC8",
              "#4F96B1"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎒"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_mua_tot_nghiep",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mùa tốt nghiệp tới rồi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D7AB91",
              "#B87A7F"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎓"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_ngay_cua_me",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày của Mẹ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BCCDAF",
              "#8BAF98"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💐"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_ngay_cua_ba",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày của Ba",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A9CDCB",
              "#7CACB8"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💙"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_mid_autumn_moon",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trung thu lung linh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F8D68A",
              "#C18D48"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌕"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_lantern_night",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đêm hội trăng rằm",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DBC499",
              "#B77D61"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥮"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_ram_thang_bay",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Rằm tháng Bảy bình an",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EEB67A",
              "#C3785F"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪷"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_diet_sau_bo",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mùng năm tháng năm",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E7AF58",
              "#DB7848"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍑"
          }
        }
      },
      {
        "overlay_id": "caption:halloween_2026",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AE5D27",
              "#642C2C"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎃"
          },
          "max_lines": 1,
          "text": "Halloween",
          "localized_text": {
            "en": "Halloween",
            "vn": "Halloween"
          },
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:christmas_day_2026",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#3D845E",
              "#236145"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎄"
          },
          "max_lines": 1,
          "text": "Giáng sinh an lành",
          "localized_text": {
            "en": "Giáng sinh an lành",
            "vn": "Giáng sinh an lành"
          },
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_halloween_candy",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Kẹo hay bị ghẹo?",
          "max_lines": 1,
          "background": {
            "colors": [
              "#7D4D85",
              "#4B2F5B"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🍬"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_birthday",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Happy Birthday!",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E7B767",
              "#CF8255"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎂"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_birthday_wish",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tuổi mới thật xinh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EEAB7F",
              "#D6847E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎁"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_april_fools",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Cá tháng Tư",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C84556",
              "#8D385F"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🐟"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_happiness_every_day",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày nào cũng là ngày vui",
          "max_lines": 2,
          "background": {
            "colors": [
              "#F19568",
              "#D76969"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎊"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_ngay_moi_truong",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Yêu hành tinh xanh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EBAA57",
              "#D47046"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌍"
          }
        }
      }
    ]
  },
  {
    "section": "🎨 Decorative by Locket",
    "items": [
      {
        "overlay_id": "caption:party_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DBB3C8",
              "#CC9EBE",
              "#BC89B5"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🪩"
          },
          "max_lines": 1,
          "text": "Party Time!",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ootd",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DAD8CE",
              "#AFAEA8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🕶"
          },
          "max_lines": 1,
          "text": "OOTD",
          "text_color": "#292322",
          "type": "static_content"
        }
      }
    ]
  },
  {
    "section": "🎨 Decorative by An",
    "items": [
      {
        "overlay_id": "caption:feeling_cute",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CCB48C",
              "#AD8A6D"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌷"
          },
          "max_lines": 1,
          "text": "Feeling Cute",
          "localized_text": {
            "en": "Feeling Cute",
            "vn": "Cảm thấy dthw"
          },
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:locket_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A5C6BA",
              "#93B7AC",
              "#81A89E"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "📷"
          },
          "max_lines": 1,
          "text": "Locket Time!",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_place_tra_da_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trà đá Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A6C6E0",
              "#7B9FCA"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧊"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_tra_sua_hom_nay",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trà sữa hôm nay",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C6B0CD",
              "#A38AB7"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧋"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_mot_ly_tra_thoi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một ly trà thôi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B7D0B5",
              "#8DB49B"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍵"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_ca_phe_tam_su",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Cà phê tâm sự",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DCC5AB",
              "#AE856C"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🤎"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_place_bun_dau_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bún đậu Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E4BCA2",
              "#C48D79"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥢"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_di_an_vat",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đi ăn vặt",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B5CFE1",
              "#7BA6C3"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍡"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_ga_ran_chieu_nay",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Gà rán chiều nay",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D6C3A6",
              "#BDA587"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍗"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_ra_rap_thoi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ra rạp thôi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CBB79C",
              "#A08976"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍿"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_phim_va_bong_ngo",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Phim hay, bỏng ngô ngon",
          "max_lines": 1,
          "background": {
            "colors": [
              "#9CD1C4",
              "#66AB9E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍿"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_di_chup_photobooth",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đi chụp photobooth",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CCCD89",
              "#AEB35D"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "📷"
          }
        }
      },
      {
        "overlay_id": "caption:shopping_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B3D6D0",
              "#7EAFA9"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🛍️"
          },
          "max_lines": 1,
          "text": "Shopping Time!",
          "localized_text": {
            "en": "Shopping Time!",
            "vn": "Giờ mua sắm!"
          },
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_ghe_cua_hang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ghé cửa hàng tiện lợi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#AECBB5",
              "#87A895"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🏪"
          }
        }
      },
      {
        "overlay_id": "caption:wedding_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D9A898",
              "#BC7C7C"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💍"
          },
          "max_lines": 1,
          "text": "Wedding Time!",
          "localized_text": {
            "en": "Wedding Time!",
            "vn": "Đám cưới nè!"
          },
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:chilling_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B5D6C6",
              "#85B7AE"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌴"
          },
          "max_lines": 1,
          "text": "Chilling Time!",
          "localized_text": {
            "en": "Chilling Time!",
            "vn": "Giờ thư giãn!"
          },
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_place_healing_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Healing Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A2C5DB",
              "#6FACC1"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪷"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_place_nha_sach_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nhà sách Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A5CAD4",
              "#83A7BA"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
        }
      },
      {
        "overlay_id": "caption:graduation_day",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D5B18A",
              "#AD866F"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎓"
          },
          "max_lines": 1,
          "text": "Happy Graduation Day!",
          "localized_text": {
            "en": "Happy Graduation Day!",
            "vn": "Chúc mừng tốt nghiệp!"
          },
          "text_color": "#292322",
          "type": "static_content"
        }
      }
    ]
  },
  {
    "section": "📸 Locket mỗi ngày & An",
    "items": [
      {
        "overlay_id": "caption:buc_anh_nay_hoi_keo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9CC492",
              "#6CAA7B"
            ]
          },
          "max_lines": 1,
          "text": "Bức ảnh này hơi keo",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_chup_voi_thoi_do",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chụp vội thôi đó",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D0DFE6",
              "#8DB5CF"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "📸"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_chup_choi_ma_cuon",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chụp chơi mà cuốn",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A1B782",
              "#83A263"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧸"
          }
        }
      },
      {
        "overlay_id": "caption:mo_hon_nhung_co_gu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B9B2CC",
              "#8C89AB"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "😎"
          },
          "max_lines": 1,
          "text": "Mỏ hỗn nhưng có gu",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:cu_soc_mang_ten_visual",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F5B080",
              "#C978B5"
            ]
          },
          "max_lines": 1,
          "text": "Cú sốc mang tên visual",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤩"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_lo_xinh_roi_sao",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Lỡ xinh rồi sao",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EDB3CB",
              "#CFA4DB"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:mood_nay_khong_ban",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E0C4A1",
              "#C5987F"
            ]
          },
          "max_lines": 1,
          "text": "Mood này không bán",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫧"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_gui_cau_chiec_mood",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Gửi cậu chiếc mood",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D8A2C2",
              "#BB76B6"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💌"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_bat_mood_de_thuong",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bật mood dễ thương",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CB9BB8",
              "#A97EA6"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥹"
          }
        }
      },
      {
        "overlay_id": "caption:nhe_nhang_nhung_ba_khi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#90BCD8",
              "#698DBD"
            ]
          },
          "max_lines": 1,
          "text": "Nhẹ nhàng nhưng bá khí",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🦋"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_dinh_giau_ma_thoi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Định giấu mà thôi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DBA77E",
              "#C58055"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🤫"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_vua_thuc_day_thoi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Vừa thức dậy thôi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B9ABDD",
              "#9280C6"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥱"
          }
        }
      }
    ]
  },
  {
    "section": "☕ Đời sống & Ăn chơi",
    "items": [
      {
        "overlay_id": "caption:di_an_thoi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A5CA9F",
              "#76AF86"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍜"
          },
          "max_lines": 1,
          "text": "Đi ăn thôi",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:tra_sua_giai_cuu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F6CD9B",
              "#CD9EA8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🧋"
          },
          "max_lines": 1,
          "text": "Trà sữa giải cứu",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:di_tron_mot_hom",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D4ACD5",
              "#A77DB7"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🏖️"
          },
          "max_lines": 1,
          "text": "Đi trốn một hôm",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ke_chuyen_nghe_choi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AACDC9",
              "#71AAA6"
            ]
          },
          "max_lines": 1,
          "text": "Kể chuyện nghe chơi",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💬"
          }
        }
      },
      {
        "overlay_id": "caption:hom_nay_phai_co_aura",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F2B6BA",
              "#DC858F"
            ]
          },
          "max_lines": 1,
          "text": "Hôm nay phải có aura",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "✨"
          }
        }
      }
    ]
  },
  {
    "section": "🥂 Tiếng Việt Premium · Sang & tinh tế",
    "items": [
      {
        "overlay_id": "caption:ifywnx_premium_luxe_co_gu_la_uoc",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Có gu là được",
          "max_lines": 1,
          "background": {
            "colors": [
              "#86726F",
              "#584850"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🕶️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_khong_can_pho_truong",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Không cần phô trương",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C3B5A9",
              "#9A8A80"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "✨"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_mot_chut_co_ien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một chút cổ điển",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DEBC9A",
              "#C69977"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎞️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_nhe_nhang_ma_co_luc",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nhẹ nhàng mà có lực",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CCB08B",
              "#B18654"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍸"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_ung_gu_ung_luc",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đúng gu, đúng lúc",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CEACB0",
              "#A9808F"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "⏳"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_mot_chieu_that_tho",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một chiều thật thơ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D0B78A",
              "#AD8659"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌤️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_hom_nay_ep_nen_na",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hôm nay đẹp nền nã",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F0A9B9",
              "#CC6F94"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🕊️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_tinh_te_khong_can_noi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tinh tế không cần nói",
          "max_lines": 1,
          "background": {
            "colors": [
              "#7E717F",
              "#4C4150"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "💎"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_them_chut_du_vi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thêm chút dư vị",
          "max_lines": 1,
          "background": {
            "colors": [
              "#4B7E78",
              "#285756"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "☕"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_ep_mot_cach_tu_nhien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đẹp một cách tự nhiên",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D5C3A3",
              "#A88D65"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌼"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_gu_nay_kho_tron_lan",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Gu này khó trộn lẫn",
          "max_lines": 1,
          "background": {
            "colors": [
              "#9B5D8A",
              "#704365"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🎨"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_co_nhung_ieu_khong_can_ke",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Có những điều không cần kể",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B6B7AD",
              "#878F88"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫧"
          }
        }
      }
    ]
  },
  {
    "section": "🍃 Tiếng Việt Premium · Văn thơ",
    "items": [
      {
        "overlay_id": "caption:ifywnx_premium_nang_ghe_them_nha",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nắng ghé thềm nhà",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EBCB96",
              "#CFA36E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "☀️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_thanh_thoi_giua_nhan_gian",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thảnh thơi giữa nhân gian",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B0C799",
              "#73AB83"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍃"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_trang_ghe_ngang_hien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trăng ghé ngang hiên",
          "max_lines": 1,
          "background": {
            "colors": [
              "#ABC4D9",
              "#7399B9"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌙"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_chut_nang_trong_long",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chút nắng trong lòng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D9B7BE",
              "#BA8F99"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌤️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_lang_nghe_mua_tro_gio",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Lặng nghe mùa trở gió",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C9C1D8",
              "#9F99C5"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍁"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_nhat_mot_manh_hoang_hon",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nhặt một mảnh hoàng hôn",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E5B993",
              "#BD7D6E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌇"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_chang_voi_chang_lo",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chẳng vội, chẳng lo",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BBB1D4",
              "#8B86C3"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪷"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_nhe_tenh_nhu_gio",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nhẹ tênh như gió",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CAC1A7",
              "#A9B686"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💨"
          }
        }
      }
    ]
  },
  {
    "section": "🪄 Tiếng Việt Premium · Hài có duyên",
    "items": [
      {
        "overlay_id": "caption:ifywnx_premium_thanh_lich_co_dieu_kien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thanh lịch có điều kiện",
          "max_lines": 1,
          "background": {
            "colors": [
              "#ECA5AE",
              "#D36E86"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎀"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_duyen_dang_luc_chua_doi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Duyên dáng lúc chưa đói",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E4AA8F",
              "#C47865"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍰"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_diu_dang_den_luc_het_pin",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Dịu dàng đến lúc hết pin",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DBC77F",
              "#B29B52"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🔋"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_rat_muc_doan_trang_khi_can",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Rất mực đoan trang (khi cần)",
          "max_lines": 2,
          "background": {
            "colors": [
              "#DEB2D6",
              "#B47FB5"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_sang_trong_tu_suy_nghi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Sang trọng từ suy nghĩ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#9ECFC7",
              "#62AFA0"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "👑"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_doi_thuong_ma_khac_thuong",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đời thường mà khác thường",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F1AC7F",
              "#D77D6A"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "✨"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_hao_quang_tu_bat",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hào quang tự bật",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EBAFB2",
              "#D181A4"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌟"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_giau_tinh_cam_thieu_ngan_luong",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Giàu tình cảm, thiếu ngân lượng",
          "max_lines": 2,
          "background": {
            "colors": [
              "#DFAAC6",
              "#AA7AB2"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🤎"
          }
        }
      }
    ]
  },
  {
    "section": "🧸 Teencode · Chê yêu",
    "items": [
      {
        "overlay_id": "caption:ifywnx_premium_ba_cha_hom",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bà chã hơm",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E4A9D9",
              "#BD87C3"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎀"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_ong_cha_hui",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ông chã húi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D7A4E8",
              "#A784D6"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧸"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_ba_cha_hom_oi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bà chã hơm ơi!",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F9BD92",
              "#E98AA7"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💌"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_be_iu_o_day_ne",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bé iu ở đây nè",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EAB7D5",
              "#BD9BD9"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍓"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_be_xiu_xiu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bé xíu xiu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F4B0BA",
              "#E584B5"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🐰"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_hem_co_gian_dauu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hem có giận đâuu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F2A7B0",
              "#D986AB"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🙈"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_thuong_nhiu_thiet_nhiu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thương nhìu thiệt nhìu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F0BBAF",
              "#DB8E8D"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥰"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_mo_hon_ma_tim_mem",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mỏ hỗn mà tim mềm",
          "max_lines": 1,
          "background": {
            "colors": [
              "#FBA374",
              "#EA6D9C"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧸"
          }
        }
      }
    ]
  },
  {
    "section": "💘 Tình cảm & Thả thính",
    "items": [
      {
        "overlay_id": "caption:crush_seen_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CBA8DA",
              "#9C7FC6"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "👀"
          },
          "max_lines": 1,
          "text": "Crush seen chưa?",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:tha_thinh_khong_truot_phat_nao",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EF9E94",
              "#DA7278"
            ]
          },
          "max_lines": 1,
          "text": "Thả thính không trượt phát nào",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🏹"
          }
        }
      },
      {
        "overlay_id": "caption:muon_duoc_om",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DDB2C9",
              "#B57CA6"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🫂"
          },
          "max_lines": 1,
          "text": "Muốn được ôm",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:hom_nay_can_mot_cai_om",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DF275F",
              "#6C2E46"
            ]
          },
          "max_lines": 1,
          "text": "Hôm nay cần một cái ôm",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫂"
          }
        }
      },
      {
        "overlay_id": "caption:tinh_yeu_nay_co_that_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CCA7D5",
              "#A282BA"
            ]
          },
          "max_lines": 1,
          "text": "Tình yêu này có thật không?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💘"
          }
        }
      },
      {
        "overlay_id": "caption:tren_tinh_ban_duoi_tinh_yeu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E7AED2",
              "#AE7ABE"
            ]
          },
          "max_lines": 1,
          "text": "Trên tình bạn dưới tình yêu",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💞"
          }
        }
      },
      {
        "overlay_id": "caption:bat_che_do_yeu_duong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DE91CA",
              "#A777C8"
            ]
          },
          "max_lines": 1,
          "text": "Bật chế độ yêu đương",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💘"
          }
        }
      },
      {
        "overlay_id": "caption:chua_yeu_da_luy",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DFB9A2",
              "#B48283"
            ]
          },
          "max_lines": 1,
          "text": "Chưa yêu đã lụy",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥹"
          }
        }
      },
      {
        "overlay_id": "caption:yeu_bang_ca_tinh_mang",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#ED999F",
              "#DB6687"
            ]
          },
          "max_lines": 1,
          "text": "Yêu bằng cả tính mạng",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "❤️‍🔥"
          }
        }
      },
      {
        "overlay_id": "caption:nguoi_cu_con_thuong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EEB5BF",
              "#BE7890"
            ]
          },
          "max_lines": 1,
          "text": "Người cũ còn thương",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💭"
          }
        }
      },
      {
        "overlay_id": "caption:nguoi_thuong_cua_nguoi_ta",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DD9EB7",
              "#C37797"
            ]
          },
          "max_lines": 1,
          "text": "Người thương của người ta",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥹"
          }
        }
      },
      {
        "overlay_id": "caption:friendzone",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E695B9",
              "#C96EAA"
            ]
          },
          "max_lines": 1,
          "text": "Friendzone",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫠"
          }
        }
      },
      {
        "overlay_id": "caption:tren_muc_ban_be",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F4A9BE",
              "#D46B9A"
            ]
          },
          "max_lines": 1,
          "text": "Trên mức bạn bè",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💕"
          }
        }
      },
      {
        "overlay_id": "caption:don_phuong_la_tu_nguyen",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E4A4CB",
              "#BA78AF"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🥀"
          },
          "max_lines": 1,
          "text": "Đơn phương là tự nguyện",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:sai_nguoi_sai_thoi_diem",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E398B7",
              "#CD7292"
            ]
          },
          "max_lines": 1,
          "text": "Sai người sai thời điểm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⌛"
          }
        }
      },
      {
        "overlay_id": "caption:single_but_not_available",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E6B7A3",
              "#BE8087"
            ]
          },
          "max_lines": 1,
          "text": "Single but not available",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🪞"
          }
        }
      },
      {
        "overlay_id": "caption:doc_than_co_chon_loc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EA9CA5",
              "#D16C9F"
            ]
          },
          "max_lines": 1,
          "text": "Độc thân có chọn lọc",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🪞"
          }
        }
      },
      {
        "overlay_id": "caption:soft_launch",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E1A5C7",
              "#B57BA8"
            ]
          },
          "max_lines": 1,
          "text": "Soft launch",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌷"
          }
        }
      },
      {
        "overlay_id": "caption:private_but_not_secret",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BC5074",
              "#783C63"
            ]
          },
          "max_lines": 1,
          "text": "Private but not secret",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🔒"
          }
        }
      },
      {
        "overlay_id": "caption:doi_roi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E0B1D0",
              "#BE78AC"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🥺"
          },
          "max_lines": 1,
          "text": "Dỗi rồi",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:dinh_nhu_sam",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EDA9AA",
              "#D47B81"
            ]
          },
          "max_lines": 1,
          "text": "Dính như sam",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫂"
          }
        }
      },
      {
        "overlay_id": "caption:com_nuoc_gi_chua_nguoi_dep",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A9CBA8",
              "#7EB193"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍚"
          },
          "max_lines": 1,
          "text": "Cơm nước gì chưa người đẹp?",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:do_cai_ram",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CCA5D3",
              "#A17FB9"
            ]
          },
          "max_lines": 1,
          "text": "Đổ cái rầm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💘"
          }
        }
      }
    ]
  },
  {
    "section": "🌙 Mood & Chữa lành",
    "items": [
      {
        "overlay_id": "caption:hom_nay_toi_buon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DB9CAD",
              "#C17889"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌧️"
          },
          "max_lines": 1,
          "text": "Hôm nay tôi buồn",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:bat_luc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#84AEB5",
              "#6296A0"
            ]
          },
          "max_lines": 1,
          "text": "Bất lực",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😮‍💨"
          }
        }
      },
      {
        "overlay_id": "caption:guc_nga",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B9BFCD",
              "#878BA5"
            ]
          },
          "max_lines": 1,
          "text": "Gục ngã",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥲"
          }
        }
      },
      {
        "overlay_id": "caption:khong_cam_xuc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5F768A",
              "#39515B"
            ]
          },
          "max_lines": 1,
          "text": "Không cảm xúc",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫥"
          }
        }
      },
      {
        "overlay_id": "caption:dang_healing",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A1D5B6",
              "#7DBDA7"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍃"
          },
          "max_lines": 1,
          "text": "Đang healing",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:nao_dang_offline",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7A6BA6",
              "#4A4877"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🔋"
          },
          "max_lines": 1,
          "text": "Não đang offline",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      }
    ]
  },
  {
    "section": "✨ Aura · Slay & Flex",
    "items": [
      {
        "overlay_id": "caption:ifywnx_new_minus_1000_aura",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "-1000 aura",
          "max_lines": 1,
          "background": {
            "colors": [
              "#5C54CD",
              "#874FC2"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🥲"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_mat_sach_aura",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mất sạch aura",
          "max_lines": 1,
          "background": {
            "colors": [
              "#2F7C89",
              "#3A4EA1"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "💀"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_hom_nay_aura_hoi_cao",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hôm nay aura hơi cao",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DB95B0",
              "#BF769B"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌟"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_ba_khi_trong_tuong_tuong",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bá khí trong tưởng tượng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#3079BF",
              "#2F589E"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🌫️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_vua_xuat_hien_da_ba_khi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Vừa xuất hiện đã bá khí",
          "max_lines": 1,
          "background": {
            "colors": [
              "#3EC1D1",
              "#3296CD"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "👑"
          }
        }
      },
      {
        "overlay_id": "caption:flex_den_hoi_tho_cuoi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#28808C",
              "#3251A5"
            ]
          },
          "max_lines": 1,
          "text": "Flex đến hơi thở cuối",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:xinh_dep_tuyet_voi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EAA3B5",
              "#C47487"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💖"
          },
          "max_lines": 1,
          "text": "Xinh đẹp tuyệt vời",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:than_thai_10_diem",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5A47D4",
              "#A244BC"
            ]
          },
          "max_lines": 1,
          "text": "Thần thái 10 điểm",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💎"
          }
        }
      },
      {
        "overlay_id": "caption:dep_khong_can_giai_thich",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4D6FCE",
              "#3C4F9C"
            ]
          },
          "max_lines": 1,
          "text": "Đẹp không cần giải thích",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:keo_li_luon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#2478A9",
              "#463FB5"
            ]
          },
          "max_lines": 1,
          "text": "Keo lì luôn",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:no_cap",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#277AB7",
              "#245592"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🧢"
          },
          "max_lines": 1,
          "text": "No cap",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:hao_quang_nhan_vat_chinh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EDB3B5",
              "#B77D9E"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌟"
          },
          "max_lines": 1,
          "text": "Hào quang nhân vật chính",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_hen_nhau_trong_du_an_ma",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hẹn nhau trong dự án ma",
          "max_lines": 1,
          "background": {
            "colors": [
              "#7A58BA",
              "#9B579D"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "⚡"
          }
        }
      }
    ]
  },
  {
    "section": "🔥 Trend TikTok & Threads",
    "items": [
      {
        "overlay_id": "caption:tru_1_000_diem_aura",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#307EA5",
              "#3A5EA2"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💅"
          },
          "max_lines": 1,
          "text": "Trừ 1.000 điểm aura",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ngheo_cho_sach_rach_cho_slay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B8E9E9",
              "#67BFD7"
            ]
          },
          "max_lines": 1,
          "text": "Nghèo cho sạch, rách cho slay",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:du_an_ma",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DA96AA",
              "#BF72A8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "👻"
          },
          "max_lines": 1,
          "text": "Dự án ma",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:con_vien_la_lan",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EAD773",
              "#82C0A8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎡"
          },
          "max_lines": 1,
          "text": "Côn viên lá làn",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:vuyp",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#57ADC8",
              "#4D91C9"
            ]
          },
          "max_lines": 1,
          "text": "Vuýp",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💨"
          }
        }
      },
      {
        "overlay_id": "caption:chua_du_wow",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E79596",
              "#B578B2"
            ]
          },
          "max_lines": 1,
          "text": "Chưa đủ wow",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫠"
          }
        }
      },
      {
        "overlay_id": "caption:flex_chi_la_vo_tinh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#594CC4",
              "#8447B8"
            ]
          },
          "max_lines": 1,
          "text": "Flex chỉ là vô tình",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌟"
          }
        }
      },
      {
        "overlay_id": "caption:e_e_xa_ca_dung_ca_dinh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#71AFC9",
              "#6D8FCA"
            ]
          },
          "max_lines": 1,
          "text": "Ê ề xà cà đúng cà đinh",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎶"
          }
        }
      },
      {
        "overlay_id": "caption:boc_trung_sit_rit",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6E56B7",
              "#A3599C"
            ]
          },
          "max_lines": 1,
          "text": "Bóc trúng sít rịt",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎯"
          }
        }
      },
      {
        "overlay_id": "caption:dung_xe_di",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C47E5C",
              "#D9935D"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🛑"
          },
          "max_lines": 1,
          "text": "Dừng xe đi!",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:di_lam_cong_ty_khong_em_xin_cho",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E0C3A0",
              "#C29F7C"
            ]
          },
          "max_lines": 1,
          "text": "Đi làm công ty không em xin cho?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💼"
          }
        }
      },
      {
        "overlay_id": "caption:kha_niche",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F68271",
              "#EC567F"
            ]
          },
          "max_lines": 1,
          "text": "Khá niche",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🧐"
          }
        }
      },
      {
        "overlay_id": "caption:cai_quai_dan_gi_the",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#27808F",
              "#3F49B4"
            ]
          },
          "max_lines": 1,
          "text": "Cái quái đản gì thế?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⚡"
          }
        }
      },
      {
        "overlay_id": "caption:doc_so_tai_khoan_day",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F0A06A",
              "#D67071"
            ]
          },
          "max_lines": 1,
          "text": "Đọc số tài khoản đây",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💸"
          }
        }
      },
      {
        "overlay_id": "caption:thuyet_hom_ba",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#287E93",
              "#22638C"
            ]
          },
          "max_lines": 1,
          "text": "Thuyệt hơm bà?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌟"
          }
        }
      },
      {
        "overlay_id": "caption:sap_vuot_muc_pickleball",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B06135",
              "#7F4637"
            ]
          },
          "max_lines": 1,
          "text": "Sắp vượt mức pickleball",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🏓"
          }
        }
      },
      {
        "overlay_id": "caption:im_lang_di_gopi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5638C8",
              "#385DB8"
            ]
          },
          "max_lines": 1,
          "text": "Im lặng đi Gopi",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⚡"
          }
        }
      },
      {
        "overlay_id": "caption:o_ngay_trung_tam_quan_1",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D83361",
              "#943D5D"
            ]
          },
          "max_lines": 1,
          "text": "Ở ngay trung tâm quận 1",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌟"
          }
        }
      },
      {
        "overlay_id": "caption:hon_ca_khu_tu_tri",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5E6EC1",
              "#494EA6"
            ]
          },
          "max_lines": 1,
          "text": "Hơn cả khu tự trị",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "✨"
          }
        }
      },
      {
        "overlay_id": "caption:thang_doi_1_0",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#387A95",
              "#326292"
            ]
          },
          "max_lines": 1,
          "text": "Thắng đời 1-0",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "✨"
          }
        }
      },
      {
        "overlay_id": "caption:dinh_chieu_2_dieu_thuyen",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#745CAF",
              "#9D5E94"
            ]
          },
          "max_lines": 1,
          "text": "Dính chiêu 2 Điêu Thuyền",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🕹️"
          }
        }
      },
      {
        "overlay_id": "caption:dai_dai_di",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C9A07E",
              "#B08068"
            ]
          },
          "max_lines": 1,
          "text": "Đại đại đi",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎲"
          }
        }
      }
    ]
  },
  {
    "section": "🤡 Meme & Câu cửa miệng",
    "items": [
      {
        "overlay_id": "caption:trung_sinh_luon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6BACBE",
              "#9281CB"
            ]
          },
          "max_lines": 1,
          "text": "Trùng sinh luôn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🔄"
          }
        }
      },
      {
        "overlay_id": "caption:mong_ton_hoa_sen_thay_va_lam_ngo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5D65D2",
              "#9A56C1"
            ]
          },
          "max_lines": 1,
          "text": "Mong Tôn Hoa Sen thấy và làm ngơ",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙈"
          }
        }
      },
      {
        "overlay_id": "caption:trinh_ai_cham",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AF7BD0",
              "#D17FBC"
            ]
          },
          "max_lines": 1,
          "text": "Trình ai chấm?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:ai_roi_cung_phai_pressing_thoi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D14167",
              "#99487D"
            ]
          },
          "max_lines": 1,
          "text": "Ai rồi cũng phải pressing thôi",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥊"
          }
        }
      },
      {
        "overlay_id": "caption:doc_so_tai_khoan",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8560CF",
              "#556BC3"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💳"
          },
          "max_lines": 1,
          "text": "Đọc số tài khoản",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:nay_chi_lam_khach_em_ngo_gi_chi_do_mai",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BC5466",
              "#944C7B"
            ]
          },
          "max_lines": 1,
          "text": "Nãy chị làm khách em ngó gì chị đó Mai?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👻"
          }
        }
      },
      {
        "overlay_id": "caption:cuu_toi_cuu_toi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AA79BF",
              "#D984AA"
            ]
          },
          "max_lines": 1,
          "text": "Cứu tôi cứu tôi",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🆘"
          }
        }
      },
      {
        "overlay_id": "caption:kho_nhat_the_gioi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#61A579",
              "#409B86"
            ]
          },
          "max_lines": 1,
          "text": "Khổ nhất thế giới",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
          }
        }
      },
      {
        "overlay_id": "caption:hao_han",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8066B5",
              "#506FBA"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "⚔️"
          },
          "max_lines": 1,
          "text": "Hảo hán",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:cu_soc_ngang",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DCA563",
              "#C87554"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "⚡"
          },
          "max_lines": 1,
          "text": "Cú sốc ngang",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:kiep_nan_thu_82",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6EBCC7",
              "#9085D3"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🪷"
          },
          "max_lines": 1,
          "text": "Kiếp nạn thứ 82",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:da_cai_nu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AC78D7",
              "#D87CC7"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "😌"
          },
          "max_lines": 1,
          "text": "Đã cái nư",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:huy_st5k",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#72ACCA",
              "#4F91CA"
            ]
          },
          "max_lines": 1,
          "text": "HUY ST5K",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😳"
          }
        }
      },
      {
        "overlay_id": "caption:ai_hoai",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7158B9",
              "#416EBD"
            ]
          },
          "max_lines": 1,
          "text": "Ai hoải?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤨"
          }
        }
      },
      {
        "overlay_id": "caption:chan_di",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EA9E50",
              "#D56D49"
            ]
          },
          "max_lines": 1,
          "text": "Chan đi",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
          }
        }
      },
      {
        "overlay_id": "caption:nua_doi_sau_len_nui_o",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7450D3",
              "#4567C7"
            ]
          },
          "max_lines": 1,
          "text": "Nửa đời sau lên núi ở",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⛰️"
          }
        }
      },
      {
        "overlay_id": "caption:ca_the_vuot_troi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AE78C9",
              "#CA7CB2"
            ]
          },
          "max_lines": 1,
          "text": "Cá thể vượt trội",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🦄"
          }
        }
      },
      {
        "overlay_id": "caption:da_con_ten_mai_con_mat_xa",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AF586D",
              "#914E5C"
            ]
          },
          "max_lines": 1,
          "text": "Dạ con tên Mai, con mát-xa",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👻"
          }
        }
      },
      {
        "overlay_id": "caption:you_only_live_once_thi_moi_phai_can_than",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EBA563",
              "#D4735A"
            ]
          },
          "max_lines": 1,
          "text": "You only live once thì mới phải cẩn thận",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤡"
          }
        }
      },
      {
        "overlay_id": "caption:oi_thoi_chet",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E2A269",
              "#D37055"
            ]
          },
          "max_lines": 1,
          "text": "Oi thoi chet",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😳"
          }
        }
      },
      {
        "overlay_id": "caption:cac_con_vo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#3D7F89",
              "#3D6693"
            ]
          },
          "max_lines": 1,
          "text": "Các con vợ",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😳"
          }
        }
      },
      {
        "overlay_id": "caption:choi_cha_choi_cha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#706CB4",
              "#4F579B"
            ]
          },
          "max_lines": 1,
          "text": "Chổi chà chổi chà",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
          }
        }
      },
      {
        "overlay_id": "caption:em_trai_thich_gi_nhan_chi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6062CD",
              "#9E5ABB"
            ]
          },
          "max_lines": 1,
          "text": "Em trai thích gì nhắn chị",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💗"
          }
        }
      },
      {
        "overlay_id": "caption:nung_niu_dam_le",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B45864",
              "#8D5177"
            ]
          },
          "max_lines": 1,
          "text": "Nũng nịu, đẫm lệ",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥹"
          }
        }
      },
      {
        "overlay_id": "caption:day_moi_la_chan_chan_tao_chi_la_phuong_tien_di_chuyen",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#64A27C",
              "#459989"
            ]
          },
          "max_lines": 1,
          "text": "Đây mới là chân, chân tao chỉ là phương tiện di chuyển",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🦵"
          }
        }
      },
      {
        "overlay_id": "caption:be_ba",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8166AD",
              "#4F67B0"
            ]
          },
          "max_lines": 1,
          "text": "Bé ba",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎭"
          }
        }
      },
      {
        "overlay_id": "caption:co_qua_thanh_qua_co",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DCAA5C",
              "#C27B56"
            ]
          },
          "max_lines": 1,
          "text": "Cố quá thành quá cố",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😳"
          }
        }
      },
      {
        "overlay_id": "caption:a_a_bat_duoc_roi_nha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4EBAC1",
              "#5393C6"
            ]
          },
          "max_lines": 1,
          "text": "Á à, bắt được rồi nha",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😳"
          }
        }
      }
    ]
  },
  {
    "section": "🧠 Vô tri & Brainrot",
    "items": [
      {
        "overlay_id": "caption:training_season_s_over",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#477994",
              "#5F4EBB"
            ]
          },
          "max_lines": 1,
          "text": "Training season's over",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🏋️"
          }
        }
      },
      {
        "overlay_id": "caption:gap_lai_minh_10_nam_truoc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DF93B5",
              "#B577BC"
            ]
          },
          "max_lines": 1,
          "text": "Gặp lại mình 10 năm trước",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🕰️"
          }
        }
      },
      {
        "overlay_id": "caption:6_7_six_seven",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DA8D7A",
              "#CF6B93"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🤷"
          },
          "max_lines": 1,
          "text": "6-7 (Six Seven)",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ao_ma_canada",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EFA25E",
              "#D66D5A"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "👻"
          },
          "max_lines": 1,
          "text": "Ảo ma Canada",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:lemon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E4A067",
              "#A87AB8"
            ]
          },
          "max_lines": 1,
          "text": "Lemỏn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🍋"
          }
        }
      },
      {
        "overlay_id": "caption:co_cai_nit",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#84C5C9",
              "#648FC7"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🩳"
          },
          "max_lines": 1,
          "text": "Có cái nịt",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:cham_zn",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E3B064",
              "#C77B5F"
            ]
          },
          "max_lines": 1,
          "text": "Chầm zn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😵‍💫"
          }
        }
      },
      {
        "overlay_id": "caption:chan_be_du",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8056B7",
              "#A654B5"
            ]
          },
          "max_lines": 1,
          "text": "Chấn bé đù",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
          }
        }
      },
      {
        "overlay_id": "caption:o_de",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D5927D",
              "#C96F91"
            ]
          },
          "max_lines": 1,
          "text": "Ô dề",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫠"
          }
        }
      },
      {
        "overlay_id": "caption:xiu_up_xiu_down",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#ECA863",
              "#D3735B"
            ]
          },
          "max_lines": 1,
          "text": "Xỉu up xỉu down",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😵"
          }
        }
      }
    ]
  },
  {
    "section": "😏 Cà khịa & Có duyên",
    "items": [
      {
        "overlay_id": "caption:ua_ai_hoi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A36182",
              "#7C4A7A"
            ]
          },
          "max_lines": 1,
          "text": "Ủa ai hỏi?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙄"
          }
        }
      },
      {
        "overlay_id": "caption:khong_ai_hoi_nhung_toi_van_tra_loi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#78A3A7",
              "#6E8FAD"
            ]
          },
          "max_lines": 1,
          "text": "Không ai hỏi nhưng tôi vẫn trả lời",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:mac_gi_mac_cuoi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8799D2",
              "#9F7DC5"
            ]
          },
          "max_lines": 1,
          "text": "Mắc gì mắc cười?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤣"
          }
        }
      },
      {
        "overlay_id": "caption:cai_net_danh_chet_cai_dep",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#90B7CC",
              "#708FC0"
            ]
          },
          "max_lines": 1,
          "text": "Cái nết đánh chết cái đẹp",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:tuong_minh_hai_huoc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C54C31",
              "#7A3856"
            ]
          },
          "max_lines": 1,
          "text": "Tưởng mình hài hước",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎭"
          }
        }
      },
      {
        "overlay_id": "caption:hay_ra_de_qua_a",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DC9D61",
              "#C47661"
            ]
          },
          "max_lines": 1,
          "text": "Hay ra dẻ quá à!",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:bot_ao_tuong_di_ma",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4E73C7",
              "#7545B8"
            ]
          },
          "max_lines": 1,
          "text": "Bớt ảo tưởng đi má",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙄"
          }
        }
      },
      {
        "overlay_id": "caption:chiu_roi_do",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4C75B2",
              "#3F5689"
            ]
          },
          "max_lines": 1,
          "text": "Chịu rồi đó",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤨"
          }
        }
      },
      {
        "overlay_id": "caption:roi_ai_chiu_noi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#3E7C93",
              "#305378"
            ]
          },
          "max_lines": 1,
          "text": "Rồi ai chịu nổi?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
          }
        }
      },
      {
        "overlay_id": "caption:than_chua_ma_gion",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A76159",
              "#6E4250"
            ]
          },
          "max_lines": 1,
          "text": "Thân chưa mà giỡn?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:che_manh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A1627E",
              "#7B4A76"
            ]
          },
          "max_lines": 1,
          "text": "Chê mạnh",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👎"
          }
        }
      },
      {
        "overlay_id": "caption:chua_bao_gio_may_hoi_tao_co_muon_hay_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DDAE99",
              "#B37F8F"
            ]
          },
          "max_lines": 1,
          "text": "Chưa bao giờ mày hỏi tao có muốn hay không",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⏰"
          }
        }
      },
      {
        "overlay_id": "caption:xin_moi_doan_minh_di_chuyen_len_nui",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BF94BB",
              "#9C81BB"
            ]
          },
          "max_lines": 1,
          "text": "Xin mời đoàn mình di chuyển lên núi",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🍜"
          }
        }
      },
      {
        "overlay_id": "caption:may_la_nhat_nhat_may_roi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#696CB3",
              "#534F93"
            ]
          },
          "max_lines": 1,
          "text": "Mày là nhất, nhất mày rồi",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:co_ai_ep_dau_ma_lam",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A65C83",
              "#7E457E"
            ]
          },
          "max_lines": 1,
          "text": "Có ai ép đâu mà làm?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙃"
          }
        }
      },
      {
        "overlay_id": "caption:e_cai_nay_hoi_qua_roi_nha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6273A7",
              "#4F5B86"
            ]
          },
          "max_lines": 1,
          "text": "Ê cái này hơi quá rồi nha",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:cai_nay_chac_do_huong_noi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DCA264",
              "#C27C65"
            ]
          },
          "max_lines": 1,
          "text": "Cái này chắc do hướng nội",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙃"
          }
        }
      },
      {
        "overlay_id": "caption:chua_du_tuoi_de_hieu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5271C5",
              "#7B48B7"
            ]
          },
          "max_lines": 1,
          "text": "Chưa đủ tuổi để hiểu",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙄"
          }
        }
      },
      {
        "overlay_id": "caption:cung_ra_gi_day_chu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5574AF",
              "#455B8F"
            ]
          },
          "max_lines": 1,
          "text": "Cũng ra gì đấy chứ",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤨"
          }
        }
      },
      {
        "overlay_id": "caption:bang_mot_cach_than_ky_nao_do",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7AA7AF",
              "#7890AE"
            ]
          },
          "max_lines": 1,
          "text": "Bằng một cách thần kỳ nào đó",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:goi_xong_luon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C196BD",
              "#9F83BD"
            ]
          },
          "max_lines": 1,
          "text": "Gòi xong luôn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫢"
          }
        }
      },
      {
        "overlay_id": "caption:ai_cuu_noi_ca_nay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8FB2C9",
              "#758FBF"
            ]
          },
          "max_lines": 1,
          "text": "Ai cứu nổi ca này?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🆘"
          }
        }
      }
    ]
  },
  {
    "section": "💬 Reaction & Comment dạo",
    "items": [
      {
        "overlay_id": "caption:ua_thiet_luon_a",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B5B6DA",
              "#7F8FBC"
            ]
          },
          "max_lines": 1,
          "text": "Ủa thiệt luôn á?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
        }
      },
      {
        "overlay_id": "caption:roi_sao_ma",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A3C9A7",
              "#79B0A0"
            ]
          },
          "max_lines": 1,
          "text": "Rồi sao má?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤨"
          }
        }
      },
      {
        "overlay_id": "caption:ua_mac_gi_dung",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D69AA0",
              "#B7799E"
            ]
          },
          "max_lines": 1,
          "text": "Ủa mắc gì đúng?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:khong_biet_noi_gi_luon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BBABD7",
              "#9983BD"
            ]
          },
          "max_lines": 1,
          "text": "Không biết nói gì luôn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤐"
          }
        }
      },
      {
        "overlay_id": "caption:cuoi_xiu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D9A8B0",
              "#AE7C9D"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🤣"
          },
          "max_lines": 1,
          "text": "Cười xỉu",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:cuoi_xiu_ngang",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DDB681",
              "#B8884A"
            ]
          },
          "max_lines": 1,
          "text": "Cười xỉu ngang",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤣"
          }
        }
      },
      {
        "overlay_id": "caption:chay_qua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E99655",
              "#DA695F"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🔥"
          },
          "max_lines": 1,
          "text": "Cháy quá",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:xin_xo_con_bo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#99C29F",
              "#6FA89B"
            ]
          },
          "max_lines": 1,
          "text": "Xịn xò con bò",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🐮"
          }
        }
      },
      {
        "overlay_id": "caption:dinh_cao_nhan_loai",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E8B25B",
              "#BE853D"
            ]
          },
          "max_lines": 1,
          "text": "Đỉnh cao nhân loại",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🏆"
          }
        }
      },
      {
        "overlay_id": "caption:het_cuu_that_roi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#55798F",
              "#324F5E"
            ]
          },
          "max_lines": 1,
          "text": "Hết cứu thật rồi",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😱"
          }
        }
      },
      {
        "overlay_id": "caption:toi_cong_chuyen",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D7C291",
              "#AE955E"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💥"
          },
          "max_lines": 1,
          "text": "Tới công chuyện",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_man_nay_kho_do",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Màn này khó đỡ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DA90B6",
              "#BE72AC"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥴"
          }
        }
      },
      {
        "overlay_id": "caption:du_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BAABDB",
              "#9782C6"
            ]
          },
          "max_lines": 1,
          "text": "Dữ chưa?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👀"
          }
        }
      },
      {
        "overlay_id": "caption:di_cung_duoc_nua_ha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D39D9F",
              "#B27C9A"
            ]
          },
          "max_lines": 1,
          "text": "Dị cũng được nữa hả?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙃"
          }
        }
      },
      {
        "overlay_id": "caption:noi_nghe_cung_hop_ly",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#98C1D1",
              "#6C91B0"
            ]
          },
          "max_lines": 1,
          "text": "Nói nghe cũng hợp lý",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙃"
          }
        }
      },
      {
        "overlay_id": "caption:ba_on_khong_ba",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DFC191",
              "#BA935A"
            ]
          },
          "max_lines": 1,
          "text": "Bà ổn không bà?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫶"
          }
        }
      },
      {
        "overlay_id": "caption:het_noi_noi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E8A060",
              "#D97669"
            ]
          },
          "max_lines": 1,
          "text": "Hết nói nổi",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤐"
          }
        }
      },
      {
        "overlay_id": "caption:het_nuoc_cham",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AACCB0",
              "#80B3A8"
            ]
          },
          "max_lines": 1,
          "text": "Hết nước chấm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🍯"
          }
        }
      },
      {
        "overlay_id": "caption:nghe_ma_muon_doi_quan",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B8A7D1",
              "#9781B5"
            ]
          },
          "max_lines": 1,
          "text": "Nghe mà muốn đội quần",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙃"
          }
        }
      },
      {
        "overlay_id": "caption:dung_la_doi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DA9CA3",
              "#BD79A4"
            ]
          },
          "max_lines": 1,
          "text": "Đúng là đời",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌫️"
          }
        }
      },
      {
        "overlay_id": "caption:vay_ma_cung_nghi_ra_duoc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E5B677",
              "#D8927E"
            ]
          },
          "max_lines": 1,
          "text": "Vậy mà cũng nghĩ ra được",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:e_hoi_bi_duoc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9AC1D8",
              "#6698C8"
            ]
          },
          "max_lines": 1,
          "text": "Ê hơi bị được",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👌"
          }
        }
      },
      {
        "overlay_id": "caption:khong_phai_dang_vua_dau",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A6B1E1",
              "#8689CD"
            ]
          },
          "max_lines": 1,
          "text": "Không phải dạng vừa đâu",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😎"
          }
        }
      },
      {
        "overlay_id": "caption:chua_thay_ai_nhu_vay_luon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A6B0DB",
              "#7B8AC2"
            ]
          },
          "max_lines": 1,
          "text": "Chưa thấy ai như vậy luôn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👁️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_so_ho_la_xuat_hien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Sơ hở là xuất hiện",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D7A3A5",
              "#B8839F"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🤨"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_biet_vay_o_nha",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Biết vậy ở nhà",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BDAEDB",
              "#9A83C3"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🏠"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_khong_he_dien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Không hề diễn",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DAA6BA",
              "#BC88AA"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💌"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_mac_cong_giai_thich",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mắc công giải thích",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E6D2A5",
              "#C4A66C"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "😮‍💨"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_khong_biet_nen_vui_hay_buon",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Không biết nên vui hay buồn",
          "max_lines": 1,
          "background": {
            "colors": [
              "#567790",
              "#334857"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🥲"
          }
        }
      }
    ]
  },
  {
    "section": "👀 Check VAR & Hóng hớt",
    "items": [
      {
        "overlay_id": "caption:co_bien_roi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#437D9E",
              "#405D9D"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🚨"
          },
          "max_lines": 1,
          "text": "Có biến rồi",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:xin_mieng_context",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BC7F5A",
              "#D39459"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "👀"
          },
          "max_lines": 1,
          "text": "Xin miếng context",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:plot_twist_nua_ha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B247B2",
              "#793FB2"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎭"
          },
          "max_lines": 1,
          "text": "Plot twist nữa hả?",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ua_chuyen_gi_vay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E4B15A",
              "#CA873D"
            ]
          },
          "max_lines": 1,
          "text": "Ủa chuyện gì vậy?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⁉️"
          }
        }
      },
      {
        "overlay_id": "caption:doi_nguoi_trong_cuoc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5571C9",
              "#3F4FAF"
            ]
          },
          "max_lines": 1,
          "text": "Đợi người trong cuộc",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⌛"
          }
        }
      }
    ]
  },
  {
    "section": "🎒 Sinh viên, Deadline & Đi làm",
    "items": [
      {
        "overlay_id": "caption:bai_tap_chua_lam",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E3AB69",
              "#D08248"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "📚"
          },
          "max_lines": 1,
          "text": "Bài tập chưa làm",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:deadline_di",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E5AA6F",
              "#C27968"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "⏳"
          },
          "max_lines": 1,
          "text": "Deadline dí",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:qua_mon_la_duoc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DEB086",
              "#C08B62"
            ]
          },
          "max_lines": 1,
          "text": "Qua môn là được",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📝"
          }
        }
      },
      {
        "overlay_id": "caption:hoc_lai_de_gap_nhau",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#89BEDE",
              "#5C92C2"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎓"
          },
          "max_lines": 1,
          "text": "Học lại để gặp nhau",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:bao_deadline",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B7B7DE",
              "#8686C5"
            ]
          },
          "max_lines": 1,
          "text": "Bào deadline",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⏰"
          }
        }
      },
      {
        "overlay_id": "caption:hoc_ngay_hoc_dem_vao_thi_quen_het",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C6ABCD",
              "#9D80B3"
            ]
          },
          "max_lines": 1,
          "text": "Học ngày học đêm, vào thi quên hết",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
        }
      },
      {
        "overlay_id": "caption:mai_nop_roi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#92B6C8",
              "#7490B3"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🚨"
          },
          "max_lines": 1,
          "text": "Mai nộp rồi!",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ganh_team_bat_dac_di",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AAADD9",
              "#728BBF"
            ]
          },
          "max_lines": 1,
          "text": "Gánh team bất đắc dĩ",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫠"
          }
        }
      },
      {
        "overlay_id": "caption:ganh_team",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8BB9C7",
              "#5A93AB"
            ]
          },
          "max_lines": 1,
          "text": "Gánh team",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💪"
          }
        }
      },
      {
        "overlay_id": "caption:chay_kpi_bang_niem_tin",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BCB6D3",
              "#8E89B8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "📊"
          },
          "max_lines": 1,
          "text": "Chạy KPI bằng niềm tin",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:tran_om_viec",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D6A2AE",
              "#B67B8E"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🐍"
          },
          "max_lines": 1,
          "text": "Trăn ôm việc",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:tu_nhien_muon_nghi_viec",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B8B6DC",
              "#8787C2"
            ]
          },
          "max_lines": 1,
          "text": "Tự nhiên muốn nghỉ việc",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🚪"
          }
        }
      },
      {
        "overlay_id": "caption:luong_chua_ve_da_het",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C8ABD5",
              "#9C81BA"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💸"
          },
          "max_lines": 1,
          "text": "Lương chưa về đã hết",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:kiem_tien_nuoi_dam_me",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E0BC96",
              "#C29772"
            ]
          },
          "max_lines": 1,
          "text": "Kiếm tiền nuôi đam mê",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💸"
          }
        }
      },
      {
        "overlay_id": "caption:dau_thang_tong_tai_cuoi_thang_an_xin",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DEB2A2",
              "#B78986"
            ]
          },
          "max_lines": 1,
          "text": "Đầu tháng tổng tài, cuối tháng ăn xin",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥢"
          }
        }
      },
      {
        "overlay_id": "caption:ngu_bu_ca_the_gioi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E4B77A",
              "#D19058"
            ]
          },
          "max_lines": 1,
          "text": "Ngủ bù cả thế giới",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌙"
          }
        }
      },
      {
        "overlay_id": "caption:thuc_khuya_day_muon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8FBBC9",
              "#5A93B0"
            ]
          },
          "max_lines": 1,
          "text": "Thức khuya dậy muộn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🦉"
          }
        }
      }
    ]
  },
  {
    "section": "🌐 English Slang & Internet",
    "items": [
      {
        "overlay_id": "caption:w_rizz",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7255C8",
              "#A652AF"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "😏"
          },
          "max_lines": 1,
          "text": "W rizz",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:glow_down",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DF2464",
              "#973061"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🥀"
          },
          "max_lines": 1,
          "text": "Glow down",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:meowmaxxing",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#65B1CA",
              "#618CCC"
            ]
          },
          "max_lines": 1,
          "text": "Meowmaxxing",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🪄"
          }
        }
      },
      {
        "overlay_id": "caption:side_quest",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#ECA168",
              "#D1716F"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎮"
          },
          "max_lines": 1,
          "text": "Side quest",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:skibidi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D89AA7",
              "#BC74A5"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌀"
          },
          "max_lines": 1,
          "text": "Skibidi",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:cooked",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F29A7C",
              "#E46574"
            ]
          },
          "max_lines": 1,
          "text": "Cooked",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🔥"
          }
        }
      },
      {
        "overlay_id": "caption:iykyk",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C583BD",
              "#A879C6"
            ]
          },
          "max_lines": 1,
          "text": "IYKYK",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👾"
          }
        }
      },
      {
        "overlay_id": "caption:fomo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8360C6",
              "#5868BE"
            ]
          },
          "max_lines": 1,
          "text": "FOMO",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😰"
          }
        }
      },
      {
        "overlay_id": "caption:irl",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E59997",
              "#B27DAB"
            ]
          },
          "max_lines": 1,
          "text": "IRL",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📍"
          }
        }
      },
      {
        "overlay_id": "caption:based",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9984C6",
              "#B681AC"
            ]
          },
          "max_lines": 1,
          "text": "Based",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎮"
          }
        }
      },
      {
        "overlay_id": "caption:ick",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EF88A4",
              "#D26A94"
            ]
          },
          "max_lines": 1,
          "text": "Ick",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎮"
          }
        }
      },
      {
        "overlay_id": "caption:plot_twist",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#805DD1",
              "#546ACA"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎭"
          },
          "max_lines": 1,
          "text": "Plot twist",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:touch_grass",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E89391",
              "#BC74B6"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌱"
          },
          "max_lines": 1,
          "text": "Touch grass",
          "text_color": "#292322",
          "type": "static_content"
        }
      }
    ]
  }
];

    // Canonical caption order: group similar topics together regardless of the
    // overlay order returned by the server. Preserve additional server-only items.
    var knownById = {};
    existing.forEach(function (grp) {
      if (!grp || !Array.isArray(grp.items)) return;
      grp.items.forEach(function (it) {
        if (it && it.overlay_id && !Object.prototype.hasOwnProperty.call(knownById, it.overlay_id)) {
          knownById[it.overlay_id] = it;
        }
      });
    });
    var catalogIdSet = new Set();
    var sortedGroups = catalog.map(function (group) {
      var sortedItems = group.items.map(function (item) {
        catalogIdSet.add(item.overlay_id);
        var original = knownById[item.overlay_id];
        if (!original) return item;
        // Catalog is the source of truth for current caption text/colors/icons.
        return Object.assign({}, original, item, {
          caption: Object.assign({}, original.caption || {}, item.caption || {})
        });
      });
      return { section: group.section, items: sortedItems };
    });
    var extraSeen = new Set();
    existing.forEach(function (grp) {
      if (!grp || !Array.isArray(grp.items)) return;
      var extras = grp.items.filter(function (it) {
        if (!it || !it.overlay_id || catalogIdSet.has(it.overlay_id) || extraSeen.has(it.overlay_id)) return false;
        extraSeen.add(it.overlay_id);
        return true;
      });
      if (extras.length) {
        var target = sortedGroups.find(function (g) { return g.section === grp.section; });
        if (target) target.items = target.items.concat(extras);
        else sortedGroups.push({ section: grp.section, items: extras });
      }
    });
    existing = sortedGroups;

    // Migrate visible branding in captions already present in the response.
    existing.forEach(function (group) {
      if (!group) return;
      if (typeof group.section === "string") group.section = group.section.replace(/ifywnx/gi, "An");
      if (!Array.isArray(group.items)) return;
      group.items.forEach(function (item) {
        if (item && item.caption && item.caption.text === "💻 An") item.caption.text = "💻 An";
      });
    });
    entries.overlay_items = JSON.stringify(existing);

    result = { body: JSON.stringify(data) };
  } catch (error) {
    result = { body: rawBody };
  }

  $done(result);
})();