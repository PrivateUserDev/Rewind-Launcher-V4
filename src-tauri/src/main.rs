
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use sysinfo::Pid;
use tauri::Manager;
use tauri::Emitter;
use regex::Regex;
use reqwest;
use urlencoding;
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;
use std::fs::File;
use std::io::{self, Read, Seek, SeekFrom, Write};
use std::path::Path;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use std::sync::Mutex;

mod discord_rpc;
use discord_rpc::{DiscordRpcState, discord_rpc_init, discord_rpc_set_activity, discord_rpc_clear_activity, discord_rpc_disconnect};
use std::collections::HashMap;
use std::process::{exit};

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
struct StoredToken {
    token: String,
    stored_at: u64,
}

#[derive(Debug, serde::Deserialize, Clone)]
struct RoleInfo {
    name: String,
    #[serde(deserialize_with = "color_to_hex_string")]
    color: String,
}

#[derive(Debug, serde::Deserialize, Clone)]
struct UserInfo {
    username: String,
    #[serde(rename = "accountId")]
    account_id: String,
    email: String,
    password: String,
    #[serde(rename = "avatar_url")]
    avatar_url: String,
    #[serde(rename = "favoriteSkin")]
    favorite_skin: String,
    #[serde(rename = "MtxCurrency", default)]
    mtx_currency: String,
    #[serde(rename = "hype", default)]
    hype: String,
    role: RoleInfo,
    token_info: TokenInfo
}

use std::{sync::{Arc}, process::Command};
use std::sync::atomic::{AtomicU32, Ordering};

#[derive(Debug, serde::Deserialize, Clone)]
struct TokenInfo {
    expired: bool,
}

#[derive(Debug, Serialize)]
struct Event {
    id: i32,
    name: String,
    card_name: String,
    thumbnail: String,
    event_background: String,
    event_description: String,
    button_text: String,
    button_redirect_url: String,
    button_color: String,
    button_text_color: String,
    active: bool,
    audio_url: Option<String>,
    frame_text: String,
    ButtonIco: Option<String>,
    IcoColor: Option<String>,
}

#[derive(Default)]
struct AppState {
    auth_code: Mutex<Option<String>>,
    login_data: Mutex<Option<UserInfo>>,
}

static CURRENT_GAME_PID: AtomicU32 = AtomicU32::new(0);
static LAUNCHER_PID: AtomicU32 = AtomicU32::new(0);
static EAC_PID: AtomicU32 = AtomicU32::new(0);

fn get_app_state() -> Arc<Mutex<AppState>> {
    Arc::new(Mutex::new(AppState::default()))
}

async fn decode_launcher_token(token: &str) -> Result<UserInfo, Box<dyn std::error::Error>> {
    Ok(user_info)
}

#[tauri::command]
async fn fetch_events() -> Result<Vec<Event>, String> {
    
}

fn get_token_path(app_handle: &tauri::AppHandle) -> PathBuf {

}

fn store_token(token: &str, app_handle: &tauri::AppHandle) -> Result<(), String> {
    
}

fn get_stored_token(app_handle: &tauri::AppHandle) -> Option<String> {
    
}

#[tauri::command]
fn clear_stored_token(app_handle: tauri::AppHandle) -> Result<(), String> {
    
}

#[tauri::command]
async fn check_stored_token(app_handle: tauri::AppHandle) -> Result<serde_json::Value, String> {
    
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct VersionCheckResponse {
    #[serde(rename = "type")]
    update_type: String,
    message: String,
    #[serde(default)]
    version: Option<String>,
    #[serde(default)]
    download_url: Option<String>,
}

const CURRENT_VERSION: &str = "0.0.15";

#[tauri::command]
async fn check_version() -> Result<VersionCheckResponse, String> {

}

#[tauri::command]
async fn download_and_install_update(download_url: String, app_handle: tauri::AppHandle) -> Result<(), String> {

    let temp_dir = std::env::temp_dir();
    let file_name = match download_url.split('/').last() {
        Some(name) => name,
        None => return Err("Could not extract filename".to_string())
    };
    
    let download_path = temp_dir.join(file_name);

    let client = reqwest::Client::new();
    let response = client.get(&download_url)
        .send()
        .await
        .map_err(|e| format!("Failed to download update: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("Failed to download update,: {}", response.status()));
    }

    let mut file = File::create(&download_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;
    
    let content = response.bytes()
        .await
        .map_err(|e| format!("Failed to get response: {}", e))?;
    
    file.write_all(&content)
        .map_err(|e| format!("Failed to write to file: {}", e))?;

    let path_str = download_path.to_string_lossy().to_string();
    
    let batch_path = temp_dir.join("update.bat");
    
    let batch_content = format!(
        "@echo off\n\
         timeout /t 1 /nobreak >nul\n\
         start \"\" \"{}\"\n\
         (goto) 2>nul & del \"%~f0\"",
        path_str.replace("\\", "\\\\")
    );
    
    fs::write(&batch_path, batch_content)
        .map_err(|e| format!("Failed to create bat file: {}", e))?;
    
    let _child = std::process::Command::new("cmd")
        .args(["/C", batch_path.to_string_lossy().as_ref()])
        .spawn()
        .map_err(|e| format!("Failed to execute bat file: {}", e))?;

    app_handle.exit(0);
    
    Ok(())
}

#[derive(Serialize)]
struct VersionInfo {
    version: String,
    technical_version: String,
    splash_image: String,
}

#[tauri::command]
async fn detect_fortnite_version(path: String) -> Result<VersionInfo, String> {
    let exe_path = Path::new(&path).join("FortniteGame/Binaries/Win64/FortniteClient-Win64-Shipping.exe");
    let splash_path = Path::new(&path).join("FortniteGame/Content/Splash/Splash.bmp");

    if !exe_path.exists() {
        return Err("FortniteClient-Win64-Shipping.exe Not Found!!".to_string());
    }

    if !splash_path.exists() {
        return Err("Splash.bmp Not found!!".to_string());
    }

    let mut file = File::open(&exe_path).map_err(|e| e.to_string())?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;

    let image_data = tokio::fs::read(&splash_path)
        .await
        .map_err(|e| e.to_string())?;
    let base64_string = BASE64.encode(image_data);
    let splash_image = format!("data:image/bmp;base64,{}", base64_string);

    let pattern = "++Fortnite+Release-";
    let pattern_bytes: Vec<u16> = pattern.encode_utf16().collect();
    let pattern_raw: Vec<u8> = pattern_bytes.iter()
        .flat_map(|&x| x.to_le_bytes())
        .collect();

    let mut indices = Vec::new();
    for (i, window) in buffer.windows(pattern_raw.len()).enumerate() {
        if window == pattern_raw {
            indices.push(i);
        }
    }

    for &index in &indices {
        file.seek(SeekFrom::Start(index as u64)).map_err(|e| e.to_string())?;
        let mut version_buffer = vec![0u8; 200];
        file.read(&mut version_buffer).map_err(|e| e.to_string())?;

        let version_str = String::from_utf16_lossy(
            &version_buffer.chunks(2)
                .map(|chunk| u16::from_le_bytes([chunk[0], chunk[1]]))
                .collect::<Vec<u16>>()
        );

        let re = Regex::new(r"\+\+Fortnite\+Release-(\d{1,2}\.\d{1,2}|Live|Next|Cert)-CL-(\d+)")
            .map_err(|e| e.to_string())?;

        if let Some(captures) = re.captures(&version_str) {
            let version_num = captures.get(1).map_or("Unknown", |m| m.as_str());
            let cl_num = captures.get(2).map_or("Unknown", |m| m.as_str());
            
           
            let version = format!("{} (CL-{})", version_num, cl_num);
            
       
            let technical_version = format!("{}.0-CL-{}", version_num, cl_num);

            return Ok(VersionInfo {
                version,
                technical_version,
                splash_image,
            });
        }
    }

    Err("Version not found".to_string())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StoredVersion {
    path: String,
    version: String,
    technical_version: String,
    splash_image: String,
}

#[derive(Debug, Serialize)]
struct Version {
    path: String,
    version: String,
    technical_version: String,
    splash_image: String,
    access_type: String,
    build_name: String,
}

struct VersionState(Mutex<HashMap<String, StoredVersion>>);

fn get_versions_file_path(app_handle: &tauri::AppHandle) -> PathBuf {
    app_handle
        .path()
        .app_data_dir()
        .unwrap()
        .join("versions.json")
}

fn load_versions(app_handle: &tauri::AppHandle) -> HashMap<String, StoredVersion> {
    let path = get_versions_file_path(app_handle);
    if path.exists() {
        if let Ok(content) = fs::read_to_string(path) {
            if let Ok(versions) = serde_json::from_str(&content) {
                return versions;
            }
        }
    }
    HashMap::new()
}

fn save_versions(versions: &HashMap<String, StoredVersion>, app_handle: &tauri::AppHandle) -> Result<(), String> {
    let path = get_versions_file_path(app_handle);
    
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    let content = serde_json::to_string_pretty(versions)
        .map_err(|e| e.to_string())?;
    
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn add_version(
    path: String,
    state: tauri::State<'_, VersionState>,
    app_handle: tauri::AppHandle,
) -> Result<Vec<Version>, String> {
    let version_info = detect_fortnite_version(path.clone()).await?;
    

    {
        let mut versions = state.0.lock().unwrap();
        versions.insert(path.clone(), StoredVersion {
            path,
            version: version_info.version,
            technical_version: version_info.technical_version,
            splash_image: version_info.splash_image,
        });
        
        save_versions(&versions, &app_handle)?;
    } 


    get_versions_with_status(state).await
}

#[tauri::command]
async fn get_versions(
    state: tauri::State<'_, VersionState>,
) -> Result<Vec<StoredVersion>, String> {
    let versions = state.0.lock().unwrap();
    Ok(versions.values().cloned().collect())
}

#[tauri::command]
async fn remove_version(
    path: String,
    delete_files: bool,
    state: tauri::State<'_, VersionState>,
    app_handle: tauri::AppHandle,
) -> Result<Vec<Version>, String> {

    {
        let mut versions = state.0.lock().unwrap();
        versions.remove(&path);
        save_versions(&versions, &app_handle)?;
    }

    if delete_files {
        let path_obj = Path::new(&path);
        
        if let Some(parent) = path_obj.parent() {
            match fs::remove_dir_all(parent) {
                Ok(_) => (),
                Err(e) => {
                    println!("Failed to delete parent directory {}: {}", parent.display(), e);
                    return Err(format!("Failed to delete directory: {}", e));
                }
            }
        } else {
            return Err("Could not determine parent directory".to_string());
        }
    }

    get_versions_with_status(state).await
}

#[derive(Debug, Serialize, Deserialize)]
struct Build {
    build: String,
    name: String,
    #[serde(rename = "accessType")]
    access_type: String,
    season_number: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct BuildsResponse {
    builds: Vec<Build>,
}

#[derive(Debug, Serialize)]
struct VersionWithStatus {
    path: String,
    version: String,
    technical_version: String,
    splash_image: String,
    access_type: String,
    build_name: String,
}

#[tauri::command]
async fn fetch_builds() -> Result<BuildsResponse, String> {
    
}

#[tauri::command]
async fn get_versions_with_status(state: tauri::State<'_, VersionState>) -> Result<Vec<Version>, String> {

    let (stored_versions, builds) = tokio::join!(
        async {
            let versions = state.0.lock().unwrap();
            versions.values().cloned().collect::<Vec<StoredVersion>>()
        },
        fetch_builds()
    );

    let builds = builds?;
    
    let builds_map: HashMap<String, &Build> = builds.builds
        .iter()
        .map(|b| {
            let version = b.name.trim_start_matches("Fortnite ").to_string();
            (version, b)
        })
        .collect();

    let versions_with_status: Vec<Version> = stored_versions.into_iter().map(|v| {
        let version_number = v.version
            .split(" (CL-")
            .next()
            .unwrap_or(&v.version)
            .to_string();

        let matching_build = builds_map.get(&version_number);

        Version {
            path: v.path,
            version: v.version,
            technical_version: v.technical_version,
            splash_image: v.splash_image,
            access_type: matching_build
                .map(|b| b.access_type.clone())
                .unwrap_or_else(|| "unknown".to_string()),
            build_name: matching_build
                .map(|b| b.name.clone())
                .unwrap_or_else(|| format!("Fortnite {}", version_number)),
        }
    }).collect();

    Ok(versions_with_status)
}

use tauri::command;

use tokio::process::Command as TokioCommand;
use tokio::io::{self as tokio_io, AsyncBufReadExt, BufReader};

use winapi::um::processthreadsapi::{CreateProcessW, ResumeThread, SuspendThread};
use winapi::um::winbase::{CREATE_SUSPENDED};
use winapi::um::handleapi::CloseHandle;
use winapi::um::winnt::{PROCESS_ALL_ACCESS};
use reqwest::Client;
use sysinfo::{System};
use tokio::time::{sleep, Duration};

#[tauri::command]
async fn version_card_clicked(path: String, email: String, password: String, version: String) -> Result<(), String> {
    
}

fn str_to_wide(path: &str) -> Vec<u16> {
    let mut wide_path: Vec<u16> = path.encode_utf16().collect();
    wide_path.push(0);
    wide_path
}

fn launch_and_suspend(path: &str) -> Result<u32, String> {

}

async fn download_dll(url: &str, path: &str) -> Result<(), String> {
    
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct ServerStatus {
    #[serde(rename = "isServerReady")]
    is_server_ready: bool,
}

#[tauri::command]
async fn check_server_status() -> Result<ServerStatus, String> {
   
}

#[derive(Debug, Serialize, Deserialize)]
struct ServerStats {
    #[serde(rename = "server_count")]
    servers: i32,
    #[serde(rename = "player_count")]
    players: i32,
}

fn get_stats_file_path() -> PathBuf {
    let mut path = std::env::temp_dir();
    path.push("server_stats.json");
    path
}

#[tauri::command]
async fn fetch_server_stats() -> Result<ServerStats, String> {
    let client = reqwest::Client::new();
    let url = "your_server_url";
    
    match client.get(url).send().await {
        Ok(response) => {
            if !response.status().is_success() {
                return Err(format!("API returned error status: {}", response.status()));
            }
            
            match response.json::<ServerStats>().await {
                Ok(stats) => {
           
                    let stats_path = get_stats_file_path();
                    if let Ok(stats_json) = serde_json::to_string(&stats) {
                        let _ = std::fs::write(stats_path, stats_json);
                    }
                    Ok(stats)
                },
                Err(e) => Err(format!("Failed to parse server stats: {}", e))
            }
        },
        Err(e) => Err(format!("Could not fetch server stats: {}", e))
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct ShopItem {
    id: i32,
    cosmeticId: String,
    name: String,
    price: i32,
    featuredIcon: String,
    icon: String,
    rarity: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ShopData {
    featured: Vec<ShopItem>,
    daily: Vec<ShopItem>,
    custom_sections: std::collections::HashMap<String, Vec<ShopItem>>,
    expiration: Option<String>,
}

fn get_shop_cache_path() -> PathBuf {
    let mut path = std::env::temp_dir();
    path.push("shop_data.json");
    path
}

#[tauri::command]
async fn fetch_shop_items() -> Result<ShopData, String> {
    let client = reqwest::Client::new();
    let catalog_url = "your_catalog_url";
    
    let response = match client.get(catalog_url).send().await {
        Ok(resp) => resp,
        Err(e) => return Err(format!("Failed to fetch catalog: {}", e)),
    };
    
    if !response.status().is_success() {
        return Err(format!("API returned error status: {}", response.status()));
    }
    
    let catalog_data: serde_json::Value = match response.json().await {
        Ok(data) => data,
        Err(e) => return Err(format!("Failed to parse catalog data: {}", e)),
    };
    
    let storefronts_value = match catalog_data.get("storefronts") {
        Some(sf) => sf,
        None => return Err("No storefronts found in response".to_string()),
    };
    
    let storefronts = match storefronts_value.as_array() {
        Some(arr) => arr,
        None => return Err("Storefronts is not an array".to_string()),
    };
    
    let mut organized_items = ShopData {
        featured: Vec::new(),
        daily: Vec::new(),
        custom_sections: std::collections::HashMap::new(),
        expiration: None,
    };

    if let Some(expiration_value) = catalog_data.get("expiration") {
        if let Some(expiration_str) = expiration_value.as_str() {
            organized_items.expiration = Some(expiration_str.to_string());
        }
    }
    
    let mut featured_counter = 1;
    let mut daily_counter = 1;
    let mut custom_counters: std::collections::HashMap<String, i32> = std::collections::HashMap::new();

    let mut custom_sections_list: Vec<String> = Vec::new();
    if let Some(custom_sections_value) = catalog_data.get("custom_sections") {
        if let Some(custom_sections_array) = custom_sections_value.as_array() {
            for section in custom_sections_array {
                if let Some(section_name) = section.as_str() {
                    if section_name != "Featured Items" && section_name != "Daily Items" {
                        custom_sections_list.push(section_name.to_string());
                        custom_counters.insert(section_name.to_string(), 1);
                        organized_items.custom_sections.insert(section_name.to_string(), Vec::new());
                    }
                }
            }
        }
    }

    let names_to_fetch = vec!["BRDailyStorefront", "BRWeeklyStorefront"];

    for name in names_to_fetch {
        let store_opt = storefronts.iter().find(|s| {
            let name_value = s.get("name");
            if let Some(name_val) = name_value {
                if let Some(n) = name_val.as_str() {
                    return n == name;
                }
            }
            false
        });

        let store = match store_opt {
            Some(s) => s,
            None => continue,
        };

        let entries_value = match store.get("catalogEntries") {
            Some(e) => e,
            None => continue,
        };

        let entries = match entries_value.as_array() {
            Some(e) => e,
            None => continue,
        };

        for entry in entries {
            let item_grants_value = match entry.get("itemGrants") {
                Some(ig) => ig,
                None => continue,
            };
            
            let item_grants = match item_grants_value.as_array() {
                Some(ig) => ig,
                None => continue,
            };
            
            if item_grants.is_empty() {
                continue;
            }

            let prices_value = match entry.get("prices") {
                Some(p) => p,
                None => continue,
            };
            
            let prices = match prices_value.as_array() {
                Some(p) => p,
                None => continue,
            };
            
            if prices.is_empty() {
                continue;
            }

            let template_id_value = match item_grants[0].get("templateId") {
                Some(tid) => tid,
                None => continue,
            };
            
            let template_id = match template_id_value.as_str() {
                Some(tid) => tid,
                None => continue,
            };
            
            let parts: Vec<&str> = template_id.split(':').collect();
            if parts.len() < 2 {
                continue;
            }
            
            let cosmetic_id = parts[1];
            
            let (rarity, item_name) = match fetch_item_details(&client, cosmetic_id).await {
                Ok((r, n)) => (r, n),
                Err(_) => ("unknown".to_string(), cosmetic_id.to_string()),
            };

            let price_value = match prices[0].get("finalPrice") {
                Some(p) => p,
                None => continue,
            };
            
            let price = match price_value.as_i64() {
                Some(p) => p as i32,
                None => 0,
            };

            let meta_value = entry.get("meta");
            let section_id = if let Some(meta) = meta_value {
                if let Some(section_id_value) = meta.get("SectionId") {
                    if let Some(section_id_str) = section_id_value.as_str() {
                        section_id_str
                    } else {
                        ""
                    }
                } else {
                    ""
                }
            } else {
                ""
            };
            
            let is_featured = section_id == "Featured" || section_id == "Featured Items";
            let is_daily = section_id == "Daily Items" || section_id.is_empty();
            let is_custom_section = custom_sections_list.contains(&section_id.to_string()) &&
                                  section_id != "Featured Items" &&
                                  section_id != "Daily Items" &&
                                  section_id != "Featured";

            let item_id = if is_featured {
                let id = featured_counter;
                featured_counter += 1;
                id
            } else if is_custom_section {
                let counter = custom_counters.get_mut(section_id).unwrap();
                let id = *counter;
                *counter += 1;
                id
            } else {
                let id = daily_counter;
                daily_counter += 1;
                id
            };

            let item = ShopItem {
                id: item_id,
                cosmeticId: cosmetic_id.to_string(),
                name: item_name,
                price,
                featuredIcon: format!("https://fortnite-api.com/images/cosmetics/br/{}/featured.png", cosmetic_id),
                icon: format!("https://fortnite-api.com/images/cosmetics/br/{}/icon.png", cosmetic_id),
                rarity,
            };

            if is_featured {
                organized_items.featured.push(item);
            } else if is_custom_section {
                if let Some(custom_section) = organized_items.custom_sections.get_mut(section_id) {
                    custom_section.push(item);
                }
            } else {
                organized_items.daily.push(item);
            }
        }
    }
    
    let shop_path = get_shop_cache_path();
    if let Ok(shop_json) = serde_json::to_string(&organized_items) {
        let _ = std::fs::write(shop_path, shop_json);
    }
    
    Ok(organized_items)
}

async fn fetch_item_details(client: &reqwest::Client, id: &str) -> Result<(String, String), String> {
    let url = format!("https://fortnite-api.com/v2/cosmetics/br/{}", id);
    
    let response = match client.get(&url).send().await {
        Ok(resp) => resp,
        Err(e) => return Err(format!("Failed to fetch item details: {}", e)),
    };
    
    if !response.status().is_success() {
        return Err(format!("API returned error status: {}", response.status()));
    }
    
    let data: serde_json::Value = match response.json().await {
        Ok(data) => data,
        Err(e) => return Err(format!("Failed to parse item details: {}", e)),
    };
    
    let rarity = data.get("data")
        .and_then(|d| d.get("rarity"))
        .and_then(|r| r.get("value"))
        .and_then(|b| b.as_str())
        .unwrap_or("unknown");
    
    let name = data.get("data")
        .and_then(|d| d.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(id);
    
    Ok((rarity.to_string(), name.to_string()))
}

#[tauri::command]
async fn stop_game_process() -> Result<(), String> {
    let main_pid = CURRENT_GAME_PID.load(Ordering::SeqCst);
    let launcher_pid = LAUNCHER_PID.load(Ordering::SeqCst);
    let eac_pid = EAC_PID.load(Ordering::SeqCst);

    if main_pid == 0 && launcher_pid == 0 && eac_pid == 0 {
        return Err("No game processes running".to_string());
    }

    let mut system = System::new();
    system.refresh_processes();

    let mut killed_any = false;

    if main_pid != 0 {
        if let Some(process) = system.process(Pid::from_u32(main_pid)) {
            if process.kill() {
                println!("Successfully terminated main game process with PID: {}", main_pid);
                killed_any = true;
            }
        }
        CURRENT_GAME_PID.store(0, Ordering::SeqCst);
    }

    if launcher_pid != 0 {
        if let Some(process) = system.process(Pid::from_u32(launcher_pid)) {
            if process.kill() {
                println!("Successfully terminated launcher process with PID: {}", launcher_pid);
                killed_any = true;
            }
        }
        LAUNCHER_PID.store(0, Ordering::SeqCst);
    }

    if eac_pid != 0 {
        if let Some(process) = system.process(Pid::from_u32(eac_pid)) {
            if process.kill() {
                println!("Successfully terminated EAC process with PID: {}", eac_pid);
                killed_any = true;
            }
        }
        EAC_PID.store(0, Ordering::SeqCst);
    }

    if killed_any {
        Ok(())
    } else {
        Err("Failed to terminate any game processes".to_string())
    }
}

#[tauri::command]
async fn is_game_running() -> Result<bool, String> {
    let main_pid = CURRENT_GAME_PID.load(Ordering::SeqCst);
    let launcher_pid = LAUNCHER_PID.load(Ordering::SeqCst);
    let eac_pid = EAC_PID.load(Ordering::SeqCst);

    if main_pid == 0 && launcher_pid == 0 && eac_pid == 0 {
        return Ok(false);
    }

    let mut system = System::new();
    system.refresh_processes();

    let mut any_running = false;

    if main_pid != 0 {
        if system.process(Pid::from_u32(main_pid)).is_some() {
            any_running = true;
        } else {
            CURRENT_GAME_PID.store(0, Ordering::SeqCst);
        }
    }

    if launcher_pid != 0 {
        if system.process(Pid::from_u32(launcher_pid)).is_some() {
            any_running = true;
        } else {
            LAUNCHER_PID.store(0, Ordering::SeqCst);
        }
    }
    if eac_pid != 0 {
        if system.process(Pid::from_u32(eac_pid)).is_some() {
            any_running = true;
        } else {
            EAC_PID.store(0, Ordering::SeqCst);
        }
    }

    Ok(any_running)
}

#[derive(Debug, serde::Deserialize, serde::Serialize, Clone)]
struct Session {
    started: bool,
    #[serde(rename = "ownerId")]
    owner_id: String,
    #[serde(rename = "publicPlayers")]
    public_players: Vec<String>,
    #[serde(rename = "sessionId")]
    session_id: String,
    #[serde(rename = "sessionName")]
    session_name: String,
}

#[tauri::command]
async fn fetch_sessions() -> Result<Vec<Session>, String> {
    let client = reqwest::Client::new();
    let url = "ur_sessions_url";
    
    match client.get(url).send().await {
        Ok(response) => {
            if !response.status().is_success() {
                return Err(format!("API returned error status: {}", response.status()));
            }
            
            match response.json::<Vec<Session>>().await {
                Ok(sessions) => Ok(sessions),
                Err(e) => Err(format!("Failed to parse sessions: {}", e))
            }
        },
        Err(e) => Err(format!("Could not fetch sessions: {}", e))
    }
}

fn main() {
    let versions_state = VersionState(Mutex::new(HashMap::new()));
    let discord_rpc_state = Arc::new(DiscordRpcState::new());

    tauri_plugin_deep_link::prepare("Rewind");
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(versions_state)
        .manage(discord_rpc_state.clone())
        .setup(|app| {
            let versions = load_versions(&app.handle());
            let state = app.state::<VersionState>();
            *state.0.lock().unwrap() = versions;
            
            let window = app.get_webview_window("main").unwrap();
            let app_handle = app.handle().clone();

            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    let stats_path = get_stats_file_path();
                    let _ = std::fs::remove_file(stats_path);
                    
                    let shop_path = get_shop_cache_path();
                    let _ = std::fs::remove_file(shop_path);
                }
            });
                
            if let Err(err) = tauri_plugin_deep_link::register("Rewind", move |request| {
                println!("Received request: {}", request);

                let re = Regex::new(r"(?i)rewindlauncher://auth/?[?]launcherToken=(.+)").unwrap();
                
                if let Some(captures) = re.captures(request.as_str()) {
                    if let Some(result) = captures.get(1) {
                        let token = urlencoding::decode(result.as_str())
                            .unwrap_or_else(|_| result.as_str().to_string().into())
                            .to_string();
                        println!("Received launcher token: {}", token);
                        

                        if let Err(e) = store_token(&token, &app_handle) {
                            println!("could not store token: {}", e);
                        }
                        
                        let window_clone = window.clone();
                        
                        tauri::async_runtime::spawn(async move {
                            window_clone.show().unwrap();
                            window_clone.set_focus().unwrap();

                            match decode_launcher_token(&token).await {
                                Ok(user_info) => {
                                    println!("usah info:");
                                    println!("Username: {}", user_info.username);
                                    println!("Email: {}", user_info.email);
                                    println!("Password: {}", user_info.password);
                                    println!("Account ID: {}", user_info.account_id);
                                    println!("Favorite skin: {}", user_info.favorite_skin);
                                    println!("Role name: {}", user_info.role.name);
                                    println!("Role color: {}", user_info.role.color);

                                    let payload = serde_json::json!({
                                        "username": user_info.username,
                                        "accountId": user_info.account_id,
                                        "email": user_info.email,
                                        "password": user_info.password,
                                        "avatar_url": user_info.avatar_url,
                                        "favoriteSkin": user_info.favorite_skin,
                                        "mtxCurrency": user_info.mtx_currency,
                                        "hype": user_info.hype,
                                        "role": {
                                            "name": user_info.role.name,
                                            "color": user_info.role.color
                                        }
                                    });
                                    
                                    window_clone.emit("login-success", payload).unwrap();
                                },
                                Err(e) => {
                                    println!("error decoding token: {}", e);
                                    window_clone.emit("login-error", "Token Authorization failed.").unwrap();
                                }
                            }
                        });
                    }
                } else {
                    println!("No matching regex found in request: {}", request);
                    println!("Expected format: rewindlauncher://auth?launcherToken=<token>");
                }
            }) {
                println!("Failed to register deep link handler: {}", err);
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_events,
            check_stored_token,
            clear_stored_token,
            check_version,
            detect_fortnite_version,
            add_version,
            get_versions,
            remove_version,
            fetch_builds,
            get_versions_with_status,
            version_card_clicked,
            check_server_status,
            fetch_server_stats,
            download_and_install_update,
            fetch_shop_items,
            fetch_sessions,
            stop_game_process,
            is_game_running,
            discord_rpc_init,
            discord_rpc_set_activity,
            discord_rpc_clear_activity,
            discord_rpc_disconnect
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn color_to_hex_string<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let color_int: i32 = serde::Deserialize::deserialize(deserializer)?;
    Ok(format!("#{:06X}", color_int as u32))
}
