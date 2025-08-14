use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordActivity {
    pub details: Option<String>,
    pub state: Option<String>,
    pub large_image: Option<String>,
    pub large_text: Option<String>,
    pub small_image: Option<String>,
    pub small_text: Option<String>,
    pub start_timestamp: Option<i64>,
    pub buttons: Option<Vec<ActivityButton>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActivityButton {
    pub label: String,
    pub url: String,
}

pub struct DiscordRpcState {
    pub client: Mutex<Option<DiscordIpcClient>>,
}

impl DiscordRpcState {
    pub fn new() -> Self {
        Self {
            client: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub async fn discord_rpc_init(
    client_id: String,
    state: State<'_, Arc<DiscordRpcState>>,
) -> Result<(), String> {
    println!("Initializing Discord RPC with client ID: {}", client_id);

    let mut client_guard = state.client.lock().map_err(|e| e.to_string())?;
    let mut client = DiscordIpcClient::new(&client_id).map_err(|e| e.to_string())?;
    client.connect().map_err(|e| e.to_string())?;

    *client_guard = Some(client);

    println!("Discord RPC initialized successfully");
    Ok(())
}

#[tauri::command]
pub async fn discord_rpc_set_activity(
    activity: DiscordActivity,
    state: State<'_, Arc<DiscordRpcState>>,
) -> Result<(), String> {
    let mut guard = state.client.lock().map_err(|e| e.to_string())?;
    let client = guard.as_mut().ok_or("Discord RPC client not initialized")?;

    let mut discord_activity = activity::Activity::new();

    if let Some(ref details) = activity.details {
        discord_activity = discord_activity.details(details);
    }

    if let Some(ref state_text) = activity.state {
        discord_activity = discord_activity.state(state_text);
    }

    if let Some(ref large_image) = activity.large_image {
        let mut assets = activity::Assets::new();
        assets = assets.large_image(large_image);

        if let Some(ref large_text) = activity.large_text {
            assets = assets.large_text(large_text);
        }

        if let Some(ref small_image) = activity.small_image {
            assets = assets.small_image(small_image);

            if let Some(ref small_text) = activity.small_text {
                assets = assets.small_text(small_text);
            }
        }

        discord_activity = discord_activity.assets(assets);
    }

    if let Some(start_timestamp) = activity.start_timestamp {
        let timestamps = activity::Timestamps::new().start(start_timestamp);
        discord_activity = discord_activity.timestamps(timestamps);
    }

    if let Some(ref buttons) = activity.buttons {
        let discord_buttons: Vec<activity::Button> = buttons
            .iter()
            .map(|b| activity::Button::new(&b.label, &b.url))
            .collect();
        discord_activity = discord_activity.buttons(discord_buttons);
    }

    client.set_activity(discord_activity).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn discord_rpc_clear_activity(
    state: State<'_, Arc<DiscordRpcState>>,
) -> Result<(), String> {
    let mut guard = state.client.lock().map_err(|e| e.to_string())?;
    let client = guard.as_mut().ok_or("Discord RPC client not initialized")?;

    client.clear_activity().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn discord_rpc_disconnect(
    state: State<'_, Arc<DiscordRpcState>>,
) -> Result<(), String> {
    let mut guard = state.client.lock().map_err(|e| e.to_string())?;

    if let Some(client) = guard.as_mut() {
        client.close().map_err(|e| e.to_string())?;
    }

    *guard = None;
    Ok(())
}