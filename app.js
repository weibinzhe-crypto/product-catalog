// 产品数据
let products = [];
let filteredProducts = [];
let currentBrand = 'all';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

// 加载产品数据
async function loadProducts() {
    showLoading(true);

    try {
        // 优先从飞书 API 加载数据
        let response;
        try {
            response = await fetch('/api/products');
            if (!response.ok) throw new Error('API not available');
        } catch (apiError) {
            // API 不可用时，使用本地 JSON 文件（开发环境）
            console.log('API 不可用，使用本地数据');
            response = await fetch('/data/products.json');
            if (!response.ok) {
                throw new Error('Failed to load products');
            }
        }

        products = await response.json();
        filteredProducts = [...products];

        // 更新产品数量
        document.getElementById('productCount').textContent = products.length;

        renderBrandFilters();
        renderProducts();
    } catch (error) {
        console.error('加载产品数据失败:', error);
        showNoData(true);
    } finally {
        showLoading(false);
    }
}

// 设置事件监听
function setupEventListeners() {
    // 搜索输入框回车
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 实时搜索
    document.getElementById('searchInput').addEventListener('input', function() {
        handleSearch();
    });
}

// 处理搜索
function handleSearch() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!keyword) {
        filteredProducts = currentBrand === 'all'
            ? [...products]
            : products.filter(p => p.brand === currentBrand);
    } else {
        filteredProducts = products.filter(p => {
            const matchesKeyword = p.name.toLowerCase().includes(keyword) ||
                                  (p.barcode && p.barcode.includes(keyword));
            const matchesBrand = currentBrand === 'all' || p.brand === currentBrand;
            return matchesKeyword && matchesBrand;
        });
    }

    // 更新产品数量
    document.getElementById('productCount').textContent = filteredProducts.length;

    renderProducts();
}

// 渲染品牌筛选按钮
function renderBrandFilters() {
    const brands = [...new Set(products.map(p => p.brand).filter(b => b))];
    const container = document.getElementById('brandFilters');

    // 全部按钮
    let html = `<button class="brand-btn active" data-brand="all">全部</button>`;

    // 品牌按钮
    brands.forEach(brand => {
        html += `<button class="brand-btn" data-brand="${brand}">${brand}</button>`;
    });

    container.innerHTML = html;

    // 添加点击事件
    container.querySelectorAll('.brand-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新选中状态
            container.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 更新当前品牌
            currentBrand = this.dataset.brand;

            // 重新搜索
            handleSearch();
        });
    });
}

// 渲染产品列表
function renderProducts() {
    const grid = document.getElementById('productGrid');
    const noData = document.getElementById('noData');

    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        noData.style.display = 'block';
        return;
    }

    noData.style.display = 'none';

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            ${product.image && !product.image.startsWith('=DISPIMG')
                ? `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div class="placeholder-image" style="display:none;">暂无图片</div>`
                : `<div class="placeholder-image">暂无图片</div>`
            }
            <div class="product-info">
                ${product.brand ? `<span class="product-brand">${product.brand}</span>` : ''}
                <h3 class="product-name">${product.name}</h3>
                <p class="product-spec">${product.spec} | ${product.boxSpec}</p>
                <div class="product-prices">
                    <div class="price-item">
                        <div class="price-label">零售价</div>
                        <div class="price-value retail">¥${product.retailPrice}</div>
                    </div>
                    <div class="price-item">
                        <div class="price-label">代发价</div>
                        <div class="price-value wholesale">¥${product.price}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 显示/隐藏加载状态
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// 显示/隐藏无数据提示
function showNoData(show) {
    document.getElementById('noData').style.display = show ? 'block' : 'none';
}
