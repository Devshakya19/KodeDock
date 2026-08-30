import re

with open('src/main.rs', 'r') as f:
    c = f.read()

# Inject the app data correctly
# Find App::new().wrap(cors)
c = c.replace(
    '        App::new()\n            .wrap(cors)',
    '        App::new()\n            .app_data(actix_web::web::Data::new(config.clone()))\n            .app_data(actix_web::web::Data::new(config.jwt_secret.clone()))\n            .app_data(actix_web::web::Data::new(redis_multiplexed.clone()))\n            .wrap(cors)'
)

# Wait, `redis_multiplexed` is not defined in `main.rs`!
# Because I didn't add the redis code back after reverting!
# Let's check if it exists:
