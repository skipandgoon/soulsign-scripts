# 魂签个人脚本库

自用（私有）。魂签（soulsign MV3）的脚本源 + 云端同步快照。

## 结构

```
manifest.json     脚本索引（扩展的「我的脚本库」读这个）
scripts/*.js      脚本本体（纯代码，不含任何 cookie / 密码 / 2FA 密钥）
sync/sync.json    云端同步快照（含脚本参数，仅私有仓库可放；首次同步后生成）
```

## manifest.json 字段

| 字段 | 说明 |
|---|---|
| `id` | 唯一标识（默认取 domain 归一化），用于匹配已装脚本 |
| `name` | 显示名，需与脚本头 `@name` 一致（扩展按 author + name 匹配任务） |
| `author` | 脚本头 `@author` |
| `version` | 脚本头 `@version`，扩展用它判断「可更新」 |
| `domain` | 脚本头 `@domain` |
| `loginURL` | 脚本头 `@loginURL` |
| `expire` | 脚本头 `@expire`（毫秒） |
| `file` | 相对路径 |
| `desc` | 一句话说明 |

## 新增脚本

1. 把 `.js` 放进 `scripts/`，确认头部 `@name / @author / @version / @domain` 齐全
2. 在 `manifest.json` 的 `scripts` 里加一条（`file` 指向它）
3. 提交推送

## 红线

- 脚本里**不许出现** cookie、密码、2FA 密钥、推送 token；参数一律走魂签的「参数」配置（存在 `_params` 里，只进 `sync/sync.json`）
- 仓库保持 **private**
