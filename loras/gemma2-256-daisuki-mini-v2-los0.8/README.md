---
base_model: models/EZO-Humanities-9B-gemma-2-it
library_name: peft
---

# WhatIsThis

**LoRA 256-daisuki-mini-v2(los0.8)**

`EZO-Humanities-9B-gemma-2-it`をベースに`256大好き`さんのチャットメッセージを学習をしたLoRAモデルです。

キャラクタースタイルを`256大好き`さんへ近づけることが目標です。

## Modelについて

利用データセット: `256-daisuki-mini-v2.json`

ベースモデル: `EZO-Humanities-9B-gemma-2-it`

### パラメーター設定

| パラメーター名          | 値                              |
|-------------------------|---------------------------------|
| `always_override`        | `false`                         |
| `q_proj_en`              | `true`                          |
| `v_proj_en`              | `true`                          |
| `k_proj_en`              | `false`                         |
| `o_proj_en`              | `false`                         |
| `gate_proj_en`           | `false`                         |
| `down_proj_en`           | `false`                         |
| `up_proj_en`             | `false`                         |
| `save_steps`             | `1`                             |
| `micro_batch_size`       | `4`                             |
| `batch_size`             | `4`                             |
| `epochs`                 | `10`                            |
| `learning_rate`          | `3e-4`                          |
| `lr_scheduler_type`      | `linear`                        |
| `lora_rank`              | `8`                             |
| `lora_alpha`             | `16`                            |
| `lora_dropout`           | `0.05`                          |
| `cutoff_len`             | `512`                           |
| `dataset`                | `256-daisuki-mini-v2`           |
| `eval_dataset`           | `None`                          |
| `format`                 | `gemma2-chat-format`            |
| `eval_steps`             | `100`                           |
| `raw_text_file`          | `None`                          |
| `overlap_len`            | `128`                           |
| `newline_favor_len`      | `128`                           |
| `higher_rank_limit`      | `false`                         |
| `warmup_steps`           | `100`                           |
| `stop_at_loss`           | `0.8`                           |
| `add_eos_token`          | `false`                         |

### Framework versions

- PEFT 0.12.0
- transformers 4.45.1
- accelerate 0.34.2