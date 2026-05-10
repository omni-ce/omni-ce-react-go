import React, { useState } from "react";
import type { ProductItem } from "@/types/product";
import DynamicForm, { FileType } from "@/components/DynamicForm";
import { Button } from "@/components/ui/Button";
import { useLanguageStore } from "@/stores/languageStore";
import { IconComponent } from "@/components/ui/IconSelector";

export const ProductImage = ({
  row,
  onClose,
}: {
  row: ProductItem;
  onClose: () => void;
}) => {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  // Mock images data for UI demonstration
  const [images] = useState([
    { id: 1, url: "https://picsum.photos/400/400?random=1" },
    { id: 2, url: "https://picsum.photos/400/400?random=2" },
    { id: 3, url: "https://picsum.photos/400/400?random=3" },
    { id: 4, url: "https://picsum.photos/400/400?random=4" },
    { id: 5, url: "https://picsum.photos/400/400?random=5" },
  ]);

  const handleUpload = () => {
    if (!formData.image) return;
    setLoading(true);
    // Simulation
    setTimeout(() => {
      setLoading(false);
      alert("Image uploaded (mock)");
    }, 1500);
  };

  return (
    <div className="flex gap-8 min-h-120">
      {/* Left: Image List (70%) */}
      <div className="flex-7 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {language({ id: "Galeri Foto Produk", en: "Product Gallery" })}
            </h3>
            <p className="text-xs text-dark-400 mt-1">
              {row.brand_name} {row.varian_name}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-dark-800 border border-dark-600/40 rounded-full text-dark-300">
            {images.length} {language({ id: "Foto", en: "Photos" })}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-100">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-2xl border border-dark-600/40 bg-dark-900 overflow-hidden shadow-sm hover:border-accent-500/50 transition-all duration-300"
            >
              <img
                src={img.url}
                alt="Product"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <button
                  className="w-9 h-9 rounded-full bg-neon-red text-white flex items-center justify-center hover:bg-neon-red/80 transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
                  title="Delete image"
                >
                  <IconComponent iconName="Hi/HiOutlineTrash" size={18} />
                </button>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-3 py-24 flex flex-col items-center justify-center text-dark-400 border-2 border-dashed border-dark-600/30 rounded-3xl bg-dark-900/30">
              <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
                <IconComponent
                  iconName="Hi/HiOutlinePhotograph"
                  size={32}
                  className="opacity-30"
                />
              </div>
              <p className="text-sm font-medium">No images uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="w-px bg-linear-to-b from-transparent via-dark-600/40 to-transparent" />

      {/* Right: Upload Section (30%) */}
      <div className="flex-3 flex flex-col gap-6 pt-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-accent-500/10 border border-accent-500/20 text-accent-500 text-[10px] font-bold uppercase tracking-widest">
            <IconComponent iconName="Hi/HiOutlinePlus" size={12} />
            <span>{language({ id: "Upload Baru", en: "New Upload" })}</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {language({ id: "Tambah Foto Baru", en: "Add New Photo" })}
          </h3>
          <p className="text-[11px] text-dark-400 leading-relaxed">
            Select a high-quality photo for your product. Max size 2MB.
          </p>
        </div>

        <div className="bg-dark-800/40 p-5 rounded-3xl border border-dark-600/30 backdrop-blur-sm shadow-inner">
          <DynamicForm
            fields={[
              {
                key: "image",
                label: language({ id: "Pilih Berkas", en: "Choose File" }),
                type: "file",
                required: true,
                fileMaxSize: 1024 * 1024 * 2,
                fileTarget: "product-item-image",
                fileTemplate: "product",
                fileType: [FileType.Jpeg, FileType.Png],
              },
            ]}
            formData={formData}
            onChange={(key, val) =>
              setFormData((prev) => ({ ...prev, [key]: val }))
            }
          />

          <Button
            className="w-full mt-8 h-11 rounded-xl shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40 transition-all font-bold"
            onClick={handleUpload}
            disabled={!formData.image || loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>
                  {language({ id: "Mengunggah...", en: "Uploading..." })}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <IconComponent iconName="Hi/HiOutlineUpload" size={18} />
                <span>{language({ id: "Simpan Foto", en: "Save Photo" })}</span>
              </div>
            )}
          </Button>
        </div>

        <div className="mt-auto pt-6">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-dark-600/40 text-dark-400 hover:bg-dark-800 hover:text-foreground transition-all text-xs font-semibold"
            onClick={onClose}
          >
            {language({ id: "Selesai & Tutup", en: "Done & Close" })}
          </Button>
        </div>
      </div>
    </div>
  );
};
