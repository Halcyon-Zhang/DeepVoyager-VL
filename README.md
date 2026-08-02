# DeepVoyager-VL

DeepVoyager-VL is a standalone supervised fine-tuning (SFT) training bundle extracted from the Vision-DeepResearch training workspace. It is designed for multi-node, multi-GPU Megatron training of Qwen3-VL Dense and MoE models.

The top-level layout follows Vision-DeepResearch, with the RL component removed:

- `Megatron-LM`: the Megatron-Core training implementation.
- `ms-swift`: model definitions, templates, dataset encoding, and Megatron SFT integration.
- `mbridge`: the Hugging Face-to-Megatron model and checkpoint bridge for Qwen3-VL.
- `scripts`: entry points for source-based, Docker, and multi-node training.
- `configs`: sanitized example configurations with placeholder paths and no credentials.

There is no `rllm` directory because this bundle covers SFT only. The original `data`, `figs`, and `checkpoints` payload directories are also intentionally omitted.

This repository does not contain training data, model weights, images, figures, checkpoints, logs, caches, real host addresses, or credentials. Directories named `data` or `dataset` inside the framework packages contain source code and dataset registry metadata only; they do not contain training samples.

## Bundled versions

The bundled source was copied from the original training workspace:

- ms-swift: `3.12.0.dev0`
- Megatron-Core: `0.14.0rc7`
- mbridge: `0.15.1`

Three cluster-stability changes from the original workspace are preserved:

- Packing is computed locally on every rank.
- Megatron communication groups are warmed up before training.
- Singleton pipeline-parallel broadcast is skipped when `PP=1`.

The previously validated Docker training environment used `ms-swift 4.0.3` and `Megatron-Core 0.15.3`. The scripts therefore support two explicit runtime modes:

- `SWIFT_RUNTIME=bundled` uses the top-level `ms-swift`, `Megatron-LM`, and `mbridge` source trees and includes the stability changes above.
- `SWIFT_RUNTIME=installed` uses the `megatron` command already installed in the current environment or Docker image.

Do not restore the same optimizer state interchangeably across the two runtime stacks. Run a smoke test after upgrading any component.

## Dataset format

Training data must be provided from outside this repository. Each JSONL line should follow this structure:

```json
{"messages":[{"role":"system","content":"..."},{"role":"user","content":"<image>..."},{"role":"assistant","content":"<think>...</think><answer>...</answer>"}],"images":["/absolute/path/to/image.jpg"]}
```

With the default `loss_scale=default`, all assistant turns contribute to the loss. System, user, tool-response, and image tokens do not contribute to the language-model loss.

## Quick start

### 1. Use the bundled source

Prepare PyTorch, Transformer Engine, and FlashAttention versions compatible with the CUDA environment, then install the three local packages:

```bash
bash scripts/install_bundled.sh
```

Copy an example configuration and replace the placeholder paths with model, dataset, cache, and output paths outside this repository:

```bash
cp configs/sft_8b.env.example configs/sft.env
vi configs/sft.env
set -a
source configs/sft.env
set +a
bash scripts/train_sft.sh
```

### 2. Use an existing training image

The image must provide a working `megatron sft` command together with compatible Megatron-Core, mbridge, Transformer Engine, and FlashAttention packages:

```bash
set -a
source configs/sft.env
set +a
export IMAGE=<your-training-image>
bash scripts/docker_run.sh
```

Docker defaults to `SWIFT_RUNTIME=installed`, which uses the ms-swift installation inside the image. Set `SWIFT_RUNTIME=bundled` only when the image dependencies are compatible with the bundled source.

If image paths in the JSONL file are outside the model or dataset directory, set `MEDIA_ROOT` to their common parent directory before starting Docker. The directory is mounted read-only.

### 3. Launch multi-node training

The repository must exist at the same absolute path on every node, or be stored on a shared filesystem visible to all nodes:

```bash
cp hosts.example hosts.txt
vi hosts.txt

set -a
source configs/sft.env
set +a

# Bundled source
LAUNCH_MODE=local bash scripts/launch_multinode.sh hosts.txt

# Docker
LAUNCH_MODE=docker IMAGE=<your-training-image> \
  bash scripts/launch_multinode.sh hosts.txt
```

The first host is used as the rendezvous master. The launcher derives `NNODES`, `NODE_RANK`, and `MASTER_ADDR` from the hosts file. It forwards only an explicit allowlist of training variables and does not forward unknown environment variables or credentials.

## Main settings

- `MODEL_PATH`, `DATASET`, and `OUTPUT_DIR` are required.
- `MAX_LENGTH=131072` and `TRUNCATION_STRATEGY=delete` discard an overlength sample instead of truncating it.
- `PACKING=true` packs multiple conversations into fixed-length sequences.
- The default topology is `TP=4`, `CP=2`, `PP=1`, and `GBS=64`.
- `FREEZE_VIT=true` and `FREEZE_ALIGNER=true` freeze the vision tower and projector while training the language model or MoE layers.
- The 30B MoE example enables expert parallelism with `EXPERT_MODEL_PARALLEL_SIZE=8`.
- TensorBoard is the default reporting backend and requires no external login.

## Smoke test

Run a one-step test before starting a full multi-node job:

```bash
MAX_STEPS=1 SAVE_STEPS=1000000 bash scripts/train_sft.sh
```

For a multi-node test, export the same variables before running `scripts/launch_multinode.sh`. Verify initialization, forward and backward passes, and clean process exit before removing `MAX_STEPS`.
