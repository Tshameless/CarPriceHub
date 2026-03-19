// ── WebSocket Handler (Real-time Price Updates) ──────────────────
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
};
use carpricehub_shared::{WsMessage, Uuid};
use futures::{sink::SinkExt, stream::StreamExt};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

type Subscriptions = Arc<RwLock<HashMap<Uuid, Vec<Uuid>>>>; // car_id -> client_ids

pub async fn ws_handler(
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    // Client ID (simplified: use random UUID)
    let client_id = Uuid::new_v4();
    let subscriptions: Subscriptions = Arc::new(RwLock::new(HashMap::new()));

    // Spawn price update simulation task (in production, listen to Redis/DB events)
    tokio::spawn(simulate_price_updates(subscriptions.clone()));

    while let Some(result) = socket.next().await {
        match result {
            Ok(msg) => {
                match msg {
                    Message::Text(text) => {
                        if let Ok(ws_msg) = serde_json::from_str::<WsMessage>(&text) {
                            handle_client_message(&mut socket, &subscriptions, client_id, ws_msg).await;
                        }
                    }
                    Message::Close(_) => {
                        break;
                    }
                    _ => {}
                }
            }
            Err(_) => break,
        }
    }

    // Cleanup subscriptions
    let mut subs = subscriptions.write().await;
    subs.values_mut().for_each(|clients| clients.retain(|&id| id != client_id));
}

async fn handle_client_message(
    _socket: &mut WebSocket,
    subscriptions: &Subscriptions,
    client_id: Uuid,
    msg: WsMessage,
) {
    match msg {
        WsMessage::Subscribe { car_ids } => {
            let mut subs = subscriptions.write().await;
            for car_id in car_ids {
                subs.entry(car_id)
                    .or_insert_with(Vec::new)
                    .push(client_id);
            }
        }
        WsMessage::Unsubscribe { car_ids } => {
            let mut subs = subscriptions.write().await;
            for car_id in car_ids {
                if let Some(clients) = subs.get_mut(&car_id) {
                    clients.retain(|&id| id != client_id);
                }
            }
        }
        _ => {}
    }
}

// Simulated price updates (replace with real DB event listener in production)
async fn simulate_price_updates(subscriptions: Subscriptions) {
    use tokio::time::{interval, Duration};

    let mut ticker = interval(Duration::from_secs(30));
    ticker.tick().await; // Skip first

    loop {
        ticker.tick().await;

        // Get random subscribed car
        let _car_id = {
            let subs = subscriptions.read().await;
            if subs.is_empty() {
                continue;
            }
            *subs.keys().next().unwrap()
        };

        // Simulate price change (simplified - no actual broadcast)
        // In production, maintain a client_id -> socket map and send updates
    }
}
