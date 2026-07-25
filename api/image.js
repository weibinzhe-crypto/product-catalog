// 飞书图片代理接口
const FEISHU_CONFIG = {
    appId: process.env.FEISHU_APP_ID || "cli_aae9bfef7d3a1d12",
    appSecret: process.env.FEISHU_APP_SECRET || "99ypIswmLWb7DHMR5sSqEfVc5GkSHrWz"
};

let tokenCache = { token: null, expire: 0 };

async function getTenantAccessToken() {
    if (tokenCache.token && Date.now() < tokenCache.expire) {
        return tokenCache.token;
    }
    const response = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: FEISHU_CONFIG.appId, app_secret: FEISHU_CONFIG.appSecret })
    });
    const data = await response.json();
    if (data.code !== 0) throw new Error("Token failed");
    tokenCache.token = data.tenant_access_token;
    tokenCache.expire = Date.now() + (data.expire - 300) * 1000;
    return tokenCache.token;
}

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Missing token" });
    
    try {
        const accessToken = await getTenantAccessToken();
        const url = `https://open.feishu.cn/open-apis/drive/v1/medias/${token}/download`;
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: "Download failed" });
        }
        
        const contentType = response.headers.get("content-type") || "image/png";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        
        const buffer = await response.arrayBuffer();
        return res.status(200).send(Buffer.from(buffer));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
