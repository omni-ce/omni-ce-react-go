import React, { useState, useEffect } from "react";
import type { ProductItem } from "@/types/product";
import DynamicForm, { FileType } from "@/components/DynamicForm";
import { Button } from "@/components/ui/Button";
import { useLanguageStore } from "@/stores/languageStore";
import { IconComponent } from "@/components/ui/IconSelector";
import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";

interface ItemImage {
  id: string;
  url: string;
  is_primary: boolean;
}

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
  const [images, setImages] = useState<ItemImage[]>([]);

  const fetchImages = async () => {
    try {
      const res = await satellite.get<Response<{ rows: ItemImage[] }>>(
        `/api/product/item/image/list/${row.id}`,
      );
      if (res.data.status === 200) {
        setImages(res.data.data.rows);
      }
    } catch (e) {
      console.error("Failed to fetch images:", e);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [row.id]);

  const handleUpload = async () => {
    if (!formData.image) return;
    setLoading(true);
    try {
      const res = await satellite.post(`/api/product/item/image/set/${row.id}`, {
        url: formData.image as string,
      });
      if (res.data.status === "OK") {
        await fetchImages();
        setFormData({});
      }
    } catch (e) {
      console.error("Failed to upload image:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await satellite.delete(`/api/product/item/image/remove/${id}`);
      if (res.data.status === "OK") {
        await fetchImages();
      }
    } catch (e) {
      console.error("Failed to delete image:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    setLoading(true);
    try {
      const res = await satellite.patch(
        `/api/product/item/image/set-primary/${id}`,
      );
      if (res.data.status === "OK") {
        await fetchImages();
      }
    } catch (e) {
      console.error("Failed to set primary image:", e);
    } finally {
      setLoading(false);
    }
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
              {row.brand_name} {row.varian_name}{" "}
              <span className="font-semibold">({row.memory_name})</span>{" "}
              <span className="text-primary-500 font-semibold">
                ({row.color_name})
              </span>
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-dark-800 border border-dark-600/40 rounded-full text-dark-300">
            {images.length} {language({ id: "Foto", en: "Photos" })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-120">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative h-44 rounded-2xl border border-dark-600 bg-dark-900 overflow-hidden hover:border-accent-500/50 transition-all duration-300 shrink-0"
            >
              <img
                src={img.url}
                alt="Product"
                className="w-full h-full object-cover"
              />

              {/* Primary Badge */}
              {img.is_primary && (
                <div className="absolute top-3 left-3">
                  <span className="bg-accent-500 text-white text-[9px] px-2 py-0.5 rounded-md font-black tracking-tighter shadow-lg border border-white/20">
                    PRIMARY
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2">
                {!img.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className="w-8 h-8 rounded-xl bg-dark-900/90 backdrop-blur-md text-white flex items-center justify-center hover:bg-accent-500 hover:scale-110 transition-all shadow-xl border border-white/10"
                    title="Set as primary"
                  >
                    <IconComponent iconName="Hi/HiOutlineStar" size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="w-8 h-8 rounded-xl bg-dark-900/90 backdrop-blur-md text-white flex items-center justify-center hover:bg-neon-red hover:scale-110 transition-all shadow-xl border border-white/10"
                  title="Delete image"
                >
                  <IconComponent iconName="Hi/HiOutlineTrash" size={16} />
                </button>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-2 py-24 flex flex-col items-center justify-center text-dark-400 border-2 border-dashed border-dark-600/30 rounded-3xl bg-dark-900/30">
              <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
                <IconComponent
                  iconName="Hi/HiOutlinePhotograph"
                  size={32}
                  className="opacity-30"
                />
              </div>
              <p className="text-sm font-medium">
                {language({
                  id: "Belum ada foto",
                  en: "No images uploaded yet",
                })}
              </p>
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
            {language({
              id: "Pilih foto berkualitas tinggi untuk produk Anda. Ukuran maksimal 2MB.",
              en: "Select a high-quality photo for your product. Max size 2MB.",
            })}
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
