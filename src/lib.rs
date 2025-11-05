use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use serde::{Deserialize, Serialize};
use serde_json::{self, Value};
use std::collections::HashMap;

// 插件输入数据结构（来自适配器的包装）
#[derive(Deserialize)]
struct PluginInput {
    method: String,
    params: Value,
    #[allow(dead_code)]
    settings: HashMap<String, Value>,
}

// 加法参数结构
#[derive(Deserialize)]
struct AddParams {
    a: i32,
    b: i32,
}

// 加法结果结构
#[derive(Serialize)]
struct AddResult {
    sum: i32,
}

// 系统信息结构
#[derive(Serialize)]
struct SystemInfo {
    os: String,
    arch: String,
    plugin_version: String,
}

// 统一的入口函数
#[no_mangle]
pub unsafe extern "C" fn call(_method_name_ptr: *const c_char, payload_ptr: *const c_char) -> *mut c_char {
    let payload = CStr::from_ptr(payload_ptr).to_str().unwrap_or("");

    let result_str = match serde_json::from_str::<PluginInput>(payload) {
        Ok(input) => {
            // 根据方法名分发处理
            match input.method.as_str() {
                "add" => {
                    match serde_json::from_value::<AddParams>(input.params) {
                        Ok(params) => {
                            let result = AddResult { sum: params.a + params.b };
                            serde_json::to_string(&result).unwrap_or_else(|e| format!("{{\"error\":\"{}\"}}", e))
                        }
                        Err(e) => format!("{{\"error\":\"Invalid params for add: {}\"}}", e),
                    }
                }
                "getSystemInfo" => {
                    let info = SystemInfo {
                        os: std::env::consts::OS.to_string(),
                        arch: std::env::consts::ARCH.to_string(),
                        plugin_version: "1.0.0".to_string(),
                    };
                    serde_json::to_string(&info).unwrap_or_else(|e| format!("{{\"error\":\"{}\"}}", e))
                }
                _ => format!("{{\"error\":\"Method '{}' not found\"}}", input.method),
            }
        }
        Err(e) => format!("{{\"error\":\"Invalid input format: {}\"}}", e),
    };

    CString::new(result_str).unwrap().into_raw()
}

// 内存释放函数，由 Rust 后端调用
#[no_mangle]
pub unsafe extern "C" fn free_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        let _ = CString::from_raw(ptr);
    }
}