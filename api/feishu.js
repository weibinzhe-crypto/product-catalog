// 飞书 API 配置
const FEISHU_CONFIG = {
    appId: process.env.FEISHU_APP_ID || "cli_aae9bfef7d3a1d12",
    appSecret: process.env.FEISHU_APP_SECRET || "99ypIswmLWb7DHMR5sSqEfVc5GkSHrWz",
    appToken: process.env.FEISHU_APP_TOKEN || "EvFFbSucaa1ZAQs7acbcrYfmnOh",
    tableId: process.env.FEISHU_TABLE_ID || "tbl2Culu8VKQacYt"
};

// 缓存 token
let tokenCache = {
    token: null,
    expire: 0
};

// 获取 tenant_access_token
async function getTenantAccessToken() {
    // 检查缓存是否有效
    if (tokenCache.token && Date.now() < tokenCache.expire) {
        return tokenCache.token;
    }

    const response = await fetch(
        "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                app_id: FEISHU_CONFIG.appId,
                app_secret: FEISHU_CONFIG.appSecret
            })
        }
    );

    const data = await response.json();
    if (data.code !== 0) {
        throw new Error(`获取 token 失败: ${data.msg}`);
    }

    // 缓存 token（提前 5 分钟过期）
    tokenCache.token = data.tenant_access_token;
    tokenCache.expire = Date.now() + (data.expire - 300) * 1000;

    return tokenCache.token;
}

// 获取多维表格记录
async function getRecords(pageSize = 100, pageToken = null) {
    const token = await getTenantAccessToken();

    let url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_CONFIG.appToken}/tables/${FEISHU_CONFIG.tableId}/records?page_size=${pageSize}`;
    if (pageToken) {
        url += `&page_token=${pageToken}`;
    }

    const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.code !== 0) {
        throw new Error(`获取记录失败: ${data.msg}`);
    }

    return data.data;
}

// 获取所有记录（分页）
async function getAllRecords() {
    const allRecords = [];
    let pageToken = null;
    let hasMore = true;

    while (hasMore) {
        const result = await getRecords(100, pageToken);
        allRecords.push(...result.items);
        hasMore = result.has_more;
        pageToken = result.page_token;
    }

    return allRecords;
}

// 转换记录格式
function transformRecord(record) {
    const fields = record.fields;

    // 处理图片 - 使用本地静态图片
    let imageData = "";
    if (fields["图片"] && Array.isArray(fields["图片"]) && fields["图片"].length > 0) {
        const img = fields["图片"][0];
        if (img.file_token) {
            // 使用产品名作为图片路径
            const name = fields["产品"] || "";
            const safeName = name.replace(/[/\s]/g, "_");
            imageData = `/data/images/${safeName}.png`;
        }
    }

    return {
        brand: fields["品类"] || "",
        name: fields["产品"] || "",
        spec: fields["规格"] || "",
        retailPrice: fields["零售价"] || 0,
        boxSpec: fields["箱规"] || "",
        barcode: fields["条码"] || "",
        price: fields["价格"] || 0,
        productCode: fields["商品编码"] || "",
        image: imageData
    };
}

// Vercel Serverless Function
module.exports = async (req, res) => {
    // 设置 CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        // 获取所有记录
        const records = await getAllRecords();

        // 转换格式
        const products = records.map(transformRecord).filter(p => p.name);

        // 返回数据
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
        return res.status(200).json(products);
    } catch (error) {
        console.error("获取飞书数据失败:", error);
        return res.status(500).json({ error: error.message });
    }
};
