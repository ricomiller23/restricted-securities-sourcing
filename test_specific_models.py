#!/usr/bin/env python3
import json
import os
import sys
import urllib.request
import urllib.error

api_key = "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"

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
            return True, ""
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error {e.code}: {e.read().decode('utf-8')}"
    except Exception as e:
        return False, str(e)

for m in ["mistralai/codestral-22b-instruct-v0.1", "nvidia/llama-3.1-nemotron-70b-instruct", "meta/llama3-70b-instruct"]:
    success, err = test_model(m)
    if success:
        print(f"SUCCESS: {m}")
    else:
        print(f"FAILED: {m} - {err}")
