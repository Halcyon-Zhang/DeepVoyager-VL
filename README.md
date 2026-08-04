<div align="center">

# DeepVoyager-VL

### Incentivizing Vision-in-the-Loop Search for Long-Horizon Multimodal Agents

The official repository for **DeepVoyager-VL**, a long-horizon multimodal
deep-search framework in which newly acquired visual evidence determines what
the agent searches next.

[![Project Page](https://img.shields.io/badge/🌐-Project%20Page-1a73e8)](https://halcyon-zhang.github.io/DeepVoyager-VL/)
[![Paper](https://img.shields.io/badge/%E2%80%8B-2608.01827-b31b1b?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxODAgMTgwIj48cGF0aCBkPSJNMTIyIDQ2IDY5IDk5IiBmaWxsPSJub25lIiBzdHJva2U9IiNiOGI4YjUiIHN0cm9rZS13aWR0aD0iMTUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zMyAyOCAxMDMgMTAwIDQ5IDE2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYjMxYjM0IiBzdHJva2Utd2lkdGg9IjE1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJtNjkgOTkgNzUgNzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2I4YjhiNSIgc3Ryb2tlLXdpZHRoPSIxNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8%2BPC9zdmc%2B&labelColor=555)](https://arxiv.org/abs/2608.01827)
[![Dataset](https://img.shields.io/badge/🤗-Dataset-ffcc4d)](https://huggingface.co/datasets/Halcyon-Zhang/EventVoyage-VL)
[![8B Model](https://img.shields.io/badge/🤗-8B%20Model-2ea44f)](https://huggingface.co/Halcyon-Zhang/DeepVoyager-VL-8B)
[![30B-A3B Model](https://img.shields.io/badge/🤗-30B--A3B%20Model-8250df)](https://huggingface.co/Halcyon-Zhang/DeepVoyager-VL-30B-A3B)
[![Citation](https://img.shields.io/badge/📚-Citation-6f42c1)](#citation)

</div>

## 🔔 Timeline

- 🚀 **[2026-08]** We released the [DeepVoyager-VL paper](https://arxiv.org/abs/2608.01827), [project page](https://halcyon-zhang.github.io/DeepVoyager-VL/), and the reproducible Megatron SFT training bundle.

## ✨ Highlights

- **Vision in the loop.** Newly acquired visual evidence directly guides
  subsequent retrieval, with images loaded or cropped only when needed.
- **EventVoyage-VL.** A structure-before-language synthesis pipeline generates
  long-horizon questions with explicit intermediate visual dependencies.
- **Supervised-only training.** DeepVoyager-VL learns long-horizon search from
  curated trajectories without an additional reinforcement-learning stage.
- **Strong performance.** The 8B and 30B-A3B models achieve average scores of
  **54.8** and **58.6**, substantially outperforming other multimodal search agents.

## 🧭 Overview

### Vision-in-the-Loop Synthesis Paradigm

Existing synthesis paradigms typically confine vision to the beginning or end
of a reasoning chain. EventVoyage-VL instead makes intermediate visual evidence
necessary for subsequent retrieval, explicitly supervising vision-in-the-loop
behavior.

<p align="center">
  <img src="webpage/app/images/paper/figure-paradigms.webp" width="100%" alt="Comparison of multimodal search data synthesis paradigms">
</p>

<p align="left">
  <b>Figure 1.</b> Comparison of multimodal search data synthesis paradigms.
  Prior methods place vision at the input through entity substitution (a),
  concentrate visual reasoning before text-based search (b), or graft visual
  evidence near the answer (c). We instead synthesize vision-in-the-loop
  questions from a visually enriched multimodal event graph (d), as illustrated
  by a representative long-horizon example (e).
</p>

### Data Synthesis and Training Pipeline

Starting from real-world events, the pipeline constructs a visually enriched
event graph, synthesizes and stratifies questions, extracts validated
long-horizon trajectories, and distills them into DeepVoyager-VL through SFT.

<p align="center">
  <img src="webpage/app/images/paper/figure-overview.png" width="100%" alt="Overview of the DeepVoyager-VL pipeline">
</p>

<p align="left">
  <b>Figure 2.</b> Overview of DeepVoyager-VL, encompassing vision-in-the-loop
  data synthesis, difficulty-aware trajectory curation, and supervised agent
  training.
</p>

## 📊 Performance

DeepVoyager-VL-8B and DeepVoyager-VL-30B-A3B achieve average scores of **54.8**
and **58.6** across ten benchmarks, leading scale-matched open multimodal
deep-search agents on eight and nine benchmarks, respectively.

| Model | MMSearch | SimpleVQA | LiveVQA | FVQA | BC-VL | MM-BC | MMSearch+ | VDR | BC-V³ | VisBrowse | Avg. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Direct Answer** | | | | | | | | | | | |
| GPT-5.5 | **68.7** | <u>67.0</u> | **73.0** | **66.7** | **47.9** | **17.5** | <u>20.3</u> | **18.6** | **23.0** | **36.1** | **43.9** |
| Gemini-3.1-Pro | <u>64.2</u> | 64.1 | <u>65.0</u> | 58.9 | 41.4 | 11.5 | **26.4** | <u>15.6</u> | <u>19.3</u> | 23.7 | <u>39.0</u> |
| Claude-Opus-4.6 | 59.8 | **71.7** | 53.1 | <u>60.1</u> | <u>43.5</u> | <u>13.2</u> | 13.2 | 15.4 | 15.0 | <u>27.2</u> | 37.2 |
| Qwen3-VL-30B-A3B-Instruct | 18.7 | 53.2 | 42.7 | 34.7 | 29.6 | 4.0 | 3.2 | 3.8 | 6.0 | 11.2 | 20.7 |
| Qwen3-VL-8B-Instruct | 15.2 | 44.7 | 41.0 | 28.0 | 25.1 | 4.9 | 3.2 | 2.8 | 1.0 | 8.9 | 17.5 |
| **Agentic Workflow** | | | | | | | | | | | |
| GPT-5.5 | **82.7** | **82.3** | **90.3** | **84.3** | **68.2** | **51.9** | 48.6 | **42.0** | **55.0** | **66.3** | **67.2** |
| Gemini-3.1-Pro | **82.7** | 81.0 | 87.3 | <u>81.3</u> | <u>65.9</u> | 44.4 | <u>51.5</u> | <u>40.8</u> | <u>50.0</u> | 62.1 | 64.7 |
| Claude-Opus-4.6 | <u>81.7</u> | <u>81.7</u> | <u>88.0</u> | 79.3 | 63.2 | <u>49.4</u> | **52.1** | 36.6 | **55.0** | <u>62.7</u> | <u>65.0</u> |
| Qwen3-VL-30B-A3B-Instruct | 64.7 | 71.0 | 73.3 | 72.3 | 41.6 | 9.9 | 17.7 | 21.6 | 11.3 | 23.1 | 40.7 |
| Qwen3-VL-8B-Instruct | 61.7 | 60.0 | 67.7 | 69.7 | 34.6 | 5.8 | 13.5 | 16.8 | 7.7 | 15.4 | 35.3 |
| **Multimodal Deep Search Agents** | | | | | | | | | | | |
| ***Small-scale*** | | | | | | | | | | | |
| MMSearch-R1-7B | 53.8 | 57.4 | 48.4 | 58.4 | — | — | — | — | 4.0 | — | — |
| WebWatcher-7B | 49.1 | 54.3 | 51.2 | — | 21.2 | — | — | — | 4.7 | — | — |
| DeepEyesV2-7B | 63.7 | 59.4 | — | 60.6 | — | — | — | — | — | — | — |
| SenseNova-MARS-8B | 67.8 | 70.2 | 56.2 | 67.1 | — | — | — | — | — | — | — |
| Vision-DeepResearch-8B | 69.6 | — | 76.7 | 64.7 | 42.6 | — | 20.4 | <u>29.2</u> | <u>11.7</u> | — | — |
| MM-DeepResearch-8B | 67.8 | 65.9 | 65.0 | 69.2 | 37.9 | — | — | — | — | — | — |
| POINTS-Seeker-8B | 70.8 | 68.8 | <u>77.7</u> | 71.2 | 44.4 | — | 25.2 | — | — | — | — |
| OpenSearch-VL-8B | 64.5 | 71.6 | 59.6 | 71.5 | 37.6 | — | — | 20.8 | — | — | — |
| SimpleSearch-VL-8B | **77.1** | **76.6** | 75.2 | <u>76.8</u> | <u>52.1</u> | — | <u>32.5</u> | — | — | — | — |
| Visual-Seeker-8B | 72.2 | — | — | — | 47.6 | <u>16.1</u> | 27.3 | — | — | <u>34.7</u> | — |
| **DeepVoyager-VL-8B** | <u>72.7</u> | <u>76.3</u> | **82.7** | **82.7** | **58.4** | **24.0** | **37.1** | **35.0** | **32.3** | **47.3** | **54.8** |
| ***Large-scale*** | | | | | | | | | | | |
| WebWatcher-32B | 55.3 | 59.0 | 58.7 | — | 27.0 | — | — | — | <u>8.7</u> | — | — |
| SenseNova-MARS-32B | <u>74.3</u> | 74.1 | 60.8 | 72.6 | — | — | — | — | — | — | — |
| Skywork-R1V4-30B-A3B | 66.1 | — | — | 67.2 | 38.4 | — | — | — | — | — | — |
| Vision-DeepResearch-30B-A3B | 69.6 | — | 77.6 | 74.2 | 53.7 | — | 28.5 | <u>37.8</u> | — | — | — |
| REDSearcher-MM-30B-A3B<sup>†</sup> | 72.9 | — | 79.3 | — | <u>57.2</u> | 23.5 | 26.6 | — | — | — | — |
| MM-DeepResearch-32B | 69.0 | 67.6 | 68.0 | 70.1 | 43.0 | — | — | — | — | — | — |
| LMM-Searcher-30B-A3B<sup>†,‡</sup> | 71.0 / 72.3 | — | — | — | — | 22.3 / <u>30.1</u> | 32.9 / <u>34.8</u> | — | — | 42.0 / <u>48.3</u> | — |
| OpenSearch-VL-30B-A3B | 68.7 | 74.9 | 67.4 | 73.2 | 41.1 | — | — | 33.5 | — | — | — |
| SimpleSearch-VL-30B-A3B | **83.6** | <u>79.6</u> | <u>81.1</u> | <u>79.0</u> | 55.9 | — | 34.4 | — | — | — | — |
| **DeepVoyager-VL-30B-A3B** | 74.0 | **81.0** | **82.7** | **84.7** | **64.2** | **30.5** | **40.6** | **39.4** | **35.0** | **53.8** | **58.6** |

**Table 1.** Performance comparison across ten multimodal information-seeking
benchmarks. Within each comparison group, the best and second-best results are
bolded and underlined, respectively. <sup>†</sup> denotes initialization from a
Thinking checkpoint; <sup>‡</sup> denotes LMM-Searcher's 30-turn / 100-turn
settings (*x* / *y*).

See the [paper](https://arxiv.org/abs/2608.01827) and
[project page](https://halcyon-zhang.github.io/DeepVoyager-VL/) for complete
baseline comparisons and ablation studies.

## 🔍 Trajectory Analysis

<table>
  <tr>
    <td width="50%"><img src="webpage/app/images/paper/figure-tool-usage.webp" alt="Visual tool engagement"></td>
    <td width="50%"><img src="webpage/app/images/paper/figure-turn-distribution.webp" alt="Interaction horizon"></td>
  </tr>
  <tr>
    <td align="center"><b>(a) Visual tool engagement</b></td>
    <td align="center"><b>(b) Interaction horizon</b></td>
  </tr>
</table>

Under unified rollouts, visual tools account for **64.3%** of EventVoyage-VL
tool calls, compared with 40.6%, 30.3%, and 10.1% for three public datasets.
EventVoyage-VL trajectories peak at **16–20 turns**, while the compared datasets
peak within 1–10 turns.

## 🗂️ Repository Structure

```text
DeepVoyager-VL/
├── Megatron-LM/       # Megatron-Core distributed training
├── ms-swift/          # Model, template, data encoding, and SFT integration
├── mbridge/           # Hugging Face ↔ Megatron checkpoint bridge
├── configs/           # Sanitized 8B and 30B-A3B training examples
├── scripts/           # Installation, training, Docker, and multi-node launchers
├── webpage/           # Statically exportable project page
└── hosts.example      # Example multi-node host list
```

The repository intentionally excludes training samples, model weights,
checkpoints, logs, caches, host addresses, and credentials. Model, dataset,
cache, and output paths must point to storage outside this repository.

## 🚀 Quickstart

### 1. Clone and install

Prepare a CUDA-enabled PyTorch environment with compatible Transformer Engine
and FlashAttention versions:

```bash
git clone https://github.com/Halcyon-Zhang/DeepVoyager-VL.git
cd DeepVoyager-VL
bash scripts/install_bundled.sh
```

The bundled stack contains:

| Component | Version |
| --- | --- |
| ms-swift | `3.12.0.dev0` |
| Megatron-Core | `0.14.0rc7` |
| mbridge | `0.15.1` |

### 2. Prepare training data

Training data must be provided externally in JSONL format. Each line follows:

```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "<image>..."},
    {"role": "assistant", "content": "<think>...</think><answer>...</answer>"}
  ],
  "images": ["/absolute/path/to/image.jpg"]
}
```

With the default loss configuration, assistant reasoning, tool calls, and
answers contribute to the loss. System, user, tool-response, and image tokens
are conditioning context.

### 3. Configure the model

For Qwen3-VL-8B:

```bash
cp configs/sft_8b.env.example configs/sft.env
```

For Qwen3-VL-30B-A3B:

```bash
cp configs/sft_30b_moe.env.example configs/sft.env
```

Edit the required external paths:

```bash
vi configs/sft.env
```

```text
MODEL_PATH=/path/to/model
DATASET=/path/to/train.jsonl
OUTPUT_DIR=/path/to/output
CACHE_ROOT=/path/to/cache
```

Load the configuration:

```bash
set -a
source configs/sft.env
set +a
```

### 4. Smoke test and train

Always run a one-step smoke test before a full training job:

```bash
MAX_STEPS=1 SAVE_STEPS=1000000 bash scripts/train_sft.sh
```

After verifying initialization, forward/backward passes, and clean process
exit, start the full run:

```bash
bash scripts/train_sft.sh
```

### 5. Multi-node training

The repository must be available at the same absolute path on every node or
through a shared filesystem.

```bash
cp hosts.example hosts.txt
vi hosts.txt

LAUNCH_MODE=local bash scripts/launch_multinode.sh hosts.txt
```

The first entry in `hosts.txt` is used as the rendezvous master. The launcher
derives `NNODES`, `NODE_RANK`, and `MASTER_ADDR` automatically.

### 6. Docker runtime

To use an existing image containing a compatible `megatron sft` command:

```bash
export IMAGE=<your-training-image>
bash scripts/docker_run.sh
```

Docker defaults to `SWIFT_RUNTIME=installed`. Use
`SWIFT_RUNTIME=bundled` only when the image dependencies are compatible with
the bundled source. If JSONL image paths lie outside the model or dataset
directory, set `MEDIA_ROOT` to their common parent.

## ⚙️ Default Training Configuration

| Setting | Default |
| --- | --- |
| Epochs | 4 |
| Maximum sequence length | 131,072 |
| Global batch size | 64 |
| Learning rate | `2e-5` |
| Tensor / context / pipeline parallelism | `4 / 2 / 1` |
| Expert parallelism (30B-A3B) | 8 |
| Vision encoder / aligner | Frozen |
| Packing | Enabled |
| Reporting | TensorBoard |

The scripts preserve three stability changes used in the original training
workspace: rank-local packing, communication-group warm-up, and skipping the
singleton pipeline-parallel broadcast when `PP=1`.

Two runtime modes are supported:

- `SWIFT_RUNTIME=bundled` uses the source trees in this repository.
- `SWIFT_RUNTIME=installed` uses a compatible `megatron` CLI already installed
  in the environment or Docker image.

Do not interchange optimizer states between different runtime stacks without
first validating compatibility.

<a id="citation"></a>

## 📚 Citation

```bibtex
@misc{zhang2026deepvoyagervl,
  title         = {DeepVoyager-VL: Incentivizing Vision-in-the-Loop Search for Long-Horizon Multimodal Agents},
  author        = {Huanyao Zhang and Jiepeng Zhou and Runhao Zhao and Yanzhe Shan
                   and Jiaoyang Chen and Bowen Zhou and Bo Li and Fang Wang
                   and Jialong Wu and Zhengwei Tao and Lang Mei and Xiaohan Yu
                   and Liyan Liu and Chong Chen and Wentao Zhang},
  year          = {2026},
  eprint        = {2608.01827},
  archivePrefix = {arXiv},
  primaryClass  = {cs.CV},
  url           = {https://arxiv.org/abs/2608.01827}
}
```

## 🤝 Acknowledgements

This repository builds on
[Qwen3-VL](https://github.com/QwenLM/Qwen3-VL),
[ms-swift](https://github.com/modelscope/ms-swift),
[Megatron-LM](https://github.com/NVIDIA/Megatron-LM), and
[mbridge](https://github.com/ISEEKYAN/mbridge).

## ⚖️ License

This project is released under the [MIT License](LICENSE).
