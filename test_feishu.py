import requests
import json

# 飞书 API 配置
APP_ID = "cli_aae9bfef7d3a1d122"
APP_SECRET = "99ypIswmLWb7DHMR5sSqEfVc5GkSHrWz3"

# 从链接中提取的信息
# https://ncn9s2amzmrb.feishu.cn/wiki/Oqhywy8uuikbhpkRwKwcBaANnZe?table=tbl2Culu8VKQacYt&view=vew6LtDGST
APP_TOKEN = "Oqhywy8uuikbhpkRwKwcBaANnZe"  # wiki token
TABLE_ID = "tbl2Culu8VKQacYt"

def get_tenant_access_token():
    """获取 tenant_access_token"""
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {
        "app_id": APP_ID,
        "app_secret": APP_SECRET
    }
    response = requests.post(url, json=payload)
    data = response.json()
    print(f"获取 token 响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
    if data.get("code") == 0:
        return data.get("tenant_access_token")
    return None

def get_table_fields(token):
    """获取多维表格字段"""
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/fields"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(url, headers=headers)
    data = response.json()
    print(f"\n获取字段响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
    return data

def get_table_records(token):
    """获取多维表格记录"""
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    params = {
        "page_size": 5
    }
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    print(f"\n获取记录响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
    return data

if __name__ == "__main__":
    print("=== 测试飞书 API 连接 ===\n")

    # 1. 获取 token
    print("1. 获取 tenant_access_token...")
    token = get_tenant_access_token()

    if token:
        print(f"\n✓ Token 获取成功: {token[:20]}...")

        # 2. 获取字段
        print("\n2. 获取多维表格字段...")
        fields = get_table_fields(token)

        # 3. 获取记录
        print("\n3. 获取多维表格记录...")
        records = get_table_records(token)
    else:
        print("\n✗ Token 获取失败")
