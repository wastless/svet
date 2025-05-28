"use client";

import { useState, useEffect } from "react";
import { GiftEditor } from "~/components/admin/gift-editor";
import { GiftList } from "~/components/admin/gift-list";
import { GiftCreationWizard } from "~/components/admin/gift-creation-wizard";
import type { Gift } from "@/utils/types/gift";

export default function AdminPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка списка подарков
  const loadGifts = async () => {
    try {
      const response = await fetch("/api/gifts");
      if (response.ok) {
        const data = await response.json();
        setGifts(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки подарков:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const handleCreateGift = () => {
    setIsCreating(true);
  };

  const handleEditGift = (gift: Gift) => {
    setSelectedGift(gift);
    setIsEditing(true);
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот подарок?")) {
      return;
    }

    try {
      const response = await fetch(`/api/gifts/${giftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGifts(gifts.filter(gift => gift.id !== giftId));
      } else {
        alert("Ошибка при удалении подарка");
      }
    } catch (error) {
      console.error("Ошибка удаления подарка:", error);
      alert("Ошибка при удалении подарка");
    }
  };

  const handleSaveGift = async (giftData: any) => {
    try {
      const isUpdate = selectedGift !== null;
      const url = isUpdate ? `/api/gifts/${selectedGift.id}` : "/api/gifts";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(giftData),
      });

      if (response.ok) {
        const savedGift = await response.json();
        await loadGifts(); // Перезагружаем список
        
        if (!isUpdate) {
          // Если создавали новый подарок, переходим к его редактированию
          setSelectedGift(savedGift);
          setIsCreating(false);
          setIsEditing(true);
        } else {
          // Если обновляли существующий, выходим из редактирования
          setIsEditing(false);
          setSelectedGift(null);
        }
      } else {
        const error = await response.json();
        alert(`Ошибка сохранения: ${error.error}`);
      }
    } catch (error) {
      console.error("Ошибка сохранения подарка:", error);
      alert("Ошибка при сохранении подарка");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedGift(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-bg-white-0">
      <div className="container mx-auto">
        {/* Заголовок в верхней части */}
        <div className="flex justify-center pt-[100px] pb-10">
          <h4 className="text-center font-founders text-title-h4 text-text-strong-950">
            ADMIN <br /> PANEL
          </h4>
        </div>

        {isCreating ? (
          <GiftCreationWizard
            onSave={handleSaveGift}
            onCancel={handleCancelCreate}
            onSuccess={() => {
              setIsCreating(false);
              loadGifts();
            }}
          />
        ) : isEditing ? (
          <GiftEditor
            gift={selectedGift}
            onSave={handleSaveGift}
            onCancel={handleCancelEdit}
          />
        ) : (
          <GiftList
            gifts={gifts}
            onCreateGift={handleCreateGift}
            onEditGift={handleEditGift}
            onDeleteGift={handleDeleteGift}
          />
        )}
      </div>
    </div>
  );
}
