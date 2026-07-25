let products = [];
let brand = 'all';

fetch('/api/products').then(r => r.json()).then(data => {
    products = data;
    document.getElementById('loading').style.display = 'none';
    renderBrands();
    render();
}).catch(() => {
    fetch('/data/products.json').then(r => r.json()).then(data => {
        products = data;
        document.getElementById('loading').style.display = 'none';
        renderBrands();
        render();
    });
});

document.getElementById('searchInput').oninput = render;

function renderBrands() {
    let brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    document.getElementById('brandFilters').innerHTML =
        '<button class="brand-btn active" onclick="setBrand(\'all\',this)">全部</button>' +
        brands.map(b => `<button class="brand-btn" onclick="setBrand('${b}',this)">${b}</button>`).join('');
}

function setBrand(b, el) {
    brand = b;
    document.querySelectorAll('.brand-btn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    render();
}

function render() {
    let kw = document.getElementById('searchInput').value.toLowerCase();
    let list = products.filter(p => {
        let match = brand === 'all' || p.brand === brand;
        if (kw) match = match && (p.name.toLowerCase().includes(kw) || (p.barcode && p.barcode.includes(kw)));
        return match;
    });
    document.getElementById('noData').style.display = list.length ? 'none' : 'block';
    document.getElementById('productGrid').innerHTML = list.map(p => {
        let imgHtml = '';
        if (p.image) {
            imgHtml = `<img src="/api/image?token=${p.image}" class="product-img" loading="lazy" onerror="this.style.display='none'">`;
        }
        return `
        <div class="product-card">
            ${imgHtml}
            <div class="product-brand">${p.brand || ''}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-spec">${p.spec} | ${p.boxSpec}</div>
            <div class="price-row">
                <span class="price-retail">¥${p.retailPrice}</span>
                <span class="price-wholesale">¥${p.price}</span>
            </div>
        </div>
    `}).join('');
}
