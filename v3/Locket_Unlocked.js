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
        "overlay_id": "caption:ifywnx_holiday_xuan_ve",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Xuân về ngập nắng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#FAD59F",
              "#E5AC9D"
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
        "overlay_id": "caption:ifywnx_holiday_tet_khai_xuan",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Khai xuân may mắn",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E6BA62",
              "#B88A42"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍀"
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
        "overlay_id": "caption:ifywnx_holiday_mua_xuan",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Xuân này mình có nhau",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D52625",
              "#8B1D36"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "💐"
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
        "overlay_id": "caption:ifywnx_holiday_he_ruc_ro",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hè này phải thật chill",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F5A976",
              "#D86A56"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🏖️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_he_co_hen",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một mùa hè xanh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#66D3CF",
              "#379FC0"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌊"
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
        "overlay_id": "caption:ifywnx_holiday_thu_trong_veo",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thu trong veo",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E9C687",
              "#B68C57"
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
        "overlay_id": "caption:ifywnx_holiday_dong_den",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đông đến thật rồi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#AFC8E8",
              "#779BC7"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "❄️"
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
        "overlay_id": "caption:ifywnx_holiday_dong_co_hen",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trời lạnh, cần một cái ôm",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B0D8E2",
              "#7DA8C9"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "☃️"
          }
        }
      },
      {
        "overlay_id": "caption:new_years_eve_2026",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D43F32",
              "#8F2437"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🥂"
          },
          "max_lines": 1,
          "text": "Chúc mừng năm mới!",
          "localized_text": {
            "en": "Chúc mừng năm mới!",
            "vn": "Chúc mừng năm mới!"
          },
          "text_color": "#FFFFFF",
          "type": "static_content"
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
        "overlay_id": "caption:new_years_day_2027_alternate",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#79282D",
              "#C75121"
            ]
          },
          "max_lines": 1,
          "text": "Năm mới rực rỡ!",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎆"
          }
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
        "overlay_id": "caption:ifywnx_holiday_tet_an_khang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "An khang thịnh vượng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DD9CA3",
              "#C17490"
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
        "overlay_id": "caption:ifywnx_holiday_tet_li_xi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Xin vía lì xì",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F2C757",
              "#DA924A"
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
        "overlay_id": "caption:ifywnx_holiday_tet_giao_thua",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đón giao thừa",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D7393B",
              "#9B2D3C"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🎇"
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
        "overlay_id": "caption:ifywnx_holiday_tet_mung_tuoi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mừng tuổi đầu năm",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C64B30",
              "#8F2936"
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
        "overlay_id": "caption:ifywnx_holiday_new_year_countdown",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đếm ngược năm mới",
          "max_lines": 1,
          "background": {
            "colors": [
              "#822330",
              "#D1421B"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "⏳"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_han_thuc",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tết Hàn Thực",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E6B550",
              "#BD833D"
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
        "overlay_id": "caption:ifywnx_holiday_tet_nguyen_tieu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tết Nguyên Tiêu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F6C667",
              "#CF8E31"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🏮"
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
        "overlay_id": "caption:ifywnx_holiday_new_year_toast",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Cheers to new beginnings",
          "max_lines": 2,
          "background": {
            "colors": [
              "#F8B24C",
              "#D67F20"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥂"
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
        "overlay_id": "caption:ifywnx_holiday_valentine_single",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Valentine của mình",
          "max_lines": 1,
          "background": {
            "colors": [
              "#ECA6A6",
              "#D7748A"
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
        "overlay_id": "caption:ifywnx_holiday_white_day",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "White Day",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A3C7BB",
              "#79A99F"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🤍"
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
        "overlay_id": "caption:ifywnx_holiday_vietnamese_womens_day",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chúc mừng 20/10",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CFAFD1",
              "#A889C4"
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
        "overlay_id": "caption:ifywnx_holiday_ngay_hoa_hong",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một ngày của yêu thương",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BA5573",
              "#764061"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "💌"
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
        "overlay_id": "caption:ifywnx_holiday_may_1",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày Quốc tế Lao động",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E3AD83",
              "#CA7385"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🛠️"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_national_day",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tự hào Việt Nam",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F4CB91",
              "#D56F67"
            ]
          },
          "text_color": "#292322",
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
        "overlay_id": "caption:ifywnx_holiday_quoc_khanh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mừng Quốc khánh 2/9",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F5CE8F",
              "#D07460"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🇻🇳"
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
        "overlay_id": "caption:ifywnx_holiday_co_do_sao_vang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Rực rỡ cờ hoa",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DB3A23",
              "#9A2323"
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
        "overlay_id": "caption:ifywnx_holiday_quan_doi_22_12",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tự hào màu áo lính",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C4433A",
              "#9B2432"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "⭐"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_thanh_nien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tuổi trẻ Việt Nam",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B2620C",
              "#621616"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🌟"
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
        "overlay_id": "caption:ifywnx_holiday_graduation",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mừng ngày tốt nghiệp",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C9AFD3",
              "#9F86B7"
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
        "overlay_id": "caption:ifywnx_holiday_back_to_school",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tựu trường rồi!",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B7C7A4",
              "#8DAA93"
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
        "overlay_id": "caption:ifywnx_holiday_teacher_day",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tri ân thầy cô",
          "max_lines": 1,
          "background": {
            "colors": [
              "#97BFDC",
              "#6C91BE"
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
        "overlay_id": "caption:ifywnx_holiday_sinh_vien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày của sinh viên",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B8B4D7",
              "#8987BC"
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
        "overlay_id": "caption:ifywnx_holiday_vu_lan",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Vu Lan báo hiếu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B9CEE0",
              "#88B1C4"
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
        "overlay_id": "caption:ifywnx_holiday_ngay_ong_ba",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thương ông bà thật nhiều",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BBC9C0",
              "#91B7AA"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "👵"
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
        "overlay_id": "caption:ifywnx_holiday_tet_trung_thu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trung thu tròn vị",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F8DC8B",
              "#DEA45C"
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
        "overlay_id": "caption:ifywnx_holiday_mid_autumn",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trăng rằm đoàn viên",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F4CE82",
              "#BD844D"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🏮"
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
        "overlay_id": "caption:ifywnx_holiday_full_moon",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Rằm tháng Giêng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E2C686",
              "#A6885F"
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
        "overlay_id": "caption:ifywnx_holiday_banh_troi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bánh trôi bánh chay",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CBA3D1",
              "#9D7CC5"
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
        "overlay_id": "caption:ifywnx_holiday_thanh_minh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tiết Thanh Minh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DAE4B9",
              "#A9C9A1"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌿"
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
        "overlay_id": "caption:ifywnx_holiday_phat_dan",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mùa Phật Đản an lành",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F9C5D3",
              "#F2A8B7"
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
        "overlay_id": "caption:christmas_eve_2026",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D2424B",
              "#9E243A"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🕯️"
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
        "overlay_id": "caption:ifywnx_holiday_christmas_vibes",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Merry Christmas",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C05347",
              "#8F3739"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🎅"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_halloween_spooky",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trick or Treat!",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A9602B",
              "#472D3C"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "👻"
          }
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
        "overlay_id": "caption:ifywnx_holiday_christmas_snow",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Let it snow",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CCD6E9",
              "#A0B2D3"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "❄️"
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
        "overlay_id": "caption:ifywnx_holiday_anniversary",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Kỷ niệm của chúng mình",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DFA7D5",
              "#C696CA",
              "#AE85BF"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💑"
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
        "overlay_id": "caption:ifywnx_holiday_thay_thuoc",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tri ân người thầy thuốc",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A7D7C1",
              "#74B5A0"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🩺"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_holiday_easter",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Happy Easter",
          "max_lines": 1,
          "background": {
            "colors": [
              "#8CC2AC",
              "#60A593"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🐣"
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
        "overlay_id": "caption:ifywnx_holiday_thanksgiving",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thankful today",
          "max_lines": 1,
          "background": {
            "colors": [
              "#82B8DB",
              "#8F82D6"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🦃"
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
        "overlay_id": "caption:ifywnx_holiday_tri_an_27_7",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một lời tri ân",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D2C8B1",
              "#AEB49A"
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
      },
      {
        "overlay_id": "caption:ifywnx_holiday_doanh_nhan",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chúc người làm kinh doanh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E0B184",
              "#C47782"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💼"
          }
        }
      }
    ]
  },
  {
    "section": "🎨 Decorative by Locket",
    "items": [
      {
        "overlay_id": "caption:toi_nho_em",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#92C2CD",
              "#6FA2B8"
            ]
          },
          "max_lines": 1,
          "text": "보고 싶어 🥺",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:good_morning",
        "source": "remote",
        "daily_start_hour": 5,
        "daily_end_hour": 10,
        "caption": {
          "background": {
            "colors": [
              "#E8A150",
              "#D47B34"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "☀️"
          },
          "max_lines": 1,
          "text": "Good morning",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:goodnight",
        "source": "remote",
        "daily_start_hour": 19.5,
        "daily_end_hour": 24,
        "caption": {
          "background": {
            "colors": [
              "#3D4C88",
              "#292F67"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌙"
          },
          "max_lines": 1,
          "text": "Goodnight",
          "text_color": "#FFFFFF",
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
      },
      {
        "overlay_id": "caption:miss_you",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EFADA6",
              "#CE7779"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🥰"
          },
          "max_lines": 1,
          "text": "Miss you",
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
        "overlay_id": "caption:ifywnx",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B8E7FF",
              "#A8F5D0",
              "#DCCBFF"
            ]
          },
          "max_lines": 1,
          "text": "💻 An",
          "text_color": "#183153",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:cam_thay_hanh_phuc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C0B1DC",
              "#9985C0"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💗"
          },
          "max_lines": 1,
          "text": "Cảm thấy hạnh phúc",
          "localized_text": {
            "en": "Feeling Happy",
            "vn": "Cảm thấy hạnh phúc"
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
        "overlay_id": "caption:coffee_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#926C52",
              "#4F362E"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "☕"
          },
          "max_lines": 1,
          "text": "Coffee Time!",
          "localized_text": {
            "en": "Coffee Time!",
            "vn": "Giờ uống cà phê!"
          },
          "text_color": "#FFFFFF",
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
        "overlay_id": "caption:ifywnx_place_tra_chanh_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trà chanh Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C9AEA2",
              "#AF857C"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍋"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_place_cafe_coc_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Cà phê cóc Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A16950",
              "#5B3A2E"
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
        "overlay_id": "caption:ifywnx_lifestyle_hong_tra_mat_lanh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hồng trà mát lạnh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D2B29C",
              "#AD8777"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍹"
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
        "overlay_id": "caption:ifywnx_lifestyle_hen_nhau_ca_phe",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hẹn nhau cà phê",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C6B6A9",
              "#A68671"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "☕"
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
        "overlay_id": "caption:dinner_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DDB3C0",
              "#BA8298"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍽️"
          },
          "max_lines": 1,
          "text": "Dinner Time!",
          "localized_text": {
            "en": "Dinner Time!",
            "vn": "Giờ ăn tối!"
          },
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ifywnx_place_pho_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Phở Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C4ABD8",
              "#A48EC5"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍜"
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
        "overlay_id": "caption:ifywnx_place_banh_mi_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bánh mì Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CDD1A1",
              "#AEB676"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥖"
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
        "overlay_id": "caption:ifywnx_lifestyle_di_an_kem",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đi ăn kem thôi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BB9FD8",
              "#9981C7"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍦"
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
        "overlay_id": "caption:ifywnx_lifestyle_pizza_toi_nay",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Pizza tối nay",
          "max_lines": 1,
          "background": {
            "colors": [
              "#8DBEDD",
              "#6197C8"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍕"
          }
        }
      },
      {
        "overlay_id": "caption:cinema_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#97B8D5",
              "#718CB8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎬"
          },
          "max_lines": 1,
          "text": "Cinema Time!",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:ifywnx_lifestyle_mot_ve_xem_phim",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một vé xem phim",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C5A9D0",
              "#9E81BC"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎟️"
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
        "overlay_id": "caption:ifywnx_place_photobooth_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Photobooth Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E5B9AD",
              "#C28E8D"
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
        "overlay_id": "caption:ifywnx_lifestyle_mot_chiec_checkin",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một chiếc check-in",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E4A59A",
              "#D2908C",
              "#C17B7D"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "📍"
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
        "overlay_id": "caption:ifywnx_place_cho_dem_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chợ đêm Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#ADCAA8",
              "#84AE91"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🏮"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_lifestyle_dao_sieu_thi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Dạo siêu thị",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D2A8B4",
              "#B67F98"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🛒"
          }
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
        "overlay_id": "caption:ifywnx_lifestyle_mua_chut_do",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mua chút đồ thôi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C7B8CD",
              "#A08EA9"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🛍️"
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
        "overlay_id": "caption:dating_time",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D4BE89",
              "#B59D66"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💕"
          },
          "max_lines": 1,
          "text": "Dating Time!",
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
        "overlay_id": "caption:ifywnx_place_pho_di_bo_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Phố đi bộ Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C4B0DC",
              "#9E87C2"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🚶"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_place_quan_quen_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Quán quen Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#ABBC99",
              "#8EA67B"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫶"
          }
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
        "overlay_id": "caption:ifywnx_lifestyle_thu_quan_moi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thử quán mới",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A7BCD8",
              "#849CC7"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫶"
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
        "overlay_id": "caption:ifywnx_place_deadline_time",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Deadline Time",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E3BE85",
              "#D09964"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💻"
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
      },
      {
        "overlay_id": "caption:snake_vibes",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B1CEDB",
              "#83A9C2"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🐍"
          },
          "max_lines": 1,
          "text": "Snake Vibes",
          "localized_text": {
            "en": "Snake Vibes",
            "vn": "Chất rắn"
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
        "overlay_id": "caption:mot_chiec_anh_co_aura",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#50BACE",
              "#4AA7CC",
              "#4492CA"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "✨"
          },
          "max_lines": 1,
          "text": "Một chiếc ảnh có aura",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:khong_can_filter_van_chay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D2AE6F",
              "#B38D4B"
            ]
          },
          "max_lines": 1,
          "text": "Không cần filter vẫn cháy",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⚡"
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
        "overlay_id": "caption:ifywnx_new_khong_filter_nha",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Không filter nha",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E1C0B4",
              "#BF978E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪞"
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
        "overlay_id": "caption:locket_ghi_nhan_nhan_sac",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E2A6BA",
              "#CB8095"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "📸"
          },
          "max_lines": 1,
          "text": "Locket ghi nhận nhan sắc",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:dep_ngang_mot_loi_xin_loi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DDBB98",
              "#C69770"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌟"
          },
          "max_lines": 1,
          "text": "Đẹp ngang một lời xin lỗi",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:xin_phep_xinh_mot_chut",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DF93B2",
              "#C271A0"
            ]
          },
          "max_lines": 1,
          "text": "Xin phép xinh một chút",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
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
        "overlay_id": "caption:ifywnx_new_hom_nay_hoi_xinh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hôm nay hơi xinh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F1A2B9",
              "#D685A9"
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
        "overlay_id": "caption:ifywnx_new_mot_chut_aura",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một chút aura",
          "max_lines": 1,
          "background": {
            "colors": [
              "#8BB7E2",
              "#7389CC"
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
        "overlay_id": "caption:ifywnx_new_hom_nay_co_gu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hôm nay có gu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EDB6B1",
              "#C17D7D"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫂"
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
        "overlay_id": "caption:luu_lai_chiec_mood_nay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9AC8D6",
              "#6AA3BF"
            ]
          },
          "max_lines": 1,
          "text": "Lưu lại chiếc mood này",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💾"
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
        "overlay_id": "caption:ifywnx_new_tha_tim_ho_cai",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thả tim hộ cái",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DFA396",
              "#C57B7E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫶"
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
        "overlay_id": "caption:ifywnx_new_gui_ban_mot_nu_cuoi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Gửi bạn một nụ cười",
          "max_lines": 1,
          "background": {
            "colors": [
              "#8FC0AB",
              "#68A591"
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
        "overlay_id": "caption:ifywnx_new_buc_nay_giu_nha",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bức này giữ nha",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BEAADE",
              "#9780C7"
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
        "overlay_id": "caption:hom_nay_minh_du_wow",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EFB3C1",
              "#C37893"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "⭐"
          },
          "max_lines": 1,
          "text": "Hôm nay mình đủ wow",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:ifywnx_new_nhin_tam_duoc",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nhìn tạm được",
          "max_lines": 1,
          "background": {
            "colors": [
              "#98C5A0",
              "#6CA781"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫣"
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
      },
      {
        "overlay_id": "caption:ifywnx_new_xin_phep_xuat_hien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Xin phép xuất hiện",
          "max_lines": 1,
          "background": {
            "colors": [
              "#94BDE8",
              "#6F93CC"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎬"
          }
        }
      }
    ]
  },
  {
    "section": "☕ Đời sống & Ăn chơi",
    "items": [
      {
        "overlay_id": "caption:an_com_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D4AC96",
              "#B37F6D"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍚"
          },
          "max_lines": 1,
          "text": "Ăn cơm chưa?",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:doi_ngang",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9DC7DD",
              "#61A1C1"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍱"
          },
          "max_lines": 1,
          "text": "Đói ngang",
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
        "overlay_id": "caption:di_choi_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BDA2CF",
              "#9E86BB"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🛵"
          },
          "max_lines": 1,
          "text": "Đi chơi không?",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:hom_nay_co_keo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D7BCF1",
              "#A793CE"
            ]
          },
          "max_lines": 1,
          "text": "Hôm nay có kèo",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫂"
          }
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
        "overlay_id": "caption:ngu_ngon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D2B38E",
              "#B9936E"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌙"
          },
          "max_lines": 1,
          "text": "Ngủ ngon",
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
        "overlay_id": "caption:mot_ngay_binh_thuong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C1C899",
              "#A0AB6F"
            ]
          },
          "max_lines": 1,
          "text": "Một ngày bình thường",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌤️"
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
      },
      {
        "overlay_id": "caption:tai_khoan_con_hoi_tho",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9CBAD8",
              "#7392C0"
            ]
          },
          "max_lines": 1,
          "text": "Tài khoản còn hơi thở",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💸"
          }
        }
      }
    ]
  },
  {
    "section": "🥂 Tiếng Việt Premium · Sang & tinh tế",
    "items": [
      {
        "overlay_id": "caption:ifywnx_premium_luxe_sang_vua_u",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Sang vừa đủ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D7BE96",
              "#A98C60"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥂"
          }
        }
      },
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
        "overlay_id": "caption:ifywnx_premium_luxe_thanh_lich_mot_chut",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thanh lịch một chút",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A3BAB2",
              "#62948F"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🤍"
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
        "overlay_id": "caption:ifywnx_premium_luxe_net_rieng_kho_lan",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nét riêng khó lẫn",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BDD2C7",
              "#8CB7AA"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪞"
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
        "overlay_id": "caption:ifywnx_premium_luxe_ep_theo_cach_cua_minh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đẹp theo cách của mình",
          "max_lines": 1,
          "background": {
            "colors": [
              "#936984",
              "#674E61"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🌷"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_tram_ma_co_gu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Trầm mà có gu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#4F6F75",
              "#314E61"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🖤"
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
        "overlay_id": "caption:ifywnx_premium_luxe_binh_yen_co_gu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bình yên có gu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B5CFCF",
              "#83ADAF"
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
        "overlay_id": "caption:ifywnx_premium_luxe_diu_dang_co_khi_chat",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Dịu dàng có khí chất",
          "max_lines": 1,
          "background": {
            "colors": [
              "#587D7B",
              "#305A5C"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🪷"
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
        "overlay_id": "caption:ifywnx_premium_luxe_toi_nay_co_hen",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tối nay có hẹn",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CAB1CF",
              "#AE92BE"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍷"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_cham_chut_xa_hoa",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chạm chút xa hoa",
          "max_lines": 1,
          "background": {
            "colors": [
              "#5F7B79",
              "#2A5855"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "✨"
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
        "overlay_id": "caption:ifywnx_premium_luxe_cu_thong_tha_ma_ep",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Cứ thong thả mà đẹp",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CCB295",
              "#AB8765"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪻"
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
        "overlay_id": "caption:ifywnx_premium_luxe_mot_buoi_toi_rat_rieng",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một buổi tối rất riêng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CCC4B6",
              "#9B8A7B"
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
        "overlay_id": "caption:ifywnx_premium_luxe_khong_on_ao_van_noi_bat",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Không ồn ào vẫn nổi bật",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CDB5BB",
              "#A2838E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪞"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_phong_thai_la_chinh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Phong thái là chính",
          "max_lines": 1,
          "background": {
            "colors": [
              "#986D3D",
              "#5E4227"
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
        "overlay_id": "caption:ifywnx_premium_luxe_tu_thuong_chut_binh_yen",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tự thưởng chút bình yên",
          "max_lines": 1,
          "background": {
            "colors": [
              "#8FD3AF",
              "#5AB290"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥂"
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
        "overlay_id": "caption:ifywnx_premium_luxe_vua_van_voi_hom_nay",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Vừa vặn với hôm nay",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DFA4CC",
              "#B38AC9"
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
      },
      {
        "overlay_id": "caption:ifywnx_premium_luxe_them_chut_kieu_ky",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thêm chút kiêu kỳ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#56758F",
              "#354959"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "💄"
          }
        }
      }
    ]
  },
  {
    "section": "🍃 Tiếng Việt Premium · Văn thơ",
    "items": [
      {
        "overlay_id": "caption:ifywnx_premium_mot_thoang_an_yen",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một thoáng an yên",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C3D9C6",
              "#91B6A4"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🍂"
          }
        }
      },
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
        "overlay_id": "caption:ifywnx_premium_diu_dang_ma_kieu_hanh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Dịu dàng mà kiêu hãnh",
          "max_lines": 1,
          "background": {
            "colors": [
              "#BBB6CE",
              "#928DAE"
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
        "overlay_id": "caption:ifywnx_premium_co_nhung_ngay_rat_tho",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Có những ngày rất thơ",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D7A783",
              "#C89272",
              "#B97C61"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "☁️"
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
        "overlay_id": "caption:ifywnx_premium_gio_mang_binh_yen_toi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Gió mang bình yên tới",
          "max_lines": 1,
          "background": {
            "colors": [
              "#CCBA9B",
              "#AAB27F"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌿"
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
        "overlay_id": "caption:ifywnx_premium_mot_doi_thong_dong",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Một đời thong dong",
          "max_lines": 1,
          "background": {
            "colors": [
              "#9FD0B5",
              "#6DB3A2"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪴"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_vua_hay_troi_do_nang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Vừa hay trời đổ nắng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DAB590",
              "#BB7D66"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌻"
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
        "overlay_id": "caption:ifywnx_premium_ngay_nay_that_dang_yeu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày này thật đáng yêu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D89FB0",
              "#BB7791"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💗"
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
        "overlay_id": "caption:ifywnx_premium_may_trang_ghe_choi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mây trắng ghé chơi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#C7D5C4",
              "#91B6A9"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫧"
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
        "overlay_id": "caption:ifywnx_premium_binh_yen_vua_kip_toi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bình yên vừa kịp tới",
          "max_lines": 1,
          "background": {
            "colors": [
              "#92C8C1",
              "#63AAB5"
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
      },
      {
        "overlay_id": "caption:ifywnx_premium_de_long_no_hoa",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Để lòng nở hoa",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E0A986",
              "#C37B63"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🌸"
          }
        }
      }
    ]
  },
  {
    "section": "🪄 Tiếng Việt Premium · Hài có duyên",
    "items": [
      {
        "overlay_id": "caption:ifywnx_premium_sang_mom_ngheo_tui",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Sang mồm, nghèo túi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F7BF8A",
              "#EC8C6B"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💸"
          }
        }
      },
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
        "overlay_id": "caption:ifywnx_premium_thanh_thoi_tru_cuoi_thang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thảnh thơi trừ cuối tháng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A1C7AC",
              "#7AB29B"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧾"
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
        "overlay_id": "caption:ifywnx_premium_nhin_hien_hoi_kho_chieu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Nhìn hiền, hơi khó chiều",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B4A8E8",
              "#9180D0"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "😌"
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
        "overlay_id": "caption:ifywnx_premium_binh_than_giua_deadline",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bình thản giữa deadline",
          "max_lines": 1,
          "background": {
            "colors": [
              "#90BACC",
              "#7194B8"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫠"
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
        "overlay_id": "caption:ifywnx_premium_tham_tram_mot_cach_on_ao",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Thâm trầm một cách ồn ào",
          "max_lines": 1,
          "background": {
            "colors": [
              "#FFD077",
              "#ED965B"
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
        "overlay_id": "caption:ifywnx_premium_co_gu_chua_co_tien",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Có gu, chưa có tiền",
          "max_lines": 1,
          "background": {
            "colors": [
              "#E2A497",
              "#C07A74"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🪙"
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
        "overlay_id": "caption:ifywnx_premium_ngay_lanh_thang_tot_vi_xau",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ngày lành tháng tốt, ví xấu",
          "max_lines": 2,
          "background": {
            "colors": [
              "#A8C0F2",
              "#6D92D7"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥲"
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
        "overlay_id": "caption:ifywnx_premium_cuoi_nhe_mot_cai_cho_sang",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Cười nhẹ một cái cho sang",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D4AFEA",
              "#AA7CCC"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🤭"
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
        "overlay_id": "caption:ifywnx_premium_khong_hong_chi_tinh_co_biet",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Không hóng, chỉ tình cờ biết",
          "max_lines": 2,
          "background": {
            "colors": [
              "#84CADB",
              "#4B9CAC"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "👀"
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
      },
      {
        "overlay_id": "caption:ifywnx_premium_phong_thai_co_thua",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Phong thái có thừa",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F0B779",
              "#CE8B51"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🕶️"
          }
        }
      }
    ]
  },
  {
    "section": "🧸 Teencode · Chê yêu",
    "items": [
      {
        "overlay_id": "caption:ifywnx_premium_am_cha_hui",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ăm chã húi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F2A0AE",
              "#DF7F9E"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🐻"
          }
        }
      },
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
        "overlay_id": "caption:ifywnx_premium_ba_cha_hui",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bà chã húi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F6B38F",
              "#EE8E90"
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
        "overlay_id": "caption:ifywnx_premium_am_cha_hui_oi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ăm chã húi ơi!",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EEAECE",
              "#E498AC"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💗"
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
        "overlay_id": "caption:ifywnx_premium_chinh_chan_qua_trui",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chinh chắn quá trùi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#ECA0C7",
              "#C78ADB"
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
        "overlay_id": "caption:ifywnx_premium_de_thun_du_than",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Dễ thưn dữ thần",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EDBCA0",
              "#E79CAB"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🐣"
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
        "overlay_id": "caption:ifywnx_premium_iu_oi_la_iu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Iu ơi là iu",
          "max_lines": 1,
          "background": {
            "colors": [
              "#F89771",
              "#EF717C"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "💖"
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
        "overlay_id": "caption:ifywnx_premium_dung_co_choc_be",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đừng có chọc bé",
          "max_lines": 1,
          "background": {
            "colors": [
              "#A4BED9",
              "#7490B5"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "😤"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_premium_hom_nay_ngoan_lam",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Hơm nay ngoan lắm",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D29EEA",
              "#9F7BDB"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🧁"
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
        "overlay_id": "caption:ifywnx_premium_doi_xiu_roi_thoi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Dỗi xíu rồi thôi",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D399E1",
              "#A27BCD"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "😗"
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
        "overlay_id": "caption:ifywnx_premium_mac_co_a_choi",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Mắc cỡ á chời",
          "max_lines": 1,
          "background": {
            "colors": [
              "#D6AFE8",
              "#E39BC5"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🙊"
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
      },
      {
        "overlay_id": "caption:ifywnx_premium_tuyet_voi_uong_nao",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tuyệt vời, uống nào!",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EDA384",
              "#E6819C"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🥂"
          }
        }
      }
    ]
  },
  {
    "section": "💘 Tình cảm & Thả thính",
    "items": [
      {
        "overlay_id": "caption:thich_thi_noi_di",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E1A6B9",
              "#C27793"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💌"
          },
          "max_lines": 1,
          "text": "Thích thì nói đi",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:thich_tham",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E5AE99",
              "#BD7781"
            ]
          },
          "max_lines": 1,
          "text": "Thích thầm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💗"
          }
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
        "overlay_id": "caption:khong_yeu_xin_dung_tha_thinh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BE4D76",
              "#773962"
            ]
          },
          "max_lines": 1,
          "text": "Không yêu xin đừng thả thính",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💔"
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
        "overlay_id": "caption:mac_bay_tinh_yeu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E9B29C",
              "#C47A86"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💘"
          },
          "max_lines": 1,
          "text": "Mắc bẫy tình yêu",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ngoan_xinh_yeu_cua_ai",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D7AEDB",
              "#A87BC0"
            ]
          },
          "max_lines": 1,
          "text": "Ngoan xinh yêu của ai?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💗"
          }
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
        "overlay_id": "caption:dang_o_che_do_yeu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EEB1B8",
              "#BC7AA3"
            ]
          },
          "max_lines": 1,
          "text": "Đang ở chế độ yêu",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💕"
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
        "overlay_id": "caption:thoi_nhe_khong_yeu_nua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F0AEAA",
              "#C27579"
            ]
          },
          "max_lines": 1,
          "text": "Thôi nhé, không yêu nữa",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💔"
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
        "overlay_id": "caption:yeu_duong_gi_tam_nay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F2A29F",
              "#D36E78"
            ]
          },
          "max_lines": 1,
          "text": "Yêu đương gì tầm này",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙄"
          }
        }
      },
      {
        "overlay_id": "caption:tinh_yeu_khong_co_loi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B05691",
              "#804A81"
            ]
          },
          "max_lines": 1,
          "text": "Tình yêu không có lỗi",
          "text_color": "#FFFFFF",
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
        "overlay_id": "caption:nguoi_yeu_cu_quoc_dan",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F19BA6",
              "#DB6A7E"
            ]
          },
          "max_lines": 1,
          "text": "Người yêu cũ quốc dân",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫠"
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
        "overlay_id": "caption:tinh_yeu_mau_hong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E2A0D9",
              "#AB7EC5"
            ]
          },
          "max_lines": 1,
          "text": "Tình yêu màu hồng",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌷"
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
        "overlay_id": "caption:em_be_ngoan_xinh_yeu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E89FCE",
              "#C070B8"
            ]
          },
          "max_lines": 1,
          "text": "Em bé ngoan xinh yêu",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
        }
      },
      {
        "overlay_id": "caption:het_yeu_thi_noi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B05971",
              "#71445C"
            ]
          },
          "max_lines": 1,
          "text": "Hết yêu thì nói",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💌"
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
        "overlay_id": "caption:rung_dong_dau_doi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E8A4A1",
              "#D17181"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💓"
          },
          "max_lines": 1,
          "text": "Rung động đầu đời",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:map_mo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D1AED0",
              "#A880B3"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🫧"
          },
          "max_lines": 1,
          "text": "Mập mờ",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:ban_than_khac_gioi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EBABA1",
              "#C77774"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🤝"
          },
          "max_lines": 1,
          "text": "Bạn thân khác giới",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:talking_stage",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EBB3A3",
              "#D38883"
            ]
          },
          "max_lines": 1,
          "text": "Talking stage",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫶"
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
        "overlay_id": "caption:moi_quan_he_khong_ten",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E8B297",
              "#BF7781"
            ]
          },
          "max_lines": 1,
          "text": "Mối quan hệ không tên",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💌"
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
        "overlay_id": "caption:luy_nhe_thoi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EEBBB3",
              "#BC7E7D"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌧️"
          },
          "max_lines": 1,
          "text": "Lụy nhẹ thôi",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:luy_tinh_khong_loi_thoat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CDAADA",
              "#A082C5"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🥀"
          },
          "max_lines": 1,
          "text": "Lụy tình không lối thoát",
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
        "overlay_id": "caption:em_on_nhung_em_buon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B4BDC6",
              "#798FA5"
            ]
          },
          "max_lines": 1,
          "text": "Em ổn nhưng em buồn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥲"
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
        "overlay_id": "caption:doc_than_vui_tinh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A26284",
              "#7B4A75"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "😎"
          },
          "max_lines": 1,
          "text": "Độc thân vui tính",
          "text_color": "#FFFFFF",
          "type": "static_content"
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
        "overlay_id": "caption:chua_co_bo_nhung_co_tieu_chuan",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E7CAB6",
              "#BF9394"
            ]
          },
          "max_lines": 1,
          "text": "Chưa có bồ nhưng có tiêu chuẩn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👑"
          }
        }
      },
      {
        "overlay_id": "caption:public_relationship",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F1A1C1",
              "#D16D92"
            ]
          },
          "max_lines": 1,
          "text": "Public relationship",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📢"
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
        "overlay_id": "caption:hard_launch",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F0B0A5",
              "#DB8284"
            ]
          },
          "max_lines": 1,
          "text": "Hard launch",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📢"
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
        "overlay_id": "caption:cung_xiu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E3B99C",
              "#B77E83"
            ]
          },
          "max_lines": 1,
          "text": "Cưng xỉu",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥹"
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
        "overlay_id": "caption:bat_den_do",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D79AC0",
              "#AD82BF"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🔴"
          },
          "max_lines": 1,
          "text": "Bật đèn đỏ",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:dang_ban_tuong_tu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D79DCA",
              "#A77EB4"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💭"
          },
          "max_lines": 1,
          "text": "Đang bận tương tư",
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
        "overlay_id": "caption:nho_ai_do",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DBADC2",
              "#AB7BB0"
            ]
          },
          "max_lines": 1,
          "text": "Nhớ ai đó",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💭"
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
        "overlay_id": "caption:bat_den_xanh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F0ABB8",
              "#C173A8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🟢"
          },
          "max_lines": 1,
          "text": "Bật đèn xanh",
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
      },
      {
        "overlay_id": "caption:dinh_nhu_keo_502",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DF9ACB",
              "#AD80C9"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🩹"
          },
          "max_lines": 1,
          "text": "Dính như keo 502",
          "text_color": "#292322",
          "type": "static_content"
        }
      }
    ]
  },
  {
    "section": "🌙 Mood & Chữa lành",
    "items": [
      {
        "overlay_id": "caption:overthinking_vai_chuong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9AABB0",
              "#74909B"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌀"
          },
          "max_lines": 1,
          "text": "Overthinking vai chưởng",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:cam_lanh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7A6C96",
              "#525471"
            ]
          },
          "max_lines": 1,
          "text": "Cảm lạnh",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤧"
          }
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
        "overlay_id": "caption:rot_nuoc_mat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7E6C9A",
              "#4C4C65"
            ]
          },
          "max_lines": 1,
          "text": "Rớt nước mắt",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💧"
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
        "overlay_id": "caption:tien_dinh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E0A67E",
              "#C27B65"
            ]
          },
          "max_lines": 1,
          "text": "Tiền đình",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💸"
          }
        }
      },
      {
        "overlay_id": "caption:bat_on_that_su",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D5C8DC",
              "#9888A9"
            ]
          },
          "max_lines": 1,
          "text": "Bất ổn thật sự",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌪️"
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
        "overlay_id": "caption:suy_ngang",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B7AEC0",
              "#8689A3"
            ]
          },
          "max_lines": 1,
          "text": "Suy ngang",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥲"
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
        "overlay_id": "caption:huong_noi_bat_thinh_linh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A2B1CB",
              "#7D8CA6"
            ]
          },
          "max_lines": 1,
          "text": "Hướng nội bất thình lình",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🐚"
          }
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
      },
      {
        "overlay_id": "caption:chill_mot_xiu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B1C8A3",
              "#79AF8F"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍃"
          },
          "max_lines": 1,
          "text": "Chill một xíu",
          "text_color": "#292322",
          "type": "static_content"
        }
      }
    ]
  },
  {
    "section": "✨ Aura · Slay & Flex",
    "items": [
      {
        "overlay_id": "caption:ifywnx_new_plus_1000_aura",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "+1000 aura",
          "max_lines": 1,
          "background": {
            "colors": [
              "#2E79B3",
              "#5D50B8"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "✨"
          }
        }
      },
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
        "overlay_id": "caption:ifywnx_new_aura_battle",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Aura Battle",
          "max_lines": 1,
          "background": {
            "colors": [
              "#4D6AC7",
              "#6651B7"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "⚡"
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
        "overlay_id": "caption:ifywnx_new_dang_farm_aura",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đang farm aura",
          "max_lines": 1,
          "background": {
            "colors": [
              "#795AC2",
              "#A355A9"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "✨"
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
        "overlay_id": "caption:ifywnx_new_cay_aura_bat_thanh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Cày aura bất thành",
          "max_lines": 1,
          "background": {
            "colors": [
              "#277D9D",
              "#31599D"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "✨"
          }
        }
      },
      {
        "overlay_id": "caption:ifywnx_new_ba_khi_nhung_hoi_ngai",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Bá khí nhưng hơi ngại",
          "max_lines": 1,
          "background": {
            "colors": [
              "#3F6FD5",
              "#5B43CC"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🫣"
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
        "overlay_id": "caption:ifywnx_new_dung_yen_cung_co_aura",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đứng yên cũng có aura",
          "max_lines": 1,
          "background": {
            "colors": [
              "#7058CF",
              "#A953B9"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "✨"
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
        "overlay_id": "caption:ifywnx_new_aura_con_bao_nhieu",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Aura còn bao nhiêu?",
          "max_lines": 1,
          "background": {
            "colors": [
              "#576EC8",
              "#434E97"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "✨"
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
        "overlay_id": "caption:slay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4B74C8",
              "#7B50B9"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💎"
          },
          "max_lines": 1,
          "text": "Slay",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:dinh_noc_kich_tran",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#227E99",
              "#285C9A"
            ]
          },
          "max_lines": 1,
          "text": "Đỉnh nóc kịch trần",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🚀"
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
        "overlay_id": "caption:xinh_gai_an_phim_1",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D7B1DA",
              "#AA7CBD"
            ]
          },
          "max_lines": 1,
          "text": "Xinh gái ấn phím 1",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
          }
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
        "overlay_id": "caption:nhan_sac_tu_len_tieng",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EDABB6",
              "#C67390"
            ]
          },
          "max_lines": 1,
          "text": "Nhan sắc tự lên tiếng",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🪞"
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
        "overlay_id": "caption:ifywnx_new_cong_diem_than_thai",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Cộng điểm thần thái",
          "max_lines": 1,
          "background": {
            "colors": [
              "#6244C4",
              "#9647A3"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "✨"
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
        "overlay_id": "caption:tinh_hoa_hoi_tu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#2F8095",
              "#2B5E89"
            ]
          },
          "max_lines": 1,
          "text": "Tinh hoa hội tụ",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌟"
          }
        }
      },
      {
        "overlay_id": "caption:phu_tinh_khong_phu_ban",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#3A75CD",
              "#6A41BC"
            ]
          },
          "max_lines": 1,
          "text": "Phụ tình không phụ bản",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💗"
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
        "overlay_id": "caption:chay_pho",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#3737CE",
              "#7038BD"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🔥"
          },
          "max_lines": 1,
          "text": "Cháy phố",
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
        "overlay_id": "caption:ifywnx_new_du_an_ma_mua_2",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Dự án ma mùa 2",
          "max_lines": 1,
          "background": {
            "colors": [
              "#2F70D9",
              "#4431D2"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "👻"
          }
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
      },
      {
        "overlay_id": "caption:ifywnx_new_ke_hoach_de_nam_sau",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Kế hoạch để năm sau",
          "max_lines": 1,
          "background": {
            "colors": [
              "#377C8F",
              "#4351A6"
            ]
          },
          "text_color": "#FFFFFF",
          "icon": {
            "type": "emoji",
            "data": "🗓️"
          }
        }
      }
    ]
  },
  {
    "section": "🔥 Trend TikTok & Threads",
    "items": [
      {
        "overlay_id": "caption:farm_aura",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4469CE",
              "#6546C7"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "✨"
          },
          "max_lines": 1,
          "text": "Farm aura",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:ba_khi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4E60BD",
              "#5F44AD"
            ]
          },
          "max_lines": 1,
          "text": "Bá khí",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⚡"
          }
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
        "overlay_id": "caption:hoi_chieu_troi_mua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#546E7A",
              "#263238"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌧️"
          },
          "max_lines": 1,
          "text": "Hồi chiều trời mưa...",
          "text_color": "#FFFFFFE6",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:mua_thu_ha_noi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#ECC78F",
              "#BE7F57"
            ]
          },
          "max_lines": 1,
          "text": "Mùa thu Hà Nội",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🍁"
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
        "overlay_id": "caption:nhiem_vu_he_thong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F48F79",
              "#E6607A"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🕹️"
          },
          "max_lines": 1,
          "text": "Nhiệm vụ hệ thống",
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
        "overlay_id": "caption:tay_vay_ni",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#594AA8",
              "#326BA8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🤠"
          },
          "max_lines": 1,
          "text": "tây nha ní",
          "text_color": "#FFFFFF",
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
        "overlay_id": "caption:fen_oi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B44FAD",
              "#8146B6"
            ]
          },
          "max_lines": 1,
          "text": "Fen ơi",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫵"
          }
        }
      },
      {
        "overlay_id": "caption:tuyet_doi_dien_anh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CF9C7A",
              "#B67D67"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎬"
          },
          "max_lines": 1,
          "text": "Tuyệt đối điện ảnh",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:chiec_xe_rolls_royce_phantom_luot_di_nhu_mot_bong_ma",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E2B866",
              "#C89049"
            ]
          },
          "max_lines": 1,
          "text": "Chiếc xe Rolls-Royce Phantom lướt đi như một bóng ma",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👻"
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
        "overlay_id": "caption:cong_chua_phong_tro",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EA8BA8",
              "#CB6F97"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "👑"
          },
          "max_lines": 1,
          "text": "Công chúa phòng trọ",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:hoang_tu_ky_tuc_xa",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5A71C6",
              "#4350AD"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🔥"
          },
          "max_lines": 1,
          "text": "Hoàng tử ký túc xá",
          "text_color": "#FFFFFF",
          "type": "static_content"
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
        "overlay_id": "caption:anh_thich_huong_thom",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E8A066",
              "#CC746E"
            ]
          },
          "max_lines": 1,
          "text": "Anh thích hương thơm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥹"
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
        "overlay_id": "caption:hen_lam_moi_xui_duoc_vay_a",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4EADC5",
              "#8486CB"
            ]
          },
          "max_lines": 1,
          "text": "Hên lắm mới xui được vậy á",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎲"
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
        "overlay_id": "caption:canh_bao_co_hat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7455C7",
              "#4D66BF"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎤"
          },
          "max_lines": 1,
          "text": "Cảnh báo có hát",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:doi_bo_bo_quan",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E12067",
              "#992D65"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "😎"
          },
          "max_lines": 1,
          "text": "Đời bố, bố quản",
          "text_color": "#FFFFFF",
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
        "overlay_id": "caption:dich_cabin",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C74571",
              "#8E3B7F"
            ]
          },
          "max_lines": 1,
          "text": "Dịch cabin",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "✨"
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
        "overlay_id": "caption:neu_ca_doi_khong_ruc_ro_thi_sao",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B546B9",
              "#773DBA"
            ]
          },
          "max_lines": 1,
          "text": "Nếu cả đời không rực rỡ thì sao?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌠"
          }
        }
      },
      {
        "overlay_id": "caption:moi_thu_hoa_dien_voi_chong_ngay_hom_nay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E5A3A3",
              "#C87897"
            ]
          },
          "max_lines": 1,
          "text": "Mọi thứ hóa điên với chồng ngày hôm nay",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫂"
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
        "overlay_id": "caption:giam_suc_manh_con_tuong_nay_giup_em",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#614DBC",
              "#A950A6"
            ]
          },
          "max_lines": 1,
          "text": "Giảm sức mạnh con tướng này giúp em",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎮"
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
        "overlay_id": "caption:e_kho_nha_bro",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E5A84F",
              "#CA7D33"
            ]
          },
          "max_lines": 1,
          "text": "Ê khó nha bro",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😵‍💫"
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
        "overlay_id": "caption:hen_lam_moi_xui_duoc_nhu_vay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DA3949",
              "#864086"
            ]
          },
          "max_lines": 1,
          "text": "Hên lắm mới xui được như vậy",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "✨"
          }
        }
      },
      {
        "overlay_id": "caption:luot_tiktok_hoai_vay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5072CC",
              "#3B51B1"
            ]
          },
          "max_lines": 1,
          "text": "Lướt TikTok hoài vậy?",
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
        "overlay_id": "caption:xin_loi_ba_nha_cai_mieng_tui_hoi_gian",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#67B8CF",
              "#638FD0"
            ]
          },
          "max_lines": 1,
          "text": "Xin lỗi bà nha, cái miệng tui hơi giãn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎤"
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
        "overlay_id": "caption:cap_long_may_skinship",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CC7658",
              "#DF8D5B"
            ]
          },
          "max_lines": 1,
          "text": "Cặp lông mày skinship",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🕹️"
          }
        }
      },
      {
        "overlay_id": "caption:nghe_bai_trinh_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AB56A4",
              "#854BB0"
            ]
          },
          "max_lines": 1,
          "text": "Nghe bài Trình chưa?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📚"
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
        "overlay_id": "caption:vo_chua_khong_biet_lay_ai",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BD516B",
              "#884370"
            ]
          },
          "max_lines": 1,
          "text": "Vô chùa không biết lạy ai",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫶"
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
        "overlay_id": "caption:thua_doi_1_0",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DBB65B",
              "#BE8D41"
            ]
          },
          "max_lines": 1,
          "text": "Thua đời 1-0",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⚡"
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
        "overlay_id": "caption:ten_ten_mat_mat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F19779",
              "#E16375"
            ]
          },
          "max_lines": 1,
          "text": "Tẻn tẻn, mát mát",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫧"
          }
        }
      },
      {
        "overlay_id": "caption:cau_be_do_tin_tuong_chau_qua_ha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C94744",
              "#7A4974"
            ]
          },
          "max_lines": 1,
          "text": "Cậu bé đó tin tưởng cháu quá ha",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
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
        "overlay_id": "caption:the_he_cot_nha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#377B92",
              "#5552B0"
            ]
          },
          "max_lines": 1,
          "text": "Thế hệ cợt nhả",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
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
      },
      {
        "overlay_id": "caption:e_nha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#714DBD",
              "#485AB2"
            ]
          },
          "max_lines": 1,
          "text": "Ê nha",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫵"
          }
        }
      }
    ]
  },
  {
    "section": "🤡 Meme & Câu cửa miệng",
    "items": [
      {
        "overlay_id": "caption:mong_ton_hoa_sen_thay_canh_nay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D97A55",
              "#EEA054"
            ]
          },
          "max_lines": 1,
          "text": "Mong Tôn Hoa Sen thấy cảnh này",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🪷"
          }
        }
      },
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
        "overlay_id": "caption:thua_gia_cat_luong_moi_cay_quat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D096A6",
              "#C07C8C"
            ]
          },
          "max_lines": 1,
          "text": "Thua Gia Cát Lượng mỗi cây quạt",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🪭"
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
        "overlay_id": "caption:do_mo_ho",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6FA284",
              "#4C9B8F"
            ]
          },
          "max_lines": 1,
          "text": "Đờ Mờ Hờ",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
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
        "overlay_id": "caption:pressing",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E09B77",
              "#C67971"
            ]
          },
          "max_lines": 1,
          "text": "Pressing",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
          }
        }
      },
      {
        "overlay_id": "caption:pressing_nguoc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#81A9C7",
              "#5F8FC6"
            ]
          },
          "max_lines": 1,
          "text": "Pressing ngược",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😳"
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
        "overlay_id": "caption:dinh_noc_cua_dinh_noc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E3A95F",
              "#CA7858"
            ]
          },
          "max_lines": 1,
          "text": "Đỉnh nóc của đỉnh nóc",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👑"
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
        "overlay_id": "caption:gio_tao_dua_may_4_ty_may_bien_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#54B4BC",
              "#5990C2"
            ]
          },
          "max_lines": 1,
          "text": "Giờ tao đưa mày 4 tỷ, mày biến không?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⏰"
          }
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
        "overlay_id": "caption:chao_sep_a",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A6A5D7",
              "#828AC6"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💼"
          },
          "max_lines": 1,
          "text": "Chào sếp ạ",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:cam_on_sep",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D37F6A",
              "#E3AA65"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🙏"
          },
          "max_lines": 1,
          "text": "Cảm ơn sếp",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:can_phuoc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7DB6D7",
              "#7B8BCE"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🥲"
          },
          "max_lines": 1,
          "text": "Cạn phước",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:giam_suc_manh_con_tuong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E6AD61",
              "#D08058"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎮"
          },
          "max_lines": 1,
          "text": "Giảm sức mạnh con tướng",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:tinh_queo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BD4C71",
              "#9A435E"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🫧"
          },
          "max_lines": 1,
          "text": "Tỉnh queo",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:bao_qua_bao",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#44BEC1",
              "#4992C5"
            ]
          },
          "max_lines": 1,
          "text": "Báo quá báo",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🚨"
          }
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
        "overlay_id": "caption:xit_keo_cung_ngac",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7C439E",
              "#CA3E87"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🧊"
          },
          "max_lines": 1,
          "text": "Xịt keo cứng ngắc",
          "text_color": "#FFFFFF",
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
        "overlay_id": "caption:chan_dong_dia_cau",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4C60D7",
              "#9046C5"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌎"
          },
          "max_lines": 1,
          "text": "Chấn động địa cầu",
          "text_color": "#FFFFFF",
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
        "overlay_id": "caption:1_may",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#686CC6",
              "#465EB2"
            ]
          },
          "max_lines": 1,
          "text": "+1 máy",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📱"
          }
        }
      },
      {
        "overlay_id": "caption:nay_thang_chong_cai_quai_dan_gi_the",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C14B66",
              "#974482"
            ]
          },
          "max_lines": 1,
          "text": "Này thằng chồng, cái quái đản gì thế?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
          }
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
        "overlay_id": "caption:cot",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DE6C4C",
              "#F3944C"
            ]
          },
          "max_lines": 1,
          "text": "Cốt",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
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
        "overlay_id": "caption:tui_tuong_ai_cung_co_chu_tar",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D93165",
              "#993F7F"
            ]
          },
          "max_lines": 1,
          "text": "Tui tưởng ai cũng có chứ tar",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫢"
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
        "overlay_id": "caption:len_phim",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#76BEDD",
              "#718CD3"
            ]
          },
          "max_lines": 1,
          "text": "Lên phím",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
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
        "overlay_id": "caption:tren_nui_het_cho_roi_moi_doan_minh_xuong_bien",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C45124",
              "#983733"
            ]
          },
          "max_lines": 1,
          "text": "Trên núi hết chỗ rồi, mời đoàn mình xuống biển",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "☀️"
          }
        }
      },
      {
        "overlay_id": "caption:ra_duong_em_ne_moi_anh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D76C5C",
              "#E79B55"
            ]
          },
          "max_lines": 1,
          "text": "Ra đường em nể mỗi anh",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
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
        "overlay_id": "caption:oi_gi_the",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6FA889",
              "#549993"
            ]
          },
          "max_lines": 1,
          "text": "Oi gì thé?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤯"
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
        "overlay_id": "caption:dang_an_gung",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C4B49A",
              "#A58669"
            ]
          },
          "max_lines": 1,
          "text": "Đang ăn gừng",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥢"
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
        "overlay_id": "caption:khe_lam",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6FA4BA",
              "#9785C8"
            ]
          },
          "max_lines": 1,
          "text": "Khê lắm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😳"
          }
        }
      },
      {
        "overlay_id": "caption:flop_qua_thi_ghi_ten_anh_vao",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#865DC8",
              "#5363BB"
            ]
          },
          "max_lines": 1,
          "text": "Flop quá thì ghi tên anh vào",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
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
        "overlay_id": "caption:phai_gi_phai_gi_phai_chiu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A87ABA",
              "#D487A5"
            ]
          },
          "max_lines": 1,
          "text": "Phải gì, phải gì… phải chịu",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
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
        "overlay_id": "caption:ngai_het_ca_meo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CD475F",
              "#954D78"
            ]
          },
          "max_lines": 1,
          "text": "Ngại hết cả mèo",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🐱"
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
        "overlay_id": "caption:du_wow_roi_do",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DC9D72",
              "#C07A70"
            ]
          },
          "max_lines": 1,
          "text": "Đủ wow rồi đó",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
          }
        }
      },
      {
        "overlay_id": "caption:minh_xin_phep_an_mieng_to_nhe",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C4A8CB",
              "#A183B4"
            ]
          },
          "max_lines": 1,
          "text": "Mình xin phép ăn miếng to nhé",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥐"
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
        "overlay_id": "caption:vua_chua_ngay_xua_cung_chi_den_the_la_cung",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D1774B",
              "#E89F48"
            ]
          },
          "max_lines": 1,
          "text": "Vua chúa ngày xưa cũng chỉ đến thế là cùng",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👑"
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
        "overlay_id": "caption:toi_la_nan_nhan_cua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4C789E",
              "#3B5D90"
            ]
          },
          "max_lines": 1,
          "text": "Tôi là nạn nhân của…",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🥲"
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
        "overlay_id": "caption:day_la_trach_nhiem_cua_em",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#80B3D2",
              "#7F88C8"
            ]
          },
          "max_lines": 1,
          "text": "Đây là trách nhiệm của em",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫡"
          }
        }
      },
      {
        "overlay_id": "caption:ua_tui_tuong_ai_cung_biet_chu_tar",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CA7B61",
              "#DCA85A"
            ]
          },
          "max_lines": 1,
          "text": "Ủa tui tưởng ai cũng biết chữ tar",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
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
        "overlay_id": "caption:lop_truong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AC7AC4",
              "#DE85B0"
            ]
          },
          "max_lines": 1,
          "text": "Lốp trưởng",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤡"
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
        "overlay_id": "caption:nguoi_choi_he",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BB4F6F",
              "#97435D"
            ]
          },
          "max_lines": 1,
          "text": "Người chơi hệ…",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
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
      },
      {
        "overlay_id": "caption:da_the_con",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5D6AD7",
              "#9B57C6"
            ]
          },
          "max_lines": 1,
          "text": "Đã thế còn…",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
          }
        }
      }
    ]
  },
  {
    "section": "🧠 Vô tri & Brainrot",
    "items": [
      {
        "overlay_id": "caption:hat_dua_trong_banh_trung_thu_la_do_ai_can",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E8AA61",
              "#CD745B"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🥮"
          },
          "max_lines": 1,
          "text": "Hạt dưa trong bánh trung thu là do ai cắn?",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:toi_thay_ban_dep_neu_nhu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7852BD",
              "#A550BB"
            ]
          },
          "max_lines": 1,
          "text": "Tôi thấy bạn đẹp nếu như…",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💅"
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
        "overlay_id": "caption:he_thong_giao_nhiem_vu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DEA869",
              "#A67FAF"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🕹️"
          },
          "max_lines": 1,
          "text": "Hệ thống giao nhiệm vụ",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:chuc_mung_hoan_thanh_nhiem_vu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#88BBC6",
              "#708DC0"
            ]
          },
          "max_lines": 1,
          "text": "Chúc mừng, hoàn thành nhiệm vụ",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🏆"
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
        "overlay_id": "caption:tru_diem_nhan_pham",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#79A7CB",
              "#9081C9"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎲"
          },
          "max_lines": 1,
          "text": "Trừ điểm nhân phẩm",
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
        "overlay_id": "caption:ao_that_day",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CB3986",
              "#7E3C87"
            ]
          },
          "max_lines": 1,
          "text": "Ảo thật đấy",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🪄"
          }
        }
      },
      {
        "overlay_id": "caption:mlem_mlem",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#734FC4",
              "#A34DC2"
            ]
          },
          "max_lines": 1,
          "text": "Mlem mlem",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😋"
          }
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
        "overlay_id": "caption:khum",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#3F7B92",
              "#4840BD"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🙅"
          },
          "max_lines": 1,
          "text": "Khum",
          "text_color": "#FFFFFF",
          "type": "static_content"
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
        "overlay_id": "caption:con_cai_nit",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CE4A36",
              "#BB3373"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🫠"
          },
          "max_lines": 1,
          "text": "Còn cái nịt",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:get_go",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#367CA9",
              "#4C3DA9"
            ]
          },
          "max_lines": 1,
          "text": "Gét gô",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👾"
          }
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
        "overlay_id": "caption:mai_man",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C0487B",
              "#7F4881"
            ]
          },
          "max_lines": 1,
          "text": "Mãi mận",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫶"
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
        "overlay_id": "caption:di_vao_long_dat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DDAE6D",
              "#A77CB0"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🕳️"
          },
          "max_lines": 1,
          "text": "Đi vào lòng đất",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:toang_roi_ong_giao_a",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4A7B89",
              "#374B78"
            ]
          },
          "max_lines": 1,
          "text": "Toang rồi ông giáo ạ",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💥"
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
        "overlay_id": "caption:bat_ngua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4779AA",
              "#664DA8"
            ]
          },
          "max_lines": 1,
          "text": "Bật ngửa",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😳"
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
      },
      {
        "overlay_id": "caption:he_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C84083",
              "#803E85"
            ]
          },
          "max_lines": 1,
          "text": "Hề chúa",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤡"
          }
        }
      }
    ]
  },
  {
    "section": "😏 Cà khịa & Có duyên",
    "items": [
      {
        "overlay_id": "caption:ai_muon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C4B0DC",
              "#A99ACB"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🤨"
          },
          "max_lines": 1,
          "text": "Ai mượn?",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:khong_ai_hoi_nhung_van_ke",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5F74AC",
              "#4A5C8D"
            ]
          },
          "max_lines": 1,
          "text": "Không ai hỏi nhưng vẫn kể",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤨"
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
        "overlay_id": "caption:mac_gi_coc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E2A896",
              "#BA7A90"
            ]
          },
          "max_lines": 1,
          "text": "Mắc gì cọc?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😤"
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
        "overlay_id": "caption:roi_mac_gi_ke",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D7A362",
              "#BD7D64"
            ]
          },
          "max_lines": 1,
          "text": "Rồi mắc gì kể?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🗣️"
          }
        }
      },
      {
        "overlay_id": "caption:mo_hon_nhung_tam_hien",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D8A9A7",
              "#A98191"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "😇"
          },
          "max_lines": 1,
          "text": "Mỏ hỗn nhưng tâm hiền",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:hai_huoc_tuong_minh_vo_duyen",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C697C5",
              "#9D83C3"
            ]
          },
          "max_lines": 1,
          "text": "Hài hước tưởng mình vô duyên",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤣"
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
        "overlay_id": "caption:noi_chuyen_co_duyen_ghe",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AEB0DB",
              "#8888C6"
            ]
          },
          "max_lines": 1,
          "text": "Nói chuyện có duyên ghê",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫢"
          }
        }
      },
      {
        "overlay_id": "caption:duyen_am_hay_gi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BC5352",
              "#78465E"
            ]
          },
          "max_lines": 1,
          "text": "Duyên âm hay gì?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👻"
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
        "overlay_id": "caption:ra_duong_ne_moi_anh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6EACAD",
              "#6493B3"
            ]
          },
          "max_lines": 1,
          "text": "Ra đường nể mỗi anh",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙃"
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
        "overlay_id": "caption:co_vay_cung_khoe",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AC5C89",
              "#824584"
            ]
          },
          "max_lines": 1,
          "text": "Có vậy cũng khoe",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
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
        "overlay_id": "caption:tat_mic_no_gium_em",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D2A77D",
              "#C07B7B"
            ]
          },
          "max_lines": 1,
          "text": "Tắt mic nó giùm em",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎙️"
          }
        }
      },
      {
        "overlay_id": "caption:bot_dien_gium",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A755AB",
              "#6647A2"
            ]
          },
          "max_lines": 1,
          "text": "Bớt diễn giùm",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎭"
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
        "overlay_id": "caption:ai_so_thi_di_ve",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5F71C3",
              "#4749A0"
            ]
          },
          "max_lines": 1,
          "text": "Ai sợ thì đi về",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🏃"
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
        "overlay_id": "caption:mac_co_qua_hai_oi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D1A45F",
              "#B57E63"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🫣"
          },
          "max_lines": 1,
          "text": "Mắc cỡ quá hai ơi",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:du_ba_khi_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#78A6AE",
              "#758FAD"
            ]
          },
          "max_lines": 1,
          "text": "Đủ bá khí chưa?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😎"
          }
        }
      },
      {
        "overlay_id": "caption:nhin_la_biet_uy_tin",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5B6EBD",
              "#8255AA"
            ]
          },
          "max_lines": 1,
          "text": "Nhìn là biết uy tín",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "✅"
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
        "overlay_id": "caption:khong_khi_tren_do_co_loang_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4E7A96",
              "#3B537B"
            ]
          },
          "max_lines": 1,
          "text": "Không khí trên đó có loãng không?",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "☁️"
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
        "overlay_id": "caption:chuyen_qua_thuoc_nam_coi_thu_do_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C6AA7E",
              "#AE8279"
            ]
          },
          "max_lines": 1,
          "text": "Chuyển qua thuốc nam coi thử đỡ không",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌿"
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
        "overlay_id": "caption:ai_roi_cung_khac",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E5A595",
              "#BD7691"
            ]
          },
          "max_lines": 1,
          "text": "Ai rồi cũng khác",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤨"
          }
        }
      },
      {
        "overlay_id": "caption:chuyen_gi_dang_xay_ra_vay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#72A8AB",
              "#6891B1"
            ]
          },
          "max_lines": 1,
          "text": "Chuyện gì đang xảy ra vậy?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
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
        "overlay_id": "caption:choc_thoi_ma_cang",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D9B37C",
              "#B48B68"
            ]
          },
          "max_lines": 1,
          "text": "Chọc thôi mà căng",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⏳"
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
        "overlay_id": "caption:sao_khong_ai_can_no_lai",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D9ABA9",
              "#B27E95"
            ]
          },
          "max_lines": 1,
          "text": "Sao không ai cản nó lại?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤨"
          }
        }
      },
      {
        "overlay_id": "caption:sao_khong_ai_noi_toi_biet_chuyen_nay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C892C9",
              "#9B82C7"
            ]
          },
          "max_lines": 1,
          "text": "Sao không ai nói tôi biết chuyện này?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫢"
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
        "overlay_id": "caption:tuong_the_nao",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8BB7CC",
              "#6A91C0"
            ]
          },
          "max_lines": 1,
          "text": "Tưởng thế nào",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
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
        "overlay_id": "caption:hay_qua_ha_hay_du_ha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CEA77B",
              "#BB7A74"
            ]
          },
          "max_lines": 1,
          "text": "Hay quá ha, hay dữ ha",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
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
        "overlay_id": "caption:nghe_co_ve_uy_tin",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9F5F7C",
              "#784872"
            ]
          },
          "max_lines": 1,
          "text": "Nghe có vẻ uy tín",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙃"
          }
        }
      },
      {
        "overlay_id": "caption:uy_tin_nhu_loi_don",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6271C2",
              "#47499D"
            ]
          },
          "max_lines": 1,
          "text": "Uy tín như lời đồn",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙄"
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
        "overlay_id": "caption:mac_cai_gi_ma_hay_du_vay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E0B19A",
              "#B77F91"
            ]
          },
          "max_lines": 1,
          "text": "Mắc cái gì mà hay dữ vậy?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤨"
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
        "overlay_id": "caption:noi_vay_ma_nghe_duoc_ha",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D6AE6D",
              "#BD8A6E"
            ]
          },
          "max_lines": 1,
          "text": "Nói vậy mà nghe được hả?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👂"
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
      },
      {
        "overlay_id": "caption:co_can_thiet_phai_vay_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#ADC28D",
              "#71AA79"
            ]
          },
          "max_lines": 1,
          "text": "Có cần thiết phải vậy không?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
        }
      }
    ]
  },
  {
    "section": "💬 Reaction & Comment dạo",
    "items": [
      {
        "overlay_id": "caption:ua_alo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8DC8E8",
              "#609FCE"
            ]
          },
          "max_lines": 1,
          "text": "Ủa alo?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📞"
          }
        }
      },
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
        "overlay_id": "caption:ua_roi_sao_nua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DFC79B",
              "#B99A65"
            ]
          },
          "max_lines": 1,
          "text": "Ủa rồi sao nữa?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤔"
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
        "overlay_id": "caption:sao_giong_cuoc_doi_toi_vay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E6AA6C",
              "#D88374"
            ]
          },
          "max_lines": 1,
          "text": "Sao giống cuộc đời tôi vậy?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫣"
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
        "overlay_id": "caption:khong_con_gi_de_mat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#95C7D4",
              "#6996B5"
            ]
          },
          "max_lines": 1,
          "text": "Không còn gì để mất",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🫠"
          }
        }
      },
      {
        "overlay_id": "caption:dinh_cua_chop_cua_chop",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F0BD8A",
              "#CD8C62"
            ]
          },
          "max_lines": 1,
          "text": "Đỉnh của chóp của chóp",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🐱"
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
        "overlay_id": "caption:ifywnx_new_ua_sao_hay_di",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ủa sao hay dị?",
          "max_lines": 1,
          "background": {
            "colors": [
              "#8CC48E",
              "#60AD91"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "😏"
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
        "overlay_id": "caption:tui_cuoi_tui_chet",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A4C3D9",
              "#719AC7"
            ]
          },
          "max_lines": 1,
          "text": "Tui cười tui chết",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😹"
          }
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
        "overlay_id": "caption:cuoi_khong_nhat_duoc_mom",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AAB2E0",
              "#8A8BCB"
            ]
          },
          "max_lines": 1,
          "text": "Cười không nhặt được mồm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤡"
          }
        }
      },
      {
        "overlay_id": "caption:mac_cuoi_muon_xiu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DB99A3",
              "#C078A8"
            ]
          },
          "max_lines": 1,
          "text": "Mắc cười muốn xỉu",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😹"
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
        "overlay_id": "caption:qua_keo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A9B1DA",
              "#7F8BBF"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💅"
          },
          "max_lines": 1,
          "text": "Quá keo",
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
        "overlay_id": "caption:chay_het_minh",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F3AB73",
              "#CF774C"
            ]
          },
          "max_lines": 1,
          "text": "Cháy hết mình",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🔥"
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
        "overlay_id": "caption:ifywnx_new_dep_kieu_vo_tinh",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Đẹp kiểu vô tình",
          "max_lines": 1,
          "background": {
            "colors": [
              "#82C8D3",
              "#5595B5"
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
        "overlay_id": "caption:ifywnx_new_ai_cho_phep_dep_vay",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ai cho phép đẹp vậy?",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DDA8B4",
              "#B677A5"
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
        "overlay_id": "caption:ngo_ngac_bat_ngua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A3B0E3",
              "#838ACE"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "😵‍💫"
          },
          "max_lines": 1,
          "text": "Ngơ ngác bật ngửa",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:toi_day_la_het_cuu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8968A5",
              "#4B547E"
            ]
          },
          "max_lines": 1,
          "text": "Tới đây là hết cứu",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😱"
          }
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
        "overlay_id": "caption:toi_roi_toi_roi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8CBCD5",
              "#5693C6"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🏃"
          },
          "max_lines": 1,
          "text": "Tới rồi tới rồi",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:oi_tieu_roi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DFA761",
              "#D07F6A"
            ]
          },
          "max_lines": 1,
          "text": "Ôi tiêu rồi",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😵"
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
        "overlay_id": "caption:tat_mic_gium",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9AC89D",
              "#6FB09B"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎙️"
          },
          "max_lines": 1,
          "text": "Tắt mic giùm",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:roi_la_vui_du_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A3B0DC",
              "#788BC3"
            ]
          },
          "max_lines": 1,
          "text": "Rồi là vui dữ chưa?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:co_ai_giong_tui_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#EBBA7E",
              "#C4885A"
            ]
          },
          "max_lines": 1,
          "text": "Có ai giống tui không?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌷"
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
        "overlay_id": "caption:nhung_ma_no_la_lam",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D39AB0",
              "#B37DA1"
            ]
          },
          "max_lines": 1,
          "text": "Nhưng mà nó lạ lắm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💀"
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
        "overlay_id": "caption:roi_ai_cung_phai_lon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A6AADA",
              "#8987C4"
            ]
          },
          "max_lines": 1,
          "text": "Rồi ai cũng phải lớn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌱"
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
        "overlay_id": "caption:coi_ma_tuc_a",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D9B0B3",
              "#B27E9E"
            ]
          },
          "max_lines": 1,
          "text": "Coi mà tức á",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😤"
          }
        }
      },
      {
        "overlay_id": "caption:troi_dat_quy_than_oi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9BB7D0",
              "#698DBD"
            ]
          },
          "max_lines": 1,
          "text": "Trời đất quỷ thần ơi",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😱"
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
        "overlay_id": "caption:qua_troi_qua_dat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F1B47E",
              "#CE8256"
            ]
          },
          "max_lines": 1,
          "text": "Quá trời quá đất",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌎"
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
        "overlay_id": "caption:xin_mot_ve_ve_tuoi_tho",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#8BC7D4",
              "#5E95B6"
            ]
          },
          "max_lines": 1,
          "text": "Xin một vé về tuổi thơ",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
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
        "overlay_id": "caption:dung_la_cai_net",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#ABAFD7",
              "#828ABA"
            ]
          },
          "max_lines": 1,
          "text": "Đúng là cái nết",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😏"
          }
        }
      },
      {
        "overlay_id": "caption:troi_oi_tin_duoc_khong",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E0CFA5",
              "#B9A36F"
            ]
          },
          "max_lines": 1,
          "text": "Trời ơi tin được không?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💥"
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
        "overlay_id": "caption:tri_tuong_tuong_phong_phu_ghe",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DCABB4",
              "#B47CA4"
            ]
          },
          "max_lines": 1,
          "text": "Trí tưởng tượng phong phú ghê",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🙄"
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
        "overlay_id": "caption:toi_ben_luon",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#ABD3B0",
              "#7FBCAC"
            ]
          },
          "max_lines": 1,
          "text": "Tới bến luôn",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🚀"
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
        "overlay_id": "caption:soc_van_hoa",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CCB098",
              "#AA8471"
            ]
          },
          "max_lines": 1,
          "text": "Sốc văn hóa",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌍"
          }
        }
      },
      {
        "overlay_id": "caption:thay_ghe_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D993B5",
              "#BB75A9"
            ]
          },
          "max_lines": 1,
          "text": "Thấy ghê chưa",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "😯"
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
        "overlay_id": "caption:ifywnx_new_e_cai_net",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ê cái nết!",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EFC895",
              "#CD996D"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "😏"
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
        "overlay_id": "caption:ifywnx_new_tui_chi_di_ngang_qua",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tui chỉ đi ngang qua",
          "max_lines": 1,
          "background": {
            "colors": [
              "#9EC6D5",
              "#7396B5"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🙃"
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
        "overlay_id": "caption:ifywnx_new_toi_khuc_nay_luon_a",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Tới khúc này luôn á?",
          "max_lines": 1,
          "background": {
            "colors": [
              "#EDB777",
              "#E0907E"
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
        "overlay_id": "caption:ifywnx_new_xong_phim",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Xong phim",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B0CEAC",
              "#82B493"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🎬"
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
        "overlay_id": "caption:ifywnx_new_dinh_ngau_ma",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Định ngầu mà...",
          "max_lines": 1,
          "background": {
            "colors": [
              "#ADC4DA",
              "#7B9AC7"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "🫠"
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
        "overlay_id": "caption:ifywnx_new_anh_nay_co_quyen_luc",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Ảnh này có quyền lực",
          "max_lines": 1,
          "background": {
            "colors": [
              "#DAB1B5",
              "#B3819F"
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
      },
      {
        "overlay_id": "caption:ifywnx_new_chua_kip_phan_ung",
        "source": "remote",
        "caption": {
          "type": "static_content",
          "text": "Chưa kịp phản ứng",
          "max_lines": 1,
          "background": {
            "colors": [
              "#B3B7E1",
              "#9693CC"
            ]
          },
          "text_color": "#292322",
          "icon": {
            "type": "emoji",
            "data": "😳"
          }
        }
      }
    ]
  },
  {
    "section": "👀 Check VAR & Hóng hớt",
    "items": [
      {
        "overlay_id": "caption:check_var_lien",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E3A669",
              "#C67A72"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "📹"
          },
          "max_lines": 1,
          "text": "Check VAR liền",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:hong_tu_dau_den_cuoi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6849C9",
              "#4161C1"
            ]
          },
          "max_lines": 1,
          "text": "Hóng từ đầu đến cuối",
          "text_color": "#FFFFFF",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🍿"
          }
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
        "overlay_id": "caption:tin_chuan_chua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DF97B0",
              "#C173AF"
            ]
          },
          "max_lines": 1,
          "text": "Tin chuẩn chưa?",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🔎"
          }
        }
      },
      {
        "overlay_id": "caption:de_tui_hong_voi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F68975",
              "#E95A7C"
            ]
          },
          "max_lines": 1,
          "text": "Để tui hóng với",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🍿"
          }
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
        "overlay_id": "caption:ai_co_full_clip",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#297B8E",
              "#4248B3"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🎞️"
          },
          "max_lines": 1,
          "text": "Ai có full clip?",
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
        "overlay_id": "caption:hong_drama",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#51B3CB",
              "#4894CC"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍿"
          },
          "max_lines": 1,
          "text": "Hóng drama",
          "text_color": "#292322",
          "type": "static_content"
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
      },
      {
        "overlay_id": "caption:kiem_tra_nhan_pham",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D49F7B",
              "#BB7B66"
            ]
          },
          "max_lines": 1,
          "text": "Kiểm tra nhân phẩm",
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
    "section": "🎒 Sinh viên, Deadline & Đi làm",
    "items": [
      {
        "overlay_id": "caption:deadline_di_tut_quan",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#97BDDA",
              "#688FB8"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "⏰"
          },
          "max_lines": 1,
          "text": "Deadline dí tụt quần",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:hoc_tai_thi_phan",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DDA88F",
              "#C17981"
            ]
          },
          "max_lines": 1,
          "text": "Học tài thi phận",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📝"
          }
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
        "overlay_id": "caption:chay_deadline_bang_com",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CBB0DA",
              "#9D82BF"
            ]
          },
          "max_lines": 1,
          "text": "Chạy deadline bằng cơm",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "⏰"
          }
        }
      },
      {
        "overlay_id": "caption:deadline_la_dong_luc",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#77C3C9",
              "#4399B0"
            ]
          },
          "max_lines": 1,
          "text": "Deadline là động lực",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
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
        "overlay_id": "caption:thi_xong_la_quen",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#ACC198",
              "#77AE85"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "📚"
          },
          "max_lines": 1,
          "text": "Thi xong là quên",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:qua_mon_trong_nuoc_mat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DFAB75",
              "#B98160"
            ]
          },
          "max_lines": 1,
          "text": "Qua môn trong nước mắt",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
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
        "overlay_id": "caption:di_hoc_nhu_di_danh_tran",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D2AE94",
              "#B37D7F"
            ]
          },
          "max_lines": 1,
          "text": "Đi học như đi đánh trận",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
        }
      },
      {
        "overlay_id": "caption:khong_co_gi_ngoai_thoi_gian_va_bai_tap",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7DB9CB",
              "#5D90B8"
            ]
          },
          "max_lines": 1,
          "text": "Không có gì ngoài thời gian và bài tập",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📝"
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
        "overlay_id": "caption:sinh_vien_ngheo_vuot_kho",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F7D17B",
              "#E9A854"
            ]
          },
          "max_lines": 1,
          "text": "Sinh viên nghèo vượt khó",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎒"
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
        "overlay_id": "caption:peer_pressure",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E3C88F",
              "#CFA56F"
            ]
          },
          "max_lines": 1,
          "text": "Peer pressure",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📚"
          }
        }
      },
      {
        "overlay_id": "caption:di_lam_vi_dam_me",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B4C69B",
              "#7CB185"
            ]
          },
          "max_lines": 1,
          "text": "Đi làm vì đam mê",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💼"
          }
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
        "overlay_id": "caption:ran_kpi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D1AF72",
              "#A98662"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🐍"
          },
          "max_lines": 1,
          "text": "Rắn KPI",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:teamwork_makes_the_dream_work",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D8BE96",
              "#B89975"
            ]
          },
          "max_lines": 1,
          "text": "Teamwork makes the dream work",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👻"
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
        "overlay_id": "caption:di_lam_chua_lanh_vi_tien",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9FC8C6",
              "#6BABAA"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💸"
          },
          "max_lines": 1,
          "text": "Đi làm chữa lành ví tiền",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:cong_viec_chon_nguoi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DCBA7A",
              "#C7955B"
            ]
          },
          "max_lines": 1,
          "text": "Công việc chọn người",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💻"
          }
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
        "overlay_id": "caption:du_an_con_tren_giay",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DAAB71",
              "#B5835D"
            ]
          },
          "max_lines": 1,
          "text": "Dự án còn trên giấy",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "📝"
          }
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
        "overlay_id": "caption:lam_vi_dam_me_luong_la_phu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#9ABAD8",
              "#718CBB"
            ]
          },
          "max_lines": 1,
          "text": "Làm vì đam mê, lương là phụ",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💸"
          }
        }
      },
      {
        "overlay_id": "caption:tien_dau_ma_tieu",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DBAC93",
              "#BE7A82"
            ]
          },
          "max_lines": 1,
          "text": "Tiền đâu mà tiêu",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "💰"
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
        "overlay_id": "caption:vi_con_cai_nit",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#7BBEC7",
              "#4795AE"
            ]
          },
          "max_lines": 1,
          "text": "Ví còn cái nịt",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👛"
          }
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
        "overlay_id": "caption:cuoi_thang_an_mi",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#AAD5CC",
              "#74AFA6"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🍜"
          },
          "max_lines": 1,
          "text": "Cuối tháng ăn mì",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:can_nap_caffeine_gap",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#B7B6D7",
              "#828EB7"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "☕"
          },
          "max_lines": 1,
          "text": "Cần nạp caffeine gấp",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:vua_mo_laptop_da_met",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#BACCAA",
              "#89B896"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "💻"
          },
          "max_lines": 1,
          "text": "Vừa mở laptop đã mệt",
          "text_color": "#292322",
          "type": "static_content"
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
        "overlay_id": "caption:ap_luc_dong_trang_lua",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#A7BAD8",
              "#788CAF"
            ]
          },
          "max_lines": 1,
          "text": "Áp lực đồng trang lứa",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🌫️"
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
      },
      {
        "overlay_id": "caption:tam_chieu_chua_tung_trai",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D8B59B",
              "#B98484"
            ]
          },
          "max_lines": 1,
          "text": "Tấm chiếu chưa từng trải",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🧻"
          }
        }
      }
    ]
  },
  {
    "section": "🌐 English Slang & Internet",
    "items": [
      {
        "overlay_id": "caption:sigma",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C77856",
              "#DC8D58"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🐺"
          },
          "max_lines": 1,
          "text": "Sigma",
          "text_color": "#292322",
          "type": "static_content"
        }
      },
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
        "overlay_id": "caption:glow_up",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#DCB5C5",
              "#B17EA2"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "✨"
          },
          "max_lines": 1,
          "text": "Glow up",
          "text_color": "#292322",
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
        "overlay_id": "caption:looksmaxxing",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F0A4BF",
              "#CF7190"
            ]
          },
          "max_lines": 1,
          "text": "Looksmaxxing",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👻"
          }
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
        "overlay_id": "caption:npc_energy",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#D73643",
              "#834082"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🤖"
          },
          "max_lines": 1,
          "text": "NPC energy",
          "text_color": "#FFFFFF",
          "type": "static_content"
        }
      },
      {
        "overlay_id": "caption:main_character_energy",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#6851BA",
              "#A754A1"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🌟"
          },
          "max_lines": 1,
          "text": "Main character energy",
          "text_color": "#FFFFFF",
          "type": "static_content"
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
        "overlay_id": "caption:canon_event",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E1C371",
              "#C79C54"
            ]
          },
          "max_lines": 1,
          "text": "Canon event",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎞️"
          }
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
        "overlay_id": "caption:goat",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#5E6EC4",
              "#474BAA"
            ]
          },
          "icon": {
            "type": "emoji",
            "data": "🐐"
          },
          "max_lines": 1,
          "text": "GOAT",
          "text_color": "#FFFFFF",
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
        "overlay_id": "caption:let_him_cook",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#53A4C2",
              "#8B88CA"
            ]
          },
          "max_lines": 1,
          "text": "Let him cook",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👨‍🍳"
          }
        }
      },
      {
        "overlay_id": "caption:skill_issue",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E88FA4",
              "#C87494"
            ]
          },
          "max_lines": 1,
          "text": "Skill issue",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎮"
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
        "overlay_id": "caption:pov",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CDA47F",
              "#B38269"
            ]
          },
          "max_lines": 1,
          "text": "POV",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👁️"
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
        "overlay_id": "caption:jomo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#62A7C7",
              "#588EC9"
            ]
          },
          "max_lines": 1,
          "text": "JOMO",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🧘"
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
        "overlay_id": "caption:l_take",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#E5A664",
              "#C8786D"
            ]
          },
          "max_lines": 1,
          "text": "L take",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤖"
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
        "overlay_id": "caption:mid",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#76ACC7",
              "#728AC7"
            ]
          },
          "max_lines": 1,
          "text": "Mid",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🤖"
          }
        }
      },
      {
        "overlay_id": "caption:peak",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#F79275",
              "#EB5C73"
            ]
          },
          "max_lines": 1,
          "text": "Peak",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "👾"
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
        "overlay_id": "caption:yolo",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#C48B67",
              "#D8A068"
            ]
          },
          "max_lines": 1,
          "text": "YOLO",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🎢"
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
        "overlay_id": "caption:glazing",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#4EB1CE",
              "#8685D3"
            ]
          },
          "max_lines": 1,
          "text": "Glazing",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🧈"
          }
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
      },
      {
        "overlay_id": "caption:built_different",
        "source": "remote",
        "caption": {
          "background": {
            "colors": [
              "#CD80C9",
              "#A975D1"
            ]
          },
          "max_lines": 1,
          "text": "Built different",
          "text_color": "#292322",
          "type": "static_content",
          "icon": {
            "type": "emoji",
            "data": "🦾"
          }
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