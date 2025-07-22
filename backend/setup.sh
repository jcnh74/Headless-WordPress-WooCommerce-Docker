#!/bin/bash
set -e


# Wait for database to be ready
until wp db check --allow-root --path=/var/www/html; do
  echo "Waiting for database to be ready for wp-cli..."
  sleep 2
done

# Ensure correct permissions
chown -R www-data:www-data /var/www/html/wp-content
chmod -R 755 /var/www/html/wp-content

# Install WordPress if not installed
if ! wp core is-installed --allow-root --path=/var/www/html; then
  wp core install \
    --url="http://${API_SITE_DOMAIN:-localhost:8080}" \
    --title="Headless WP" \
    --admin_user="admin" \
    --admin_password="admin" \
    --admin_email="admin@example.com" \
    --skip-email \
    --allow-root \
    --path=/var/www/html
  # Create additional default user
  wp user create editor editor@example.com \
    --role=editor \
    --user_pass=editor \
    --allow-root \
    --path=/var/www/html
fi

# Configure WordPress settings
wp option update home "http://${API_SITE_DOMAIN:-localhost:8080}" --allow-root --path=/var/www/html
wp option update siteurl "http://${API_SITE_DOMAIN:-localhost:8080}" --allow-root --path=/var/www/html
wp option delete rest_api_disabled --allow-root --path=/var/www/html || true
wp plugin deactivate disable-json-api --allow-root --path=/var/www/html || true
wp rewrite structure "/%year%/%monthnum%/%day%/%postname%/" --allow-root --path=/var/www/html
wp rewrite flush --hard --allow-root --path=/var/www/html



# Clone Slim Theme if not present
if [ ! -d "/var/www/html/wp-content/themes/slimtheme" ]; then
  git clone https://github.com/jcnh74/slimtheme.git /var/www/html/wp-content/themes/slimtheme
  chown -R www-data:www-data /var/www/html/wp-content/themes/slimtheme
fi

# Activate Slim Theme
wp theme activate slimtheme --allow-root --path=/var/www/html || echo "Failed to activate slimtheme"

# Activate all plugins in the plugins directory
for plugin in /var/www/html/wp-content/plugins/*; do
  if [ -d "$plugin" ]; then
    plugin_slug=$(basename "$plugin")
    wp plugin activate "$plugin_slug" --allow-root --path=/var/www/html || echo "Failed to activate $plugin_slug"
  fi
done

# --- WooCommerce Setup (First Pass) ---
# Activate WooCommerce plugin
# wp plugin activate woocommerce --allow-root --path=/var/www/html || echo "Failed to activate WooCommerce"

# Create WooCommerce pages (shop, cart, checkout, my account)
wp wc tool run install_pages --allow-root --path=/var/www/html || echo "Failed to create WooCommerce pages"

# Skip WooCommerce setup wizard
wp option update woocommerce_admin_install_timestamp $(date +%s) --allow-root --path=/var/www/html
wp option update woocommerce_onboarding_profile "{""skipped"":true}" --allow-root --path=/var/www/html


# Set WooCommerce store address and basic settings (generic details)
wp option update woocommerce_store_address "123 Main St" --allow-root --path=/var/www/html
wp option update woocommerce_store_address_2 "Suite 100" --allow-root --path=/var/www/html
wp option update woocommerce_store_city "Sample City" --allow-root --path=/var/www/html
wp option update woocommerce_default_country "US:CA" --allow-root --path=/var/www/html
wp option update woocommerce_store_postcode "90001" --allow-root --path=/var/www/html
wp option update woocommerce_currency "USD" --allow-root --path=/var/www/html
wp option update woocommerce_product_type "simple" --allow-root --path=/var/www/html

# Set WooCommerce as the front page (optional, can be changed later)
wp option update show_on_front "page" --allow-root --path=/var/www/html
wp option update page_on_front $(wp wc shop_page_id --allow-root --path=/var/www/html) --allow-root --path=/var/www/html

# Enable WooCommerce REST API (should be enabled by default)
wp option update woocommerce_api_enabled 1 --allow-root --path=/var/www/html

# Set correct ownership and permissions for uploads directory
chown -R www-data:www-data /var/www/html/wp-content/uploads
chmod -R 755 /var/www/html/wp-content/uploads
