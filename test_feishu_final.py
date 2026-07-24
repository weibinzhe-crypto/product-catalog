import requests
import json
import os

# 飞书 API 配置（从环境变量读取）
APP_ID = os.environ.get("FEISHU_APP_ID", "cli_aae9bfef7d3a1d12")
APP_SECRET = os.environ.get("FEISHU_APP_SECRET", "")

# 从链接中提取的信息
APP_TOKEN = "Oqhywy8uuikbhpkRwKwcBaANnZe"
TABLE_ID = "tbl2Culu8VKQacYt"

print("=== 飞书 API 测试（使用更正后的 App ID）===\n")
print(f"App ID: {APP_ID}")
print(f"App Secret: {APP_SECRET[:8]}...{APP_SECRET[-4:]}")

# 1. 获取 tenant_access_token
print("\n1. 获取 tenant_access_token...")
try:
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {
        "app_id": APP_ID,
        "app_secret": APP_SECRET
    }
    response = requests.post(url, json=payload, timeout=10)
    data = response.json()
    print(f"   响应: {json.dumps(data, ensure_ascii=False)}")

    if data.get("code") == 0:
        token = data.get("tenant_access_token")
        print(f"\n   ✓ Token 获取成功!")
        print(f"   Token: {token[:30]}...")

        # 2. 获取多维表格字段
        print("\n2. 获取多维表格字段...")
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/fields"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        print(f"   响应码: {data.get('code')}")
        if data.get("code") == 0:
            fields = data.get("data", {}).get("items", [])
            print(f"   ✓ 获取到 {len(fields)} 个字段")
            for field in fields[:5]:
                print(f"     - {field.get('field_name')} ({field.get('type')})")
        else:
            print(f"   ✗ 错误: {data.get('msg')}")

        # 3. 获取多维表格记录
        print("\n3. 获取多维表格记录...")
        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records"
        params = {"page_size": 5}
        response = requests.get(url, headers=headers, params=params, timeout=10)
        data = response.json()
        print(f"   响应码: {data.get('code')}")
        if data.get("code") == 0:
            records = data.get("data", {}).get("items", [])
            print(f"   ✓ 获取到 {len(records)} 条记录")
            for i, record in enumerate(records[:3]):
                fields = record.get("fields", {})
                print(f"     记录{i+1}: {json.dumps(fields, ensure_ascii=False)[:100]}...")
        else:
            print(f"   ✗ 错误: {data.get('msg')}")
    else:
        print(f"\n   ✗ Token 获取失败: {data.get('msg')}")

except Exception as e:
    print(f"   错误: {e}")
