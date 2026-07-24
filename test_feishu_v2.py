import requests
import json

# 飞书 API 配置
APP_ID = "cli_aae9bfef7d3a1d122"
APP_SECRET = "99ypIswmLWb7DHMR5sSqEfVc5GkSHrWz3"

print("=== 飞书 API 调试 ===\n")

# 测试1: 检查 API 是否可达
print("1. 测试 API 连通性...")
try:
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {
        "app_id": APP_ID,
        "app_secret": APP_SECRET
    }
    print(f"   请求 URL: {url}")
    print(f"   请求参数: app_id={APP_ID}, app_secret={'*' * len(APP_SECRET)}")

    response = requests.post(url, json=payload, timeout=10)
    print(f"   响应状态码: {response.status_code}")
    print(f"   响应内容: {response.text}")

    data = response.json()
    if data.get("code") == 0:
        print(f"\n   ✓ Token 获取成功!")
        token = data.get("tenant_access_token")
        print(f"   Token: {token[:30]}...")

        # 测试2: 获取多维表格字段
        print("\n2. 测试多维表格访问...")
        APP_TOKEN = "Oqhywy8uuikbhpkRwKwcBaANnZe"
        TABLE_ID = "tbl2Culu8VKQacYt"

        url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/fields"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(url, headers=headers, timeout=10)
        print(f"   响应状态码: {response.status_code}")
        print(f"   响应内容: {response.text[:500]}...")

    else:
        print(f"\n   ✗ 错误: {data.get('msg')}")

except requests.exceptions.RequestException as e:
    print(f"   网络错误: {e}")
except Exception as e:
    print(f"   其他错误: {e}")

# 测试3: 检查应用信息
print("\n3. 检查应用配置...")
print(f"   App ID: {APP_ID}")
print(f"   App Secret: {'*' * len(APP_SECRET)}")
print(f"   注意: 请确保应用已发布且权限已开通")
