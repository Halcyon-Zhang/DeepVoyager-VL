#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

for name in IMAGE MODEL_PATH DATASET OUTPUT_DIR; do
    if [[ -z "${!name:-}" ]]; then
        echo "ERROR: ${name} is required." >&2
        exit 1
    fi
done

if [[ ! -e "${MODEL_PATH}" ]]; then
    echo "ERROR: MODEL_PATH does not exist: ${MODEL_PATH}" >&2
    exit 1
fi
if [[ ! -f "${DATASET}" ]]; then
    echo "ERROR: DATASET does not exist: ${DATASET}" >&2
    exit 1
fi

mkdir -p "${OUTPUT_DIR}"
CACHE_ROOT="${CACHE_ROOT:-${OUTPUT_DIR}/.cache}"
mkdir -p "${CACHE_ROOT}"

DOCKER_ARGS=(
    --rm
    --name "${CONTAINER_NAME:-deepvoyager_sft_rank${NODE_RANK:-0}}"
    --network host
    --ipc host
    --shm-size "${DOCKER_SHM_SIZE:-512g}"
    --ulimit memlock=-1
    --ulimit stack=67108864
    -v "${ROOT_DIR}:${ROOT_DIR}:ro"
    -v "${MODEL_PATH}:${MODEL_PATH}:ro"
    -v "${DATASET}:${DATASET}:ro"
    -v "${OUTPUT_DIR}:${OUTPUT_DIR}"
    -v "${CACHE_ROOT}:${CACHE_ROOT}"
    -w "${ROOT_DIR}"
)

case "${DOCKER_GPU_MODE:-all}" in
    all) DOCKER_ARGS+=(--gpus all) ;;
    none) ;;
    *) echo "ERROR: DOCKER_GPU_MODE must be all or none." >&2; exit 1 ;;
esac

if [[ "${DOCKER_PRIVILEGED:-false}" == "true" ]]; then
    DOCKER_ARGS+=(--privileged)
fi
if [[ -n "${MEDIA_ROOT:-}" ]]; then
    if [[ ! -d "${MEDIA_ROOT}" ]]; then
        echo "ERROR: MEDIA_ROOT does not exist: ${MEDIA_ROOT}" >&2
        exit 1
    fi
    DOCKER_ARGS+=(-v "${MEDIA_ROOT}:${MEDIA_ROOT}:ro")
fi
if [[ -n "${EXTRA_DOCKER_ARGS:-}" ]]; then
    read -r -a EXTRA_DOCKER_ARRAY <<< "${EXTRA_DOCKER_ARGS}"
    DOCKER_ARGS+=("${EXTRA_DOCKER_ARRAY[@]}")
fi

FORWARD_VARS=(
    MODEL_PATH DATASET OUTPUT_DIR CACHE_ROOT MEDIA_ROOT
    SWIFT_RUNTIME MEGATRON_BIN
    NNODES NODE_RANK NPROC_PER_NODE MASTER_ADDR MASTER_PORT
    TENSOR_MODEL_PARALLEL_SIZE CONTEXT_PARALLEL_SIZE PIPELINE_MODEL_PARALLEL_SIZE
    EXPERT_MODEL_PARALLEL_SIZE
    NUM_TRAIN_EPOCHS MAX_STEPS MICRO_BATCH_SIZE GLOBAL_BATCH_SIZE
    MAX_LENGTH MAX_PIXELS LR MIN_LR LR_WARMUP_FRACTION WEIGHT_DECAY
    SAVE_STEPS LOGGING_STEPS EVAL_STEPS PACKING TRUNCATION_STRATEGY
    FREEZE_VIT FREEZE_ALIGNER SAVE_OPTIMIZER SAVE_RNG REPORT_TO
    DATASET_NUM_PROC DATALOADER_NUM_WORKERS LOAD_FROM_CACHE_FILE
    MODELSCOPE_CACHE PACKING_CACHE HF_DATASETS_CACHE
    MOE_PERMUTE_FUSION MOE_GROUPED_GEMM MOE_SHARED_EXPERT_OVERLAP
    MOE_AUX_LOSS_COEFF MOE_EXPERT_CAPACITY_FACTOR EXTRA_ARGS
    NCCL_SOCKET_IFNAME GLOO_SOCKET_IFNAME NCCL_NVLS_ENABLE NCCL_CUMEM_ENABLE
    NCCL_ALGO NCCL_PROTO DDP_BACKEND CUDA_DEVICE_MAX_CONNECTIONS OMP_NUM_THREADS
)
for var in "${FORWARD_VARS[@]}"; do
    if [[ -n "${!var:-}" ]]; then
        DOCKER_ARGS+=(-e "${var}")
    fi
done

DOCKER_ARGS+=(-e "SWIFT_RUNTIME=${SWIFT_RUNTIME:-installed}" -e PYTHON_BIN=python3)

exec docker run "${DOCKER_ARGS[@]}" "${IMAGE}" bash scripts/train_sft.sh

