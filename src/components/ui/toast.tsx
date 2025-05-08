"use client"

import { toast as sonnerToast } from "sonner"

export const toast = sonnerToast

export const customToast = ({ title, description, status }: { title: string; description: string; status: "success" | "error" | "info" }) => {
  sonnerToast(
    <div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>,
    {
      className: status === "error" ? "bg-red-500 text-white" : status === "success" ? "bg-green-500 text-white" : "bg-blue-500 text-white",
    }
  );
};