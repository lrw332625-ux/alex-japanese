# alex-japanese 项目规则

1. 本项目本机管理路径为 `/Volumes/Data/Dropbox/LL/MyApps/alex-japanese`；旧桌面临时目录只作为历史来源，不再作为默认工作目录。
2. 公网入口为 `https://jp2.lrw33.cc/`。
3. 上海 VPS 部署路径为 `/home/lighthouse/apps/jp2-japanese/web`，systemd 服务为 `jp2-japanese.service`，监听 `127.0.0.1:8174`。
4. 公网链路走上海 VPS 的 Cloudflare Tunnel `date-shanghai`，ingress 应包含 `jp2.lrw33.cc -> http://127.0.0.1:8174`；不要占用快乐日语的 `8173`。
5. 网站内容更新后，先提交并推送 GitHub `main`，再刷新 VPS 副本，最后用 `curl --noproxy '*' https://jp2.lrw33.cc/` 做公网验证。

## 2026-05-06 迁移与部署记录

- 已从 GitHub `lrw332625-ux/alex-japanese` 克隆到本机管理目录 `/Volumes/Data/Dropbox/LL/MyApps/alex-japanese`，当前基线提交为 `4017cc74922a5d6b99d85297153ee755d9ce6f63`。
- 已同步项目管理中心、`remote-project-switcher` 和 Obsidian 日语学习项目笔记，公网入口改为 `https://jp2.lrw33.cc/`。
- 已部署到上海 VPS：`/home/lighthouse/apps/jp2-japanese/web`，服务 `jp2-japanese.service`，监听 `127.0.0.1:8174`。
- VPS `date-shanghai` Tunnel 当前保留 `date.lrw33.cc -> 8160`、`jp1.lrw33.cc -> 8173`、`alex.lrw33.cc -> 8173`，并新增 `jp2.lrw33.cc -> 8174`。
- 迁移后核验结果：本机临时服务 `http://127.0.0.1:8194/` 返回 `200`；VPS 本机 `127.0.0.1:8174` 返回 `200`；公网直连 `https://jp2.lrw33.cc/` 返回 `200 text/html`，`https://jp2.lrw33.cc/scripts/emoji-data.js` 返回 `200 text/javascript`；旁路检查 `https://alex.lrw33.cc/` 和 `https://date.lrw33.cc/` 均返回 `200`。

## 2026-05-07 图片质量修正记录

- 针对水墨/灰雾过重、动物主体不清的问题，已用内置 Image 2 工作流重新生成并透明化：`zebra.png`、`flamingo.png`、`panda.png`、`seal.png`、`hedgehog.png`、`fox.png`、`lizard.png`、`jellyfish.png`、`vocab_arikui.png`。
- 同步把一批灰雾明显的通用图标换回干净版本：`balloon`、`banana`、`books`、`brain`、`cross_mark`、`fire`、`game`、`guitar`、`light_bulb`、`memo`、`music`、`notes`、`party_popper`、`question`、`raising_hands`、`repeat`、`taxi`、`thinking`、`tongue`、`umbrella`、`yum`、`dolphin`、`turtle`、`pen`、`pencil`、`graduation_cap`。
- 根据后续反馈，已继续替换龙虾/蚕相关图片：`shrimp.png`、`gp_ebi.png` 改为清晰红色龙虾；`bug.png`、`caterpillar.png`、`gp_mushi.png` 改为白色蚕宝宝。
- 原图已备份到 `/Volumes/Data/Dropbox/LL/MyApps/alex-japanese/img_quality_backup_20260507`。
- `scripts/emoji-data.js` 的图标缓存版本已从 `?v2` 后续提升到 `?v4`，所有页面对 `emoji-data.js` 的引用也统一改为 `emoji-data.js?v4`，避免公网继续显示旧图。
