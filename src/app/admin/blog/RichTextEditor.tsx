"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "react-hot-toast";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

interface RichTextEditorProps {
  content: string;
  onContentChange: (value: string) => void;
  error?: string;
}

export default function RichTextEditor({ content, onContentChange, error }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const placeCaretInside = (el: HTMLElement, atEnd = false) => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(atEnd);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
  };

  const moveCaretAfterFigure = (figure: Element | HTMLElement) => {
    const htmlElement = figure as HTMLElement;
    
    if (!htmlElement.nextSibling && htmlElement.parentNode) {
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      htmlElement.parentNode.insertBefore(p, htmlElement.nextSibling);
    }

    const sel = window.getSelection();
    if (!sel) return;
    
    const range = document.createRange();
    range.setStartAfter(htmlElement);
    range.collapse(true);
    
    sel.removeAllRanges();
    sel.addRange(range);
    editorRef.current?.focus();
  };

  const insertImage = (url: string) => {
    const capId = `cap-${Date.now()}`;
    execCommand(
      "insertHTML",
      `
      <figure class="editor-figure" contenteditable="false" style="margin:8px 0; text-align:center;">
        <img src="${url}" style="max-width:100%; border-radius:6px; display:inline-block;" />
        <figcaption 
          id="${capId}" 
          data-caption 
          data-placeholder="Nhập nội dung ghi chú (Không bắt buộc)" 
          contenteditable="true" 
          style="display:block; margin-top:6px; outline:none; min-height:1.2em; color: #475569;"
        ></figcaption>
      </figure>
      `
    );

    setTimeout(() => {
      const cap = editorRef.current?.querySelector<HTMLElement>(`#${capId}`);
      if (cap) placeCaretInside(cap, false);
    }, 50);
  };

  const insertVideo = (url: string) => {
    const capId = `cap-${Date.now()}`;
    execCommand(
      "insertHTML",
      `
      <figure class="editor-figure" contenteditable="false" style="margin:8px 0; text-align:center;">
        <video controls src="${url}" style="max-width:100%; border-radius:6px; display:inline-block;"></video>
        <figcaption 
          id="${capId}" 
          data-caption 
          data-placeholder="Nhập nội dung ghi chú (Không bắt buộc)" 
          contenteditable="true" 
          style="display:block; margin-top:6px; outline:none; min-height:1.2em; color: #475569;"
        ></figcaption>
      </figure>
      `
    );

    setTimeout(() => {
      const cap = editorRef.current?.querySelector<HTMLElement>(`#${capId}`);
      if (cap) placeCaretInside(cap, false);
    }, 50);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        } else {
          reject("Failed to read file");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Ảnh không được vượt quá 5MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      e.target.value = "";
      return;
    }

    const imageUrl = await readFileAsDataURL(file);
    insertImage(imageUrl);
    e.target.value = "";
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error("Video không được vượt quá 50MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video hợp lệ");
      e.target.value = "";
      return;
    }

    const videoUrl = await readFileAsDataURL(file);
    insertVideo(videoUrl);
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (e.key === "Enter" && target?.hasAttribute("data-caption")) {
      e.preventDefault();
      e.stopPropagation();

      const figure = target.closest(".editor-figure");
      if (figure) moveCaretAfterFigure(figure);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    editorRef.current?.querySelectorAll<HTMLElement>("[data-caption]").forEach((caption) => {
      if (caption.innerHTML.trim() === "<br>" || caption.innerHTML.trim() === "&nbsp;") {
        caption.innerHTML = "";
      }
    });
    
    onContentChange((e.target as HTMLDivElement).innerHTML);
  };

  useEffect(() => {
    if (editorRef.current) {
      const isFocused = document.activeElement === editorRef.current 
        || editorRef.current.contains(document.activeElement);

      if (!isFocused && content !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = content || "";
      }
    }
  }, [content]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-sm font-semibold text-slate-700">Nội dung bài viết <span className="text-red-500">*</span></span>
        <div className="flex gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button type="button" title="In đậm" className="cursor-pointer p-1.5 text-slate-600 hover:bg-white hover:shadow-sm hover:text-orange-600 rounded transition" onClick={() => execCommand("bold")}>
            <Bold size={16} />
          </button>
          <button type="button" title="In nghiêng" className="cursor-pointer p-1.5 text-slate-600 hover:bg-white hover:shadow-sm hover:text-orange-600 rounded transition" onClick={() => execCommand("italic")}>
            <Italic size={16} />
          </button>
          <button type="button" title="Gạch chân" className="cursor-pointer p-1.5 text-slate-600 hover:bg-white hover:shadow-sm hover:text-orange-600 rounded transition" onClick={() => execCommand("underline")}>
            <Underline size={16} />
          </button>
          <div className="w-px h-5 bg-slate-300 self-center mx-1"></div>
          <button type="button" title="Thêm hình" className="cursor-pointer p-1.5 text-slate-600 hover:bg-white hover:shadow-sm hover:text-orange-600 rounded transition" onClick={() => imageInputRef.current?.click()}>
            <ImageIcon size={16} />
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button type="button" title="Thêm video" className="cursor-pointer p-1.5 text-slate-600 hover:bg-white hover:shadow-sm hover:text-orange-600 rounded transition" onClick={() => videoInputRef.current?.click()}>
            <Video size={16} />
          </button>
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`w-full bg-slate-50 border rounded-xl p-4 outline-none transition-shadow h-[600px] overflow-y-auto leading-relaxed text-slate-800 ${
          error ? "border-red-400 focus:ring-2 focus:ring-red-400 focus:border-transparent" : "border-slate-200 focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white"
        }`}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
      
      {error && <p className="mt-1.5 ml-1 text-sm text-red-500 font-medium flex items-center gap-1"><i className="ri-error-warning-line"></i>{error}</p>}

      <style jsx global>{`
        [data-caption]:empty::before,
        [data-caption]:has(> br:only-child)::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          font-style: italic;
          pointer-events: none;
        }
        .editor-figure img,
        .editor-figure video {
          max-width: 100%;
          border-radius: 8px;
        }
        .editor-figure {
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}
