"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  value,
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [pending, startTransition] = useTransition();

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Enter a valid image URL");
      return;
    }
    if (value.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images`);
      return;
    }
    if (value.includes(url)) {
      toast.error("Image already added");
      return;
    }
    onChange([...value, url]);
    setUrlInput("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    startTransition(async () => {
      const uploaded: string[] = [];
      for (const file of selected) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Upload failed — paste an image URL instead");
          continue;
        }
        uploaded.push(data.url);
      }
      if (uploaded.length) {
        onChange([...value, ...uploaded]);
        toast.success(
          uploaded.length === 1
            ? "Image uploaded"
            : `${uploaded.length} images uploaded`
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      <Label>Product images</Label>
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute right-1.5 top-1.5 opacity-90"
                onClick={() => removeAt(index)}
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste image URL (https://…)"
          className="rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={addUrl}
        >
          Add URL
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl"
          disabled={pending || value.length >= maxImages}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {pending ? "Uploading…" : "Upload images"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Cloudinary when configured, or paste URLs. Max {maxImages}.
        </p>
      </div>
    </div>
  );
}
