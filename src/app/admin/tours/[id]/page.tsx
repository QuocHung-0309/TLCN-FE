"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  useOngoingTours,
  useSetLeader,
  useAddTimeline,
  useExpenses,
  useAddExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "@/app/admin/hooks/useAdmin";

export default function AdminTourDetail() {
  const { id } = useParams<{ id: string }>();
  const tourId = String(id);

  const { data: ongoing, isLoading } = useOngoingTours();
  const tour = useMemo(
    () => ongoing?.find((t: any) => String(t._id) === tourId),
    [ongoing, tourId]
  );

  const setLeader = useSetLeader(tourId);
  const addTimeline = useAddTimeline(tourId);

  const { data: expenses } = useExpenses(tourId);
  const addExp = useAddExpense(tourId);
  const updExp = useUpdateExpense(tourId);
  const delExp = useDeleteExpense(tourId);

  // form state
  const [leaderId, setLeaderId] = useState<string>(tour?.leader?._id ?? "");
  const [tlType, setTlType] = useState<
    "departed" | "arrived" | "checkpoint" | "note" | "finished"
  >("checkpoint");
  const [tlNote, setTlNote] = useState("");

  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expOccurredAt, setExpOccurredAt] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  if (isLoading) return <div className="p-6">Đang tải…</div>;
  if (!tour) return <div className="p-6">Không tìm thấy tour.</div>;

  return (
    <div className="mx-auto w-[92%] max-w-6xl py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">{tour.title}</h1>
        <p className="text-slate-600">
          Khởi hành:{" "}
          {tour.startDate
            ? new Date(tour.startDate).toLocaleString("vi-VN")
            : "—"}
        </p>
      </header>

      {/* Leader */}
      <section className="rounded-2xl border bg-white p-5 shadow">
        <h2 className="mb-3 text-lg font-semibold">Leader</h2>
        <div className="flex gap-3">
          <input
            className="w-80 rounded border px-3 py-2"
            placeholder="Nhập leaderId (tạm thời)"
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
          />
          <button
            className="rounded bg-emerald-600 px-4 py-2 text-white"
            onClick={() => setLeader.mutate(leaderId || null)}
          >
            Lưu leader
          </button>
        </div>
      </section>

      {/* Timeline */}
      <section className="rounded-2xl border bg-white p-5 shadow">
        <h2 className="mb-3 text-lg font-semibold">Thêm sự kiện timeline</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded border px-3 py-2"
            value={tlType}
            onChange={(e) => setTlType(e.target.value as any)}
          >
            <option value="departed">departed</option>
            <option value="arrived">arrived</option>
            <option value="checkpoint">checkpoint</option>
            <option value="note">note</option>
            <option value="finished">finished</option>
          </select>
          <input
            className="w-96 rounded border px-3 py-2"
            placeholder="Ghi chú"
            value={tlNote}
            onChange={(e) => setTlNote(e.target.value)}
          />
          <button
            className="rounded bg-sky-600 px-4 py-2 text-white"
            onClick={() =>
              addTimeline.mutate({ type: tlType, note: tlNote || undefined })
            }
          >
            Ghi sự kiện
          </button>
        </div>
      </section>

      {/* Expenses */}
      <section className="rounded-2xl border bg-white p-5 shadow space-y-4">
        <h2 className="text-lg font-semibold">Chi phí</h2>

        <div className="flex flex-wrap gap-3">
          <input
            className="w-56 rounded border px-3 py-2"
            placeholder="Tên chi phí"
            value={expTitle}
            onChange={(e) => setExpTitle(e.target.value)}
          />
          <input
            className="w-40 rounded border px-3 py-2"
            type="number"
            placeholder="Số tiền"
            value={expAmount}
            onChange={(e) => setExpAmount(Number(e.target.value))}
          />
          <input
            className="rounded border px-3 py-2"
            type="datetime-local"
            value={expOccurredAt}
            onChange={(e) => setExpOccurredAt(e.target.value)}
          />
          <button
            className="rounded bg-emerald-600 px-4 py-2 text-white"
            onClick={() =>
              addExp.mutate({
                title: expTitle,
                amount: Number(expAmount || 0),
                occurredAt: new Date(expOccurredAt).toISOString(),
              } as any)
            }
          >
            Thêm
          </button>
        </div>

        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Tên</th>
                <th className="px-3 py-2 text-left">Số tiền</th>
                <th className="px-3 py-2 text-left">Thời điểm</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {expenses?.map((e) => (
                <tr key={e._id} className="border-t">
                  <td className="px-3 py-2">{e.title}</td>
                  <td className="px-3 py-2">
                    {e.amount.toLocaleString("vi-VN")} VND
                  </td>
                  <td className="px-3 py-2">
                    {new Date(e.occurredAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="mr-2 rounded border px-2 py-1"
                      onClick={() => {
                        const newTitle = prompt("Sửa tên", e.title) ?? e.title;
                        const newAmount = Number(
                          prompt("Sửa số tiền", String(e.amount)) ?? e.amount
                        );
                        updExp.mutate({
                          id: e._id,
                          patch: { title: newTitle, amount: newAmount },
                        });
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="rounded bg-rose-600 px-2 py-1 text-white"
                      onClick={() => delExp.mutate(e._id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {!expenses?.length && (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={4}>
                    Chưa có chi phí.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
