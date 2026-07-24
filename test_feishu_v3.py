import requests
import json

# 飞书 API 配置
APP_ID = "cli_aae9bfef7d3a1d122"
APP_SECRET = "99ypIswmLWb7DHMR5sSqEfVc5GkSHrWz3"

print("=== 飞书 API 详细调试 ===\n")

# 测试1: 使用不同的 API 端点
print("1. 测试 auth/v3/tenant_access_token/internal ...")
try:
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = {
        "app_id": APP_ID,
        "app_secret": APP_SECRET
    }
    response = requests.post(url, json=payload, timeout=10)
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {response.text}")
except Exception as e:
    print(f"   错误: {e}")

# 测试2: 尝试不同的请求格式
print("\n2. 尝试使用 form-data 格式...")
try:
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    data = {
        "app_id": APP_ID,
        "app_secret": APP_SECRET
    }
    response = requests.post(url, data=data, timeout=10)
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {response.text}")
except Exception as e:
    print(f"   错误: {e}")

# 测试3: 检查是否是网络问题
print("\n3. 测试网络连通性...")
try:
    response = requests.get("https://open.feishu.cn", timeout=10)
    print(f"   状态码: {response.status_code}")
    print(f"   网络正常")
except Exception as e:
    print(f"   网络错误: {e}")

# 测试4: 验证输入参数
print("\n4. 验证输入参数...")
print(f"   APP_ID: {APP_ID}")
print(f"   APP_ID 长度: {len(APP_ID)}")
print(f"   APP_ID 格式: {'cli_' + 'x' * 16}")
print(f"   APP_SECRET 长度: {len(APP_SECRET)}")
print(f"   APP_SECRET 格式示例: 32位字符")

# 测试5: 尝试使用个人访问令牌（如果有的话）
print("\n5. 提示...")
print("   如果以上都失败，可能需要：")
print("   - 重新生成 App Secret")
print("   - 检查应用是否真正发布成功")
print("   - 联系飞书客服确认应用状态")
