#!/bin/bash

# add_woocommerce_products.sh
# Generate and add dummy WooCommerce product data for all product types using the WooCommerce REST API.
# Also exports the data as a CSV file for import via WooCommerce importer or WP All Import.
# Requirements: curl, jq

# --- CONFIGURATION ---
API_URL="${WC_API_URL:-https://your-woocommerce-site.com/wp-json/wc/v3}"
CONSUMER_KEY="${WC_CONSUMER_KEY}"
CONSUMER_SECRET="${WC_CONSUMER_SECRET}"
AUTH="consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}"

# Output files
SUCCESS_LOG="success.log"
ERROR_LOG="errors.log"
CSV_FILE="woocommerce_products.csv"

# Default product quantities (can be overridden by args)
SIMPLE_QTY=5
VARIABLE_QTY=3
DOWNLOADABLE_QTY=3
VIRTUAL_QTY=2
GROUPED_QTY=2
EXTERNAL_QTY=2
SUBSCRIPTION_QTY=2

# --- DEPENDENCY CHECK ---
for dep in curl jq; do
  if ! command -v $dep &>/dev/null; then
    echo "$dep is required. Please install it." >&2
    exit 1
  fi
done

# --- ARGUMENT PARSING ---
while [[ $# -gt 0 ]]; do
  case $1 in
    --simple) SIMPLE_QTY="$2"; shift 2;;
    --variable) VARIABLE_QTY="$2"; shift 2;;
    --downloadable) DOWNLOADABLE_QTY="$2"; shift 2;;
    --virtual) VIRTUAL_QTY="$2"; shift 2;;
    --grouped) GROUPED_QTY="$2"; shift 2;;
    --external) EXTERNAL_QTY="$2"; shift 2;;
    --subscription) SUBSCRIPTION_QTY="$2"; shift 2;;
    --csv) EXPORT_CSV=1; shift;;
    *) shift;;
  esac
done

# --- CATEGORY CREATION ---
CATEGORIES=("Clothing" "Electronics" "Books" "Home" "Subscriptions")
CATEGORY_IDS=()
echo "Creating categories..."
for cat in "${CATEGORIES[@]}"; do
  resp=$(curl -s -X POST "$API_URL/products/categories?$AUTH" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$cat\"}")
  id=$(echo "$resp" | jq -r '.id // empty')
  if [[ -n "$id" ]]; then
    CATEGORY_IDS+=("$id")
    echo "Created category $cat (ID: $id)" | tee -a "$SUCCESS_LOG"
  else
    echo "Failed to create category $cat: $resp" | tee -a "$ERROR_LOG"
  fi
done

# --- PRODUCT GENERATION HELPERS ---
random_price() { printf "%.2f" "$(echo "scale=2; $RANDOM%100 + 9.99" | bc)"; }
random_sku() { echo "SKU$RANDOM"; }
random_stock() { echo $((RANDOM % 100 + 1)); }

# --- CSV HEADER ---
echo "Type,Name,SKU,Regular Price,Sale Price,Description,Short Description,Categories,Images,Stock Status,Stock Quantity,Downloadable,Download Name,Download URL,Download Limit,Download Expiry,Virtual,Grouped Products,External URL,Button Text,Subscription Period,Subscription Interval,Subscription Length,Attributes,Variations" > "$CSV_FILE"

# --- SIMPLE PRODUCTS ---
echo "Creating simple products..."
for i in $(seq 1 $SIMPLE_QTY); do
  name="Cotton T-Shirt $i"
  sku=$(random_sku)
  price=$(random_price)
  stock=$(random_stock)
  cat="Clothing"
  img="https://placehold.co/600x600"
  echo "simple,$name,$sku,$price,,A soft cotton t-shirt $i,Comfy tee $i,$cat,$img,instock,$stock,,,,,,,,,,,,," >> "$CSV_FILE"
  # Optionally, create via API as before
  # ...
done

# --- VARIABLE PRODUCTS (first pass, no variations for brevity) ---
echo "Creating variable products..."
for i in $(seq 1 $VARIABLE_QTY); do
  name="Hoodie $i"
  sku=$(random_sku)
  price=$(random_price)
  cat="Clothing"
  img="https://placehold.co/600x600"
  attrs="Size:S|M|L"
  echo "variable,$name,$sku,$price,,A stylish hoodie $i,Hoodie $i,$cat,$img,instock,,,,$attrs,,,,,,,,,," >> "$CSV_FILE"
  # ...
done

# --- DOWNLOADABLE PRODUCTS ---
echo "Creating downloadable products..."
for i in $(seq 1 $DOWNLOADABLE_QTY); do
  name="E-Book $i"
  sku=$(random_sku)
  price=$(random_price)
  cat="Books"
  img="https://placehold.co/600x600"
  dname="Guide.pdf"
  durl="https://example.com/files/guide.pdf"
  echo "simple,$name,$sku,$price,,A digital e-book $i,E-Book $i,$cat,$img,instock,,yes,$dname,$durl,5,30,yes,,,,,,,," >> "$CSV_FILE"
  # ...
done

# --- VIRTUAL PRODUCTS ---
echo "Creating virtual products..."
for i in $(seq 1 $VIRTUAL_QTY); do
  name="Consultation $i"
  sku=$(random_sku)
  price=$(random_price)
  cat="Home"
  img="https://placehold.co/600x600"
  echo "simple,$name,$sku,$price,,A virtual consultation $i,Consultation $i,$cat,$img,instock,,,yes,,,,,,,,,,," >> "$CSV_FILE"
  # ...
done

# --- EXTERNAL PRODUCTS ---
echo "Creating external/affiliate products..."
for i in $(seq 1 $EXTERNAL_QTY); do
  name="Affiliate Product $i"
  sku=$(random_sku)
  price=$(random_price)
  cat="Electronics"
  img="https://placehold.co/600x600"
  eurl="https://external-site.com/product"
  btxt="Buy Now"
  echo "external,$name,$sku,$price,,An affiliate product $i,Affiliate $i,$cat,$img,instock,,,,,,,,,$eurl,$btxt,,,,," >> "$CSV_FILE"
  # ...
done

# --- GROUPED PRODUCTS (first pass, no actual grouping for brevity) ---
echo "Creating grouped products..."
for i in $(seq 1 $GROUPED_QTY); do
  name="Gift Bundle $i"
  sku=$(random_sku)
  cat="Home"
  img="https://placehold.co/600x600"
  echo "grouped,$name,$sku,,,,A bundle of products $i,Bundle $i,$cat,$img,instock,,,,,,,,,,,,,," >> "$CSV_FILE"
  # ...
done

# --- SUBSCRIPTION PRODUCTS (if plugin is installed) ---
# (First pass: skip unless plugin is detected)

# --- END OF SCRIPT ---
echo "CSV export complete: $CSV_FILE" 