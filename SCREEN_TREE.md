# Hurriya Ride Screen Tree

The original Stitch screens are preserved as static preview assets under `public/screens`. Every HTML file is directly inside its dashboard folder and keeps the screen folder name. Unused local screenshot images and empty screen folders have been removed; screens keep their existing remote image URLs and inline graphics.

```text
public/screens/
├── admin/
│   ├── admin_command_center.html
│   ├── admin_command_center_live_hotspots_map.html
│   ├── admin_driver_performance_analytics.html
│   ├── admin_sos_alert_panel.html
│   ├── advanced_operational_analytics.html
│   ├── driver_document_onboarding.html
│   ├── driver_verification_pipeline.html
│   ├── incident_reporting_form.html
│   ├── ssp_revenue_ledger_refined.html
│   ├── admin_settings_compliance_protocols.html
│   ├── admin_settings_create_new_role_modal.html
│   ├── admin_settings_general_configuration.html
│   ├── admin_settings_refined_security_access.html
│   ├── admin_settings_security_access.html
│   └── admin_settings_system_integration.html
├── design/
│   └── shader.html
├── driver/
│   ├── active_trip_enhanced_navigation.html
│   ├── driver_dashboard_offline.html
│   ├── driver_training_portal.html
│   ├── earnings_payouts.html
│   ├── incoming_trip_request.html
│   └── trip_matching_connecting.html
├── fleet/
│   ├── corporate_billing_management.html
│   ├── driver_performance_review.html
│   ├── fleet_management_compliance_refined.html
│   └── vehicle_financing_dashboard.html
├── passenger/
│   ├── active_emergency_shield.html
│   ├── bill_payments.html
│   ├── book_a_delivery.html
│   ├── book_a_ride_in_juba.html
│   ├── book_a_ride_in_juba_finalized.html
│   ├── cash_out_request.html
│   ├── commuter_pass_system.html
│   ├── hurriya_super_app_home.html
│   ├── hurriya_super_app_home_refined.html
│   ├── otp_verification_flow.html
│   ├── rewards_promos.html
│   ├── rider_push_notifications.html
│   ├── rider_trip_history.html
│   ├── rider_trip_receipt.html
│   ├── safety_toolkit_overlay.html
│   ├── send_money.html
│   ├── sign_in_register_enhanced_flow_2.html
│   ├── support_chat_interface.html
│   ├── track_delivery.html
│   ├── trip_completed_summary.html
│   └── welcome_to_hurriya_ride_enhanced.html
└── public/
    └── marketing_landing_page.html
```

Each screen uses this URL shape:

`/screens/<dashboard>/<screen-folder>.html`

The Vue route registry in `src/router/index.js` is the source of truth for labels, roles, dashboard ownership, and preview asset paths.
