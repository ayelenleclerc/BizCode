#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[derive(serde::Serialize)]
pub struct Response<T> {
  success: bool,
  data: Option<T>,
  error: Option<String>,
}

// Placeholder commands - will be expanded
#[tauri::command]
async fn ping() -> Result<String, String> {
  Ok("Pong! Backend ready.".to_string())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![ping])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
