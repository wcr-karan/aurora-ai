"use client";

import { motion } from "framer-motion";
import {
  FileStack,
  FileText,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
import { PageContainer, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Skeleton } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/client";
import { cn, formatBytes, timeAgo } from "@/lib/utils";

interface Doc {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  status: string;
  chunkCount: number;
  refCount: number;
  error?: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  PDF: "#f43f5e",
  DOCX: "#6366f1",
  TXT: "#64748b",
  MD: "#0ea5e9",
};

export default function KnowledgeBasePage() {
  const { data, loading, reload } = useApi<Doc[]>("/api/documents");
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  async function upload(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading(true);
    const form = new FormData();
    arr.forEach((f) => form.append("files", f));
    const r = await api.upload<{ uploaded: { name: string; ok: boolean; chunks: number; error?: string }[] }>(
      "/api/documents",
      form
    );
    setUploading(false);
    if (!r.ok) {
      toast.push(r.error ?? "Upload failed", "error");
      return;
    }
    const results = r.data?.uploaded ?? [];
    const okCount = results.filter((x) => x.ok).length;
    const failed = results.filter((x) => !x.ok);
    if (okCount) toast.push(`Indexed ${okCount} document${okCount === 1 ? "" : "s"}`, "success");
    failed.forEach((f) => toast.push(`${f.name}: ${f.error}`, "error"));
    reload();
  }

  async function remove(id: string, name: string) {
    const r = await api.del(`/api/documents/${id}`);
    if (r.ok) {
      toast.push(`Deleted ${name}`, "success");
      reload();
    } else toast.push(r.error ?? "Delete failed", "error");
  }

  async function reindexOne(id: string) {
    const r = await api.post(`/api/documents/${id}/reindex`);
    if (r.ok) {
      toast.push("Re-indexed", "success");
      reload();
    } else toast.push(r.error ?? "Re-index failed", "error");
  }

  async function reindexAll() {
    setReindexing(true);
    const r = await api.post<{ documents: number; chunks: number }>("/api/documents/reindex");
    setReindexing(false);
    if (r.ok) {
      toast.push(`Re-indexed ${r.data?.documents ?? 0} documents`, "success");
      reload();
    } else toast.push(r.error ?? "Re-index failed", "error");
  }

  const docs = data ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Knowledge Base"
        subtitle="Upload the documents your assistant answers from."
        actions={
          docs.length > 0 && (
            <Button variant="outline" size="sm" onClick={reindexAll} loading={reindexing}>
              <RefreshCw size={15} /> Re-index all
            </Button>
          )
        }
      />

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragging
            ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
            : "border-[var(--color-border-strong)] bg-[var(--color-bg-2)]/40 hover:border-[var(--color-primary)]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.markdown"
          className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
        <motion.div
          animate={uploading ? { y: [0, -6, 0] } : {}}
          transition={{ repeat: uploading ? Infinity : 0, duration: 1 }}
          className="grid size-14 place-items-center rounded-2xl bg-[var(--color-surface)] text-primary"
        >
          <UploadCloud size={26} />
        </motion.div>
        <div>
          <p className="font-medium text-ink">
            {uploading ? "Parsing, chunking & embedding…" : "Drop files here, or click to browse"}
          </p>
          <p className="mt-1 text-[0.8rem] text-ink-faint">PDF · DOCX · TXT · Markdown — up to 15 MB each</p>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <EmptyState
            icon={<FileStack size={22} />}
            title="No documents yet"
            description="Upload your help center articles, policies, or product docs to train the assistant."
          />
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-2)] text-left text-[0.74rem] uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Document</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Chunks</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Used</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Added</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)]/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-lg text-[0.62rem] font-bold"
                          style={{
                            color: TYPE_COLORS[d.type] ?? "#64748b",
                            background: `color-mix(in oklch, ${TYPE_COLORS[d.type] ?? "#64748b"} 16%, transparent)`,
                          }}
                        >
                          {d.type}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink">{d.name}</div>
                          <div className="text-[0.72rem] text-ink-faint">{formatBytes(d.sizeBytes)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <StatusPill status={d.status} error={d.error} />
                    </td>
                    <td className="hidden px-4 py-3 text-ink-2 md:table-cell mono">{d.chunkCount}</td>
                    <td className="hidden px-4 py-3 text-ink-2 lg:table-cell mono">{d.refCount}×</td>
                    <td className="hidden px-4 py-3 text-ink-3 lg:table-cell">{timeAgo(d.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => reindexOne(d.id)}
                          className="grid size-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-[var(--color-surface-2)] hover:text-primary"
                          title="Re-index"
                        >
                          <RefreshCw size={15} />
                        </button>
                        <button
                          onClick={() => remove(d.id, d.name)}
                          className="grid size-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-center gap-2 text-[0.78rem] text-ink-faint">
        <FileText size={13} />
        Each document is parsed, split into overlapping chunks, embedded, and stored as searchable vectors.
      </p>
    </PageContainer>
  );
}

function StatusPill({ status, error }: { status: string; error?: string | null }) {
  if (status === "INDEXED") return <Badge color="var(--color-success)">Indexed</Badge>;
  if (status === "PROCESSING") return <Badge color="var(--color-warning)">Processing</Badge>;
  return (
    <span title={error ?? "Failed"}>
      <Badge color="var(--color-danger)">Failed</Badge>
    </span>
  );
}
