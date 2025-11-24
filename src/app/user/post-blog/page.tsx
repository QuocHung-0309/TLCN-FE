"use client";
import MediaUpload from "./MediaUpload";
import PostForm from "./PostForm";
import CategoryTagsForm from "./CategoryTagsForm";
import PostPrivacySettings from "./PostPrivacySettings";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { FiX, FiSave } from "react-icons/fi";
import Image from "next/image";
import { LuSend } from "react-icons/lu";
import CoverUpload from "./CoverUpload";
import { blogApi } from "@/lib/blog/blogApi";

export default function PostBlogPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [showSettings, setShowSettings] = useState(false);

  // preview
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [cover, setCover] = useState<string | null>(null);

  // files thật để upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [wardId, setWardId] = useState("");
  const [wardName, setWardName] = useState("");

  const [address, setAddress] = useState("");

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    const draft = localStorage.getItem("blogDraft");
    if (draft) {
      const data = JSON.parse(draft);
      setTitle(data.title || "");
      setContent(data.content || "");
      setImages(data.images || []);
      setVideos(data.videos || []);
      setCategories(data.categories || []);
      setTags(data.tags || []);
      setAddress(data.address || "");
      setWardId(data.wardId || "");
      setWardName(data.wardName || "");
      setCover(data.cover || null);
    }
  }, []);

  const saveDraft = useCallback((showAlert = true) => {
    const draft = {
      title,
      content,
      images,
      videos,
      categories,
      tags,
      wardId,
      wardName,
      address,
      cover,
    };
    localStorage.setItem("blogDraft", JSON.stringify(draft));
    console.log("Draft autosaved ✅");
    if (showAlert) alert("Đã lưu nháp");
  }, [title, content, images, videos, categories, tags, wardId, wardName, address, cover]);

  //Auto-save mỗi khi có thay đổi
  useEffect(() => {
    if (!authChecked) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveDraft(false);
    }, 500); // chờ 0.5s sau khi ngừng gõ/đổi state mới lưu
  }, [saveDraft, authChecked]);

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

  const handleImageFiles = async (files: File[]) => {
    setImageFiles((prev) => [...prev, ...files]);
    const urls = await Promise.all(files.map((file) => readFileAsDataURL(file)));
    setImages((prev) => [...prev, ...urls]);
  };

  const handleVideoFiles = async (files: File[]) => {
    setVideoFiles((prev) => [...prev, ...files]);
    const urls = await Promise.all(files.map((file) => readFileAsDataURL(file)));
    setVideos((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCoverChange = (file: File) => {
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) setCover(reader.result.toString());
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("privacy", privacy);
      formData.append("ward", wardId);

      // ✅ đổi address -> locationDetail
      if (address.trim()) {
        formData.append("locationDetail", address);
      }

      // ✅ gửi mảng categories
      categories.forEach((c, i) => {
        formData.append(`categories[${i}]`, c);
      });

      // ✅ gửi mảng tags
      tags.forEach((t, i) => {
        formData.append(`tags[${i}]`, t);
      });

      // ✅ gửi content là array object
      if (content.trim()) {
        formData.append("content[0][type]", "text");
        formData.append("content[0][value]", content);
      }

      // ✅ files
      if (coverFile) formData.append("files", coverFile);
      imageFiles.forEach((file) => formData.append("files", file));
      videoFiles.forEach((file) => formData.append("files", file));

      const res = await blogApi.createBlog(formData);
      console.log("✅ Blog created:", res);

      alert("Đăng bài thành công!");
      localStorage.removeItem("blogDraft");
      router.push("/user/blog");
    } catch (error: any) {
      console.error("❌ Error create blog:", error.response?.data || error);
      alert("Đăng bài thất bại!");
    }
  };

  if (!authChecked) {
    return <p className="text-center mt-10">Đang kiểm tra đăng nhập...</p>;
  }

  return (
    <main className="relative overflow-hidden">
      {/* blur */}
      <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '200px', left: '-240px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '500px', left: '1200px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '1100px', left: '-60px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '2000px', left: '1300px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none z-0" style={{ top: '2500px', left: '-60px' }} />
      
      <Image
        src="/city-bg.svg"
        alt="city-bg"
        width={355}
        height={216}
        className="absolute left-[-100px] top-[100px] z-0 pointer-events-none w-[200px] sm:w-[250px] md:w-[300px] lg:w-[355px] h-auto"
      />
      <Image
        src="/Graphic_Elements.svg"
        alt="Graphic_Elements"
        width={192}
        height={176}
        className="absolute left-[1420px] top-[875px] z-0 pointer-events-none w-[100px] sm:w-[140px] md:w-[160px] lg:w-[192px] h-auto"
      />
      <Image
        src="/Graphic_Elements.svg"
        alt="Graphic_Elements"
        width={192}
        height={176}
        className="absolute left-[1420px] top-[2800px] z-0 pointer-events-none w-[100px] sm:w-[140px] md:w-[160px] lg:w-[192px] h-auto"
      />
      
      <div className="relative z-10 max-w-4xl mx-auto mt-6 space-y-6 px-4 lg:px-0">
        <CoverUpload
          cover={cover}
          onCoverChange={handleCoverChange}
          onRemove={() => {
            setCover(null);
            setCoverFile(null);
          }}
        />
        <div>
          <PostForm
            title={title}
            content={content}
            privacy={privacy}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onPrivacyClick={() => setShowSettings(true)}
          />

          {showSettings && (
            <PostPrivacySettings
              value={privacy}
              onChange={(val) => setPrivacy(val)}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>

        <MediaUpload
          images={images}
          videos={videos}
          onImagesChange={handleImageFiles}
          onVideosChange={handleVideoFiles}
          removeImage={removeImage}
          removeVideo={removeVideo}
        />

        <CategoryTagsForm
          categories={categories}
          tags={tags}
          address={address}
          wardId={wardId}
          wardName={wardName}
          onCategoriesChange={setCategories}
          onTagsChange={setTags}
          onAddressChange={setAddress}
          onWardChange={(id, name) => {
            setWardId(id);
            setWardName(name);
          }}
        />

        <div className="flex justify-center space-x-4 mt-8 mb-12">
          <Button
            variant="outline-secondary"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl border border-[var(--gray-3)] text-[var(--gray-1)] hover:bg-[var(--gray-5)]"
          >
            <FiX /> Hủy
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => saveDraft(true)}
            className="flex items-center gap-2 rounded-xl border border-[var(--gray-3)] text-[var(--gray-1)] hover:bg-[var(--gray-5)]"
          >
            <FiSave /> Lưu nháp
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl"
          >
            <LuSend /> Đăng bài
          </Button>
        </div>
      </div>
    </main>
  );
}
