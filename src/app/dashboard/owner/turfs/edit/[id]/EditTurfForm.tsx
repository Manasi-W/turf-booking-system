"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, IndianRupee, Loader2, Image as ImageIcon, Plus, Trash2, Link as LinkIcon } from "lucide-react";

interface Turf {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
  sportType: string;
  description: string | null;
  images: string | null;
  active: boolean;
}

export default function EditTurfForm({ turf }: { turf: Turf }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(
    turf.images ? turf.images.split(',') : []
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const addImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      location: formData.get("location"),
      pricePerHour: parseFloat(formData.get("pricePerHour") as string),
      sportType: formData.get("sportType"),
      description: formData.get("description"),
      images: images.length > 0 ? images.join(",") : null,
      active: formData.get("active") === "on",
    };

    try {
      const res = await fetch(`/api/turfs/${turf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update turf");

      router.refresh();
      // Show success somehow? Maybe just relying on refresh for now.
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-turf-dark ml-1">Turf Name</label>
          <input 
            name="name" 
            required 
            defaultValue={turf.name}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-turf-dark ml-1">Sport Type</label>
          <select 
            name="sportType" 
            required 
            defaultValue={turf.sportType}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all appearance-none"
          >
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
            <option value="Badminton">Badminton</option>
            <option value="Tennis">Tennis</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-turf-dark ml-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              name="location" 
              required 
              defaultValue={turf.location}
              className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-turf-dark ml-1">Price Per Hour (₹)</label>
          <div className="relative">
            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              name="pricePerHour" 
              type="number" 
              required 
              defaultValue={turf.pricePerHour}
              className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-turf-dark ml-1">Description</label>
        <textarea 
          name="description" 
          rows={4} 
          defaultValue={turf.description || ""}
          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
        ></textarea>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div>
          <h3 className="text-lg font-black text-turf-dark flex items-center gap-2 mb-1">
            <ImageIcon size={20} className="text-turf-green" /> Image Gallery
          </h3>
          <p className="text-sm text-muted-foreground ml-1">Add URLs to high-quality images of your turf.</p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-grow">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImage();
                }
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full pl-11 pr-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addImage}
            className="px-6 py-3 bg-turf-dark text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        {images.length > 0 && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
             {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-[4/3]">
                   <img src={img} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg transform hover:scale-105"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                   {idx === 0 && (
                     <div className="absolute top-2 left-2 px-2 py-1 bg-turf-green text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">
                        Primary
                     </div>
                   )}
                </div>
             ))}
           </div>
        )}
      </div>

      <div className="flex items-center gap-3 ml-1">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" name="active" defaultChecked={turf.active} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-turf-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-turf-green"></div>
          <span className="ml-3 text-sm font-bold text-turf-dark">Listing Active</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-turf-green text-white font-black rounded-2xl shadow-xl shadow-turf-green/20 hover:bg-turf-dark transition-all transform hover:-translate-y-1 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
