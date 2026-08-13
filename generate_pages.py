import json, os, shutil

os.makedirs('products', exist_ok=True)
os.makedirs('deploy/products', exist_ok=True)

with open('src/data/models.json', 'r', encoding='utf-8') as f:
    models = json.load(f)

with open('product.html', 'r', encoding='utf-8') as f:
    product_template = f.read()

# Fix relative paths for pages located in products/ subfolder
products_template = product_template.replace(
    'href="./src/css/style.css"',
    'href="../src/css/style.css"'
).replace(
    'href="./index.html',
    'href="../index.html'
).replace(
    'src="./src/js/',
    'src="../src/js/'
)

for m in models:
    filename = os.path.join('products', f"{m['id']}.html")
    custom_html = products_template.replace(
        '<script src="../src/js/product.js?v=2"></script>',
        f'<script>window.FORCE_MODEL_ID = "{m["id"]}";</script>\n  <script src="../src/js/product.js?v=2"></script>'
    )
    with open(filename, 'w', encoding='utf-8') as out:
        out.write(custom_html)
    
    # Copy to deploy/products/
    shutil.copy(filename, os.path.join('deploy', 'products'))
    print(f'Generated products/{m["id"]}.html')

print('All 8 product pages successfully generated inside products/ folder!')
