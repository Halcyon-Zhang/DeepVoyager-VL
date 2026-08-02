#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
HOSTFILE="${1:-${HOSTFILE:-}}"

if [[ -z "${HOSTFILE}" || ! -f "${HOSTFILE}" ]]; then
    echo "Usage: $0 /path/to/hosts.txt" >&2
    exit 1
fi

mapfile -t HOSTS < <(awk 'NF && $1 !~ /^#/ {print $1}' "${HOSTFILE}")
if [[ "${#HOSTS[@]}" -eq 0 ]]; then
    echo "ERROR: no hosts found in ${HOSTFILE}" >&2
    exit 1
fi

NNODES="${NNODES:-${#HOSTS[@]}}"
if [[ "${NNODES}" -ne "${#HOSTS[@]}" ]]; then
    echo "ERROR: NNODES=${NNODES}, host count=${#HOSTS[@]}" >&2
    exit 1
fi

MASTER_ADDR="${MASTER_ADDR:-${HOSTS[0]#*@}}"
MASTER_PORT="${MASTER_PORT:-29500}"
NPROC_PER_NODE="${NPROC_PER_NODE:-8}"
REMOTE_ROOT="${REMOTE_ROOT:-${ROOT_DIR}}"
LAUNCH_MODE="${LAUNCH_MODE:-local}"
RUN_ID="${RUN_ID:-$(date +%Y%m%d_%H%M%S)}"
LOG_DIR="${LOG_DIR:-${REMOTE_ROOT}/runs/${RUN_ID}}"
SSH_OPTS="${SSH_OPTS:--o StrictHostKeyChecking=no -o ServerAliveInterval=30}"

case "${LAUNCH_MODE}" in
    local) ENTRY_SCRIPT="scripts/train_sft.sh" ;;
    docker) ENTRY_SCRIPT="scripts/docker_run.sh" ;;
    *) echo "ERROR: LAUNCH_MODE must be local or docker." >&2; exit 1 ;;
esac

shell_quote() {
    printf '%q' "$1"
}

remote_exports() {
    local rank="$1"
    local exports=""
    local vars=(
        MODEL_PATH DATASET OUTPUT_DIR CACHE_ROOT MEDIA_ROOT
        SWIFT_RUNTIME PYTHON_BIN MEGATRON_BIN IMAGE
        MASTER_ADDR MASTER_PORT NNODES NPROC_PER_NODE
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
        DOCKER_GPU_MODE DOCKER_PRIVILEGED DOCKER_SHM_SIZE EXTRA_DOCKER_ARGS
    )

    exports+="export NODE_RANK=$(shell_quote "${rank}"); "
    for var in "${vars[@]}"; do
        if [[ -n "${!var:-}" ]]; then
            exports+="export ${var}=$(shell_quote "${!var}"); "
        fi
    done
    printf '%s' "${exports}"
}

echo "DeepVoyager-VL multinode launch"
echo "  mode:      ${LAUNCH_MODE}"
echo "  master:    ${MASTER_ADDR}:${MASTER_PORT}"
echo "  nodes:     ${NNODES}"
echo "  root:      ${REMOTE_ROOT}"
echo "  log dir:   ${LOG_DIR}"

read -r -a SSH_ARGS <<< "${SSH_OPTS}"

for rank in "${!HOSTS[@]}"; do
    host="${HOSTS[rank]}"
    safe_host="${host//[^A-Za-z0-9_.-]/_}"
    log_file="${LOG_DIR}/node${rank}_${safe_host}.log"
    pid_file="${LOG_DIR}/node${rank}_${safe_host}.pid"

    remote_cmd="set -e; "
    remote_cmd+="cd $(shell_quote "${REMOTE_ROOT}"); "
    remote_cmd+="mkdir -p $(shell_quote "${LOG_DIR}"); "
    remote_cmd+="$(remote_exports "${rank}") "
    remote_cmd+="nohup bash $(shell_quote "${ENTRY_SCRIPT}") > $(shell_quote "${log_file}") 2>&1 < /dev/null & "
    remote_cmd+="echo \$! > $(shell_quote "${pid_file}"); "
    remote_cmd+="echo started rank ${rank} pid \$(cat $(shell_quote "${pid_file}"))"

    echo "Starting rank=${rank} host=${host}"
    if [[ "${DRY_RUN:-0}" == "1" ]]; then
        echo "ssh ${SSH_OPTS} ${host} bash -lc $(shell_quote "${remote_cmd}")"
    else
        ssh "${SSH_ARGS[@]}" "${host}" "bash -lc $(shell_quote "${remote_cmd}")"
    fi
done

echo "All launch commands submitted."
echo "Master log: ${LOG_DIR}/node0_${HOSTS[0]//[^A-Za-z0-9_.-]/_}.log"
