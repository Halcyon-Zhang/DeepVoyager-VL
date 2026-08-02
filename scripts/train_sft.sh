#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

require_value() {
    local name="$1"
    if [[ -z "${!name:-}" ]]; then
        echo "ERROR: ${name} is required." >&2
        exit 1
    fi
}

require_bool() {
    local name="$1"
    local value="${!name}"
    if [[ "${value}" != "true" && "${value}" != "false" ]]; then
        echo "ERROR: ${name} must be true or false, got: ${value}" >&2
        exit 1
    fi
}

require_value MODEL_PATH
require_value DATASET
require_value OUTPUT_DIR

if [[ ! -e "${MODEL_PATH}" ]]; then
    echo "ERROR: MODEL_PATH does not exist: ${MODEL_PATH}" >&2
    exit 1
fi
if [[ ! -f "${DATASET}" ]]; then
    echo "ERROR: DATASET does not exist: ${DATASET}" >&2
    exit 1
fi

SWIFT_RUNTIME="${SWIFT_RUNTIME:-bundled}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

NNODES="${NNODES:-1}"
NODE_RANK="${NODE_RANK:-0}"
NPROC_PER_NODE="${NPROC_PER_NODE:-8}"
MASTER_ADDR="${MASTER_ADDR:-127.0.0.1}"
MASTER_PORT="${MASTER_PORT:-29500}"

TENSOR_MODEL_PARALLEL_SIZE="${TENSOR_MODEL_PARALLEL_SIZE:-4}"
CONTEXT_PARALLEL_SIZE="${CONTEXT_PARALLEL_SIZE:-2}"
PIPELINE_MODEL_PARALLEL_SIZE="${PIPELINE_MODEL_PARALLEL_SIZE:-1}"
EXPERT_MODEL_PARALLEL_SIZE="${EXPERT_MODEL_PARALLEL_SIZE:-1}"

NUM_TRAIN_EPOCHS="${NUM_TRAIN_EPOCHS:-4}"
MICRO_BATCH_SIZE="${MICRO_BATCH_SIZE:-1}"
GLOBAL_BATCH_SIZE="${GLOBAL_BATCH_SIZE:-64}"
MAX_LENGTH="${MAX_LENGTH:-131072}"
MAX_PIXELS="${MAX_PIXELS:-131072}"
LR="${LR:-2e-5}"
MIN_LR="${MIN_LR:-5e-7}"
LR_WARMUP_FRACTION="${LR_WARMUP_FRACTION:-0.05}"
WEIGHT_DECAY="${WEIGHT_DECAY:-0.1}"
SAVE_STEPS="${SAVE_STEPS:-100}"
LOGGING_STEPS="${LOGGING_STEPS:-5}"
EVAL_STEPS="${EVAL_STEPS:-50000000}"

PACKING="${PACKING:-true}"
TRUNCATION_STRATEGY="${TRUNCATION_STRATEGY:-delete}"
FREEZE_VIT="${FREEZE_VIT:-true}"
FREEZE_ALIGNER="${FREEZE_ALIGNER:-true}"
SAVE_OPTIMIZER="${SAVE_OPTIMIZER:-true}"
SAVE_RNG="${SAVE_RNG:-true}"
LOAD_FROM_CACHE_FILE="${LOAD_FROM_CACHE_FILE:-true}"
REPORT_TO="${REPORT_TO:-tensorboard}"

require_bool PACKING
require_bool FREEZE_VIT
require_bool FREEZE_ALIGNER
require_bool SAVE_OPTIMIZER
require_bool SAVE_RNG
require_bool LOAD_FROM_CACHE_FILE

DATASET_NUM_PROC="${DATASET_NUM_PROC:-128}"
DATALOADER_NUM_WORKERS="${DATALOADER_NUM_WORKERS:-8}"
CACHE_ROOT="${CACHE_ROOT:-${ROOT_DIR}/.cache}"
export MODELSCOPE_CACHE="${MODELSCOPE_CACHE:-${CACHE_ROOT}/modelscope}"
export PACKING_CACHE="${PACKING_CACHE:-${CACHE_ROOT}/packing}"
export HF_DATASETS_CACHE="${HF_DATASETS_CACHE:-${CACHE_ROOT}/hf_datasets_rank${NODE_RANK}}"
mkdir -p "${OUTPUT_DIR}" "${MODELSCOPE_CACHE}" "${PACKING_CACHE}" "${HF_DATASETS_CACHE}"

export NCCL_NVLS_ENABLE="${NCCL_NVLS_ENABLE:-0}"
export NCCL_CUMEM_ENABLE="${NCCL_CUMEM_ENABLE:-0}"
export NCCL_ALGO="${NCCL_ALGO:-Ring}"
export NCCL_PROTO="${NCCL_PROTO:-Simple}"
export CUDA_DEVICE_MAX_CONNECTIONS="${CUDA_DEVICE_MAX_CONNECTIONS:-1}"
export OMP_NUM_THREADS="${OMP_NUM_THREADS:-16}"
if [[ -n "${NCCL_SOCKET_IFNAME:-}" ]]; then export NCCL_SOCKET_IFNAME; fi
if [[ -n "${GLOO_SOCKET_IFNAME:-}" ]]; then export GLOO_SOCKET_IFNAME; fi

COMMON_ARGS=(
    --model "${MODEL_PATH}"
    --save_safetensors true
    --dataset "${DATASET}"
    --load_from_cache_file "${LOAD_FROM_CACHE_FILE}"
    --tensor_model_parallel_size "${TENSOR_MODEL_PARALLEL_SIZE}"
    --context_parallel_size "${CONTEXT_PARALLEL_SIZE}"
    --pipeline_model_parallel_size "${PIPELINE_MODEL_PARALLEL_SIZE}"
    --sequence_parallel true
    --micro_batch_size "${MICRO_BATCH_SIZE}"
    --global_batch_size "${GLOBAL_BATCH_SIZE}"
    --overlap_grad_reduce true
    --overlap_param_gather true
    --recompute_granularity full
    --recompute_method uniform
    --recompute_num_layers 1
    --finetune true
    --cross_entropy_loss_fusion true
    --lr "${LR}"
    --lr_warmup_fraction "${LR_WARMUP_FRACTION}"
    --min_lr "${MIN_LR}"
    --weight_decay "${WEIGHT_DECAY}"
    --max_length "${MAX_LENGTH}"
    --truncation_strategy "${TRUNCATION_STRATEGY}"
    --max_pixels "${MAX_PIXELS}"
    --packing "${PACKING}"
    --dataset_num_proc "${DATASET_NUM_PROC}"
    --freeze_vit "${FREEZE_VIT}"
    --freeze_aligner "${FREEZE_ALIGNER}"
    --attention_backend flash
    --report_to "${REPORT_TO}"
)

case "${SWIFT_RUNTIME}" in
    bundled)
        export PYTHONPATH="${ROOT_DIR}/ms-swift:${ROOT_DIR}/Megatron-LM:${ROOT_DIR}/mbridge:${PYTHONPATH:-}"
        export MEGATRON_LM_PATH="${ROOT_DIR}/Megatron-LM"
        DDP_BACKEND="${DDP_BACKEND:-cpu:gloo,cuda:nccl}"
        COMMAND=("${PYTHON_BIN}" -m swift.cli._megatron.main sft)
        RUNTIME_ARGS=(
            --load_safetensors true
            --ddp_backend "${DDP_BACKEND}"
            --save "${OUTPUT_DIR}"
            --eval_interval "${EVAL_STEPS}"
            --save_interval "${SAVE_STEPS}"
            --num_workers "${DATALOADER_NUM_WORKERS}"
        )
        ;;
    installed)
        DDP_BACKEND="${DDP_BACKEND:-nccl}"
        MEGATRON_BIN="${MEGATRON_BIN:-megatron}"
        if ! command -v "${MEGATRON_BIN}" >/dev/null 2>&1; then
            echo "ERROR: megatron CLI not found: ${MEGATRON_BIN}" >&2
            exit 1
        fi
        COMMAND=("${MEGATRON_BIN}" sft)
        RUNTIME_ARGS=(
            --ddp_backend "${DDP_BACKEND}"
            --output_dir "${OUTPUT_DIR}"
            --eval_steps "${EVAL_STEPS}"
            --save_steps "${SAVE_STEPS}"
            --dataloader_num_workers "${DATALOADER_NUM_WORKERS}"
            --logging_steps "${LOGGING_STEPS}"
        )
        ;;
    *)
        echo "ERROR: SWIFT_RUNTIME must be bundled or installed." >&2
        exit 1
        ;;
esac

if [[ -n "${MAX_STEPS:-}" ]]; then
    RUNTIME_ARGS+=(--train_iters "${MAX_STEPS}")
elif [[ "${SWIFT_RUNTIME}" == "bundled" ]]; then
    RUNTIME_ARGS+=(--max_epochs "${NUM_TRAIN_EPOCHS}")
else
    RUNTIME_ARGS+=(--num_train_epochs "${NUM_TRAIN_EPOCHS}")
fi

if [[ "${SAVE_OPTIMIZER}" == "false" ]]; then
    RUNTIME_ARGS+=(--no_save_optim true)
fi
if [[ "${SAVE_RNG}" == "false" ]]; then
    RUNTIME_ARGS+=(--no_save_rng true)
fi

if (( EXPERT_MODEL_PARALLEL_SIZE > 1 )); then
    RUNTIME_ARGS+=(
        --expert_model_parallel_size "${EXPERT_MODEL_PARALLEL_SIZE}"
        --moe_permute_fusion "${MOE_PERMUTE_FUSION:-true}"
        --moe_grouped_gemm "${MOE_GROUPED_GEMM:-true}"
        --moe_shared_expert_overlap "${MOE_SHARED_EXPERT_OVERLAP:-true}"
        --moe_aux_loss_coeff "${MOE_AUX_LOSS_COEFF:-1e-6}"
        --moe_expert_capacity_factor "${MOE_EXPERT_CAPACITY_FACTOR:-2}"
    )
fi

if [[ -n "${EXTRA_ARGS:-}" ]]; then
    read -r -a EXTRA_ARRAY <<< "${EXTRA_ARGS}"
    RUNTIME_ARGS+=("${EXTRA_ARRAY[@]}")
fi

export NNODES NODE_RANK NPROC_PER_NODE MASTER_ADDR MASTER_PORT

echo "DeepVoyager-VL SFT"
echo "  runtime: ${SWIFT_RUNTIME}"
echo "  model:   ${MODEL_PATH}"
echo "  dataset: ${DATASET}"
echo "  output:  ${OUTPUT_DIR}"
echo "  nodes:   ${NNODES}, rank: ${NODE_RANK}, gpus/node: ${NPROC_PER_NODE}"

exec "${COMMAND[@]}" "${COMMON_ARGS[@]}" "${RUNTIME_ARGS[@]}"
