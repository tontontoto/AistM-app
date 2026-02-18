"use client";

import React, { useMemo } from "react";
import {
    Chart as ChartJS,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    type ChartOptions,
    type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export type GanttRow = {
    id: number;
    label: string; // y軸ラベル（ユニークになるように）
    startMs: number;
    endMs: number;
    color: string;
    meta: {
        project?: string;
        task?: string;
        assignee?: string;
        status?: string;
        priority?: string;
    };
};

const DAY_MS = 24 * 60 * 60 * 1000;
const PIXELS_PER_DAY = 5; // 要件: 1日あたりの横幅は5px
const VIEWPORT_ROWS = 10; // 要件: タスク数10まではスクロール無し
const ROW_PX = 28; // 1行あたりの高さの目安
const AXIS_PADDING_PX = 80; // 軸/余白の目安
const LABEL_AREA_PX = 320; // y軸ラベルぶんの横余白（概算）
const MIN_VISIBLE_DAYS = 200; // チャート全体の幅を確保（右端は最遠期日を維持）
const MIN_TICK_LABEL_PX = 36; // 日付ラベル同士の最低間隔（狭すぎる問題の対策）

function formatIsoSecondFromMs(ms: number): string {
    return new Date(ms).toISOString().slice(0, 19).replace("T", " ");
}

function formatShortDateFromMs(ms: number): string {
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    // 目盛りは短く（幅が小さすぎる問題の対策）
    return `${mm}/${dd}`;
}

export default function GanttChartClient({ rows }: { rows: GanttRow[] }) {
    const totalRows = rows.length;
    const hasVerticalScroll = totalRows > VIEWPORT_ROWS;
    // 表示領域（スクロールなし時も「10分割（10行分）」の縦サイズを確保）
    const viewportHeightPx = Math.max(220, VIEWPORT_ROWS * ROW_PX + AXIS_PADDING_PX);
    const totalHeightPx = Math.max(viewportHeightPx, totalRows * ROW_PX + AXIS_PADDING_PX);
    const heightPx = hasVerticalScroll ? totalHeightPx : viewportHeightPx;

    const domain = useMemo(() => {
        if (rows.length === 0) {
            const now = Date.now();
            const todayUtcStart = Math.floor(now / DAY_MS) * DAY_MS;
            return {
                min: todayUtcStart,
                max: todayUtcStart + DAY_MS,
                days: 2,
                widthPx: LABEL_AREA_PX + 2 * PIXELS_PER_DAY,
            };
        }

        const minFromData = Math.min(...rows.map((r) => r.startMs));
        const maxFromData = Math.max(...rows.map((r) => r.endMs));

        let min = Math.floor(minFromData / DAY_MS) * DAY_MS;
        // 要件: 右端は一番終わりが遠い日付まで（未来バッファ無し）
        const max = Math.ceil(maxFromData / DAY_MS) * DAY_MS;

        // 幅が小さすぎる場合は左側（過去）を拡張して全体幅を確保する
        const daysFromData = Math.max(1, Math.round((max - min) / DAY_MS) + 1);
        if (daysFromData < MIN_VISIBLE_DAYS) {
            min = max - (MIN_VISIBLE_DAYS - 1) * DAY_MS;
        }

        const days = Math.max(1, Math.round((max - min) / DAY_MS) + 1);
        const widthPx = LABEL_AREA_PX + days * PIXELS_PER_DAY;

        return { min, max, days, widthPx };
    }, [rows]);

    const chartData = useMemo(() => {
        return {
            labels: rows.map((row) => row.label),
            datasets: [
                {
                    label: "タスク",
                    // floating bar: [start, end]
                    data: rows.map((row) => [row.startMs, row.endMs]),
                    backgroundColor: rows.map((row) => row.color),
                    borderColor: rows.map((row) => row.color),
                    borderWidth: 1,
                    borderSkipped: false,
                    barPercentage: 0.9,
                    categoryPercentage: 0.9,
                },
            ],
        };
    }, [rows]);

    const options: ChartOptions<"bar"> = useMemo(() => {
        // 1日=5px のままだと日付ラベルが詰まりすぎるので、
        // 「最低◯px間隔」を満たす日数単位でラベルを間引く。
        const labelEvery = Math.max(1, Math.ceil(MIN_TICK_LABEL_PX / PIXELS_PER_DAY));
        return {
            // 親要素の幅に追従させる（親側で minWidth=100% を保証しつつ、必要なら横スクロール）
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            indexAxis: "y",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title(items: TooltipItem<"bar">[]) {
                            const index = items[0]?.dataIndex ?? -1;
                            const row = rows[index];
                            const project = row?.meta?.project || "プロジェクト不明";
                            const task = row?.meta?.task || "タスク";
                            return `${project} / ${task}`;
                        },
                        label(context) {
                            const row = rows[context.dataIndex];
                            if (!row) return [];
                            const startMs = row.startMs;
                            const endMs = row.endMs;
                            const assignee = row.meta?.assignee ? `担当: ${row.meta.assignee}` : undefined;
                            const status = row.meta?.status ? `状態: ${row.meta.status}` : undefined;
                            const priority = row.meta?.priority ? `優先: ${row.meta.priority}` : undefined;
                            const period = `期間: ${formatShortDateFromMs(startMs)} 〜 ${formatShortDateFromMs(endMs)}`;
                            return [period, assignee, status, priority].filter(Boolean) as string[];
                        },
                    },
                },
            },
            scales: {
                x: {
                    type: "linear",
                    min: domain.min,
                    max: domain.max,
                    ticks: {
                        maxRotation: 0,
                        // 要件: 1日スパンで目盛り（ラベルは見やすさのため間引き）
                        stepSize: DAY_MS,
                        autoSkip: false,
                        callback(value) {
                            const n = typeof value === "string" ? Number(value) : (value as number);
                            const dayIndex = Math.round((n - domain.min) / DAY_MS);
                            // 端は必ず表示（スクロール時に範囲がわかる）
                            if (dayIndex === 0 || dayIndex === domain.days - 1) return formatShortDateFromMs(n);
                            if (dayIndex % labelEvery !== 0) return "";
                            return formatShortDateFromMs(n);
                        },
                    },
                    grid: {
                        color: "rgba(0,0,0,0.06)",
                    },
                },
                y: {
                    ticks: {
                        autoSkip: false,
                        font: { size: 11 },
                    },
                    grid: {
                        display: false,
                    },
                },
            },
        };
    }, [rows, domain]);

    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            <div className="overflow-x-auto">
                <div
                    className={hasVerticalScroll ? "overflow-y-auto" : ""}
                    style={{ maxHeight: hasVerticalScroll ? viewportHeightPx : undefined }}
                >
                    <div
                        style={{
                            // データ範囲が短くても枠いっぱいに広げる
                            minWidth: "100%",
                            width: domain.widthPx,
                            height: heightPx,
                        }}
                    >
                        <Bar options={options} data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

