"use client";

import { useState, useCallback } from "react";
import { GiftEditor } from "~/components/admin/gift-editor";
import { GiftList } from "~/components/admin/gift-list";
import { GiftCreationWizard } from "~/components/admin/gift-creation-wizard";
import type { Gift } from "@/utils/types/gift";
import { useGifts, useDeleteGift, useCreateGift, useUpdateGift } from "@/utils/hooks/useGiftQueries";
import { FullScreenLoader } from "~/components/ui/spinner";

export default function AdminPage() {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Получаем список подарков с использованием React Query
  const { data: gifts, isLoading } = useGifts();
  
  // Получаем мутации для операций с подарками
  const deleteGiftMutation = useDeleteGift();
  const createGiftMutation = useCreateGift();
  
  // Always call the hook with a dummy ID, but use it conditionally
  const dummyId = "placeholder-id";
  const updateGiftMutation = useUpdateGift(dummyId);
  
  // Create a wrapper function to handle the update mutation
  const updateGift = useCallback(async (id: string, giftData: any) => {
    const response = await fetch(`/api/gifts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(giftData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Ошибка при обновлении подарка");
    }
    
    return response.json();
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
      await deleteGiftMutation.mutateAsync(giftId);
    } catch (error) {
      console.error("Ошибка удаления подарка:", error);
      alert("Ошибка при удалении подарка");
    }
  };

  const handleSaveGift = async (giftData: any) => {
    try {
      if (selectedGift) {
        // Обновление существующего подарка
        if (selectedGift.id) {
          // Use our custom update function instead of the mutation directly
          await updateGift(selectedGift.id, giftData);
          // Manually invalidate queries after update
          updateGiftMutation.reset();
        }
        
        // Выходим из режима редактирования
        setIsEditing(false);
        setSelectedGift(null);
      } else {
        // Создание нового подарка
        const savedGift = await createGiftMutation.mutateAsync(giftData);
        
        // Если успешно создали, переходим к редактированию
        if (savedGift) {
          setSelectedGift(savedGift);
          setIsCreating(false);
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Ошибка сохранения подарка:", error);
      alert(`Ошибка при сохранении подарка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedGift(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  // Показываем лоадер, пока загружаются данные
  if (isLoading) {
    return <FullScreenLoader />;
  }

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
            gifts={gifts || []}
            onCreateGift={handleCreateGift}
            onEditGift={handleEditGift}
            onDeleteGift={handleDeleteGift}
          />
        )}
      </div>
    </div>
  );
}
