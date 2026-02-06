"use client";

import {
  useMemo,
  useRef,
  useState,
  useCallback,
  type ComponentType,
  type Ref,
} from "react";
import dynamic from "next/dynamic";
import type ReactQuillType from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type ReactQuillWithRef = ComponentType<{
  ref?: Ref<ReactQuillType>;
  theme?: string;
  value?: string;
  onChange?: (html: string) => void;
  modules?: Record<string, unknown>;
  className?: string;
}>;

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
}) as unknown as ReactQuillWithRef;

export type QuillEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onRequestImageUpload: () => Promise<string | null>;
  onRequestImagePick: () => Promise<string | null>;
};

export const QuillEditor = ({
  value,
  onChange,
  onRequestImageUpload,
  onRequestImagePick,
}: QuillEditorProps) => {
  const quillRef = useRef<ReactQuillType | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const insertImage = useCallback((url: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range?.index ?? editor.getLength();
    editor.insertEmbed(index, "image", url, "user");
    editor.setSelection(index + 1, 0);
  }, []);

  const handleImageAction = useCallback(
    async (action: "upload" | "library") => {
      setImageDialogOpen(false);
      const url =
        action === "upload"
          ? await onRequestImageUpload()
          : await onRequestImagePick();
      if (url) {
        insertImage(url);
      }
    },
    [insertImage, onRequestImagePick, onRequestImageUpload],
  );

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: () => setImageDialogOpen(true),
        },
      },
    }),
    [],
  );

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-200 bg-white">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          className="quill-editor"
        />
      </div>

      {imageDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-900">Obraz</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Wybierz źródło obrazka do wstawienia.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                onClick={() => handleImageAction("upload")}
              >
                Upload
              </button>
              <button
                type="button"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                onClick={() => handleImageAction("library")}
              >
                Biblioteka
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="text-sm text-zinc-500"
                onClick={() => setImageDialogOpen(false)}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
