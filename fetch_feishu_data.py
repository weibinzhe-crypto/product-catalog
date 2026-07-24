"""
从飞书多维表格获取产品数据并保存为 JSON
用于本地开发和 Vercel 部署前的数据准备
"""

import requests
import json
import os

# 飞书 API 配置（从环境变量读取）
APP_ID = os.environ.get("FEISHU_APP_ID", "cli_aae9bfef7d3a1d12")
APP_SECRET = os.environ.get("FEISHU_APP_SECRET", "")
APP_TOKEN = os.environ.get("FEISHU_APP_TOKEN", "Oqhywy8uuikbhpkRwKwcBaANnZe")
TABLE_ID = os.environ.get("FEISHU_TABLE_ID", "tbl2Culu8VKQacYt")

def get_tenant_access_token():
    """获取 tenant_access_token"""
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {
        "app_id": APP_ID,
        "app_secret": APP_SECRET
    }
    response = requests.post(url, json=payload)
    data = response.json()
    if data.get("code") != 0:
        raise Exception(f"获取 token 失败: {data.get('msg')}")
    return data.get("tenant_access_token")

def get_records(token, page_size=100, page_token=None):
    """获取多维表格记录"""
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"page_size": page_size}
    if page_token:
        params["page_token"] = page_token

    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    if data.get("code") != 0:
        raise Exception(f"获取记录失败: {data.get('msg')}")
    return data.get("data")

def get_all_records(token):
    """获取所有记录"""
    all_records = []
    page_token = None
    has_more = True

    while has_more:
        result = get_records(token, 100, page_token)
        all_records.extend(result.get("items", []))
        has_more = result.get("has_more", False)
        page_token = result.get("page_token")

    return all_records

def transform_record(record):
    """转换记录格式"""
    fields = record.get("fields", {})

    # 处理图片字段
    image_url = ""
    if fields.get("图片") and isinstance(fields["图片"], list) and len(fields["图片"]) > 0:
        img = fields["图片"][0]
        if isinstance(img, dict):
            image_url = img.get("tmp_url") or img.get("url") or ""
        elif isinstance(img, str):
            image_url = img

    return {
        "brand": fields.get("品类", ""),
        "name": fields.get("产品", ""),
        "spec": fields.get("规格", ""),
        "retailPrice": fields.get("零售价", 0),
        "boxSpec": fields.get("箱规", ""),
        "barcode": fields.get("条码", ""),
        "price": fields.get("价格", 0),
        "productCode": fields.get("商品编码", ""),
        "image": image_url
    }

def main():
    print("=== 从飞书获取产品数据 ===\n")

    # 1. 获取 token
    print("1. 获取 tenant_access_token...")
    token = get_tenant_access_token()
    print(f"   ✓ Token 获取成功")

    # 2. 获取所有记录
    print("\n2. 获取多维表格记录...")
    records = get_all_records(token)
    print(f"   ✓ 获取到 {len(records)} 条记录")

    # 3. 转换格式
    print("\n3. 转换数据格式...")
    products = [transform_record(r) for r in records]
    products = [p for p in products if p["name"]]  # 过滤空记录
    print(f"   ✓ 转换完成，共 {len(products)} 条有效产品")

    # 4. 保存为 JSON
    output_path = os.path.join(os.path.dirname(__file__), "data", "products.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"\n4. 数据已保存到: {output_path}")

    # 5. 显示前几条数据
    print("\n5. 前 3 条产品数据:")
    for i, p in enumerate(products[:3]):
        print(f"   {i+1}. {p['brand']} - {p['name']}")
        print(f"      规格: {p['spec']}, 价格: ¥{p['price']}")

    print("\n=== 完成 ===")

if __name__ == "__main__":
    main()
