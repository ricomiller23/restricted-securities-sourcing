#!/usr/bin/env python3
import json
import os
import sys
import urllib.request
import urllib.error

api_key = "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"

def get_models():
    req = urllib.request.Request(
        url="https://integrate.api.nvidia.com/v1/models",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode("utf-8"))
        return [m["id"] for m in data.get("data", [])]

def test_model(model_id):
    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": "Hi"}],
        "max_tokens": 10
    }
    req = urllib.request.Request(
        url="https://integrate.api.nvidia.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as response:
            return True
    except urllib.error.HTTPError as e:
        return False
    except Exception:
        return False

models = get_models()
successful_models = []
print(f"Found {len(models)} models. Testing all...")
for m in models:
    if test_model(m):
        successful_models.append(m)

print(f"SUCCESSFUL MODELS: {successful_models}")
