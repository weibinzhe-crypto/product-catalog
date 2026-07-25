let products = [];
let brand = '益肤';

fetch('/data/products.json').then(r => r.json()).then(data => {
    products = data;
    document.getElementById('loading').style.display = 'none';
    renderBrands();
    render();
});

document.getElementById('searchInput').oninput = render;

function renderBrands() {
    let order = ['益肤', '美卿', '绽妍', '诗漾'];
    let brands = order.filter(b => products.some(p => p.brand === b));
    document.getElementById('brandFilters').innerHTML =
        brands.map((b, i) => `<button class="brand-btn${i === 0 ? ' active' : ''}" onclick="setBrand('${b}',this)">${b}</button>`).join('') +
        '<button class="brand-btn" onclick="setBrand(\'all\',this)">全部</button>';
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
        let img = p.image ? `<img src="${p.image}" class="product-img" loading="lazy" onerror="this.style.display='none'">` : '';
        return `<div class="product-card">
            <div class="product-name">${p.name}</div>
            <div class="product-info">
                <div class="product-row"><span class="product-label">规格</span><span class="product-value">${p.spec}</span></div>
                <div class="product-row"><span class="product-label">箱规</span><span class="product-value">${p.boxSpec}</span></div>
            </div>
            <div class="product-price">¥${p.price}</div>
            <div class="product-barcode">${p.barcode||''}</div>
            ${img}
        </div>`;
    }).join('');
}
