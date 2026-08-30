import re

with open('src/main.rs', 'r') as f:
    c = f.read()

# Add config parsing and redis client
pattern = r'''    let config = config::AppConfig::from_env\(\);
    let database_url = config\.database_url\.clone\(\);'''
    
replacement = r'''    let config = config::AppConfig::from_env();
    let database_url = config.database_url.clone();
    
    // Initialize Redis Multiplexed Connection once
    let redis_client = redis::Client::open(config.redis_url.clone())
        .expect("Invalid Redis URL");
    let redis_multiplexed = redis_client
        .get_multiplexed_async_connection()
        .await
        .expect("Failed to connect to Redis");
    log::info!("Connected to Redis");'''

if 'redis_multiplexed' not in c:
    c = re.sub(pattern, replacement, c)

# Inject app_data
if 'redis_multiplexed.clone()' not in c:
    c = c.replace(
        '        App::new()\n            .wrap(cors)',
        '        App::new()\n            .app_data(actix_web::web::Data::new(config.clone()))\n            .app_data(actix_web::web::Data::new(config.jwt_secret.clone()))\n            .app_data(actix_web::web::Data::new(redis_multiplexed.clone()))\n            .wrap(cors)'
    )

with open('src/main.rs', 'w') as f:
    f.write(c)
