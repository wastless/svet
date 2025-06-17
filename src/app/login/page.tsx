"use client";

import * as Button from "~/components/ui/button";
import * as Input from "~/components/ui/input-login";
import * as Label from "~/components/ui/label";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as Hint from "~/components/ui/hint";
import { authenticate } from "~/app/actions/auth";
import { useAuth } from "~/components/providers/auth-provider";
import { invalidateAllCache } from "@/utils/patches/unified-fetch-patch";

export default function LoginPage() {
  const router = useRouter();
  const { update } = useSession();
  const { invalidateSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await authenticate(formData);
      if (result?.success) {
        // Очищаем все кеши перед обновлением
        invalidateAllCache();
        
        console.log("🔐 Аутентификация успешна, обновляем состояние сеанса...");
        
        // Успешная авторизация - обновляем сессию
        await update(); // Обновляем сессию через next-auth
        
        // Инвалидируем кеш сессии, чтобы получить новые данные
        invalidateSession();
        
        // Убеждаемся, что сеанс был правильно установлен, прежде чем перенаправить пользователя
        setTimeout(() => {
          console.log("🔄 Перенаправление после успешной аутентификации");
          
          if (formData.get("username") === "admin") {
            // Если это админ, перенаправляем в админку
            router.push("/admin");
          } else {
            // Всех остальных на главную
            router.push("/");
          }
          
          router.refresh(); // Принудительно обновляем страницу для получения новой сессии
        }, 500); // Небольшая задержка для установки куков
      } else if (result) {
        // Есть ошибки - показываем их
        const { success, ...errorFields } = result;
        setErrors(errorFields);
      }
    } catch (error) {
      console.error("Ошибка аутентификации:", error);
      setErrors({ error: "Что-то пошло не так при авторизации" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <main className="h-full w-full bg-bg-white-0 px-4 md:px-6 lg:px-8 flex flex-col">
        {/* Заголовок в верхней части */}
        <div className="flex justify-center pt-24 md:pt-20 lg:pt-24">
          <h4 className="text-center font-founders text-title-h4 text-text-strong-950">
            LESYA
            <br />
            LOG IN
          </h4>
        </div>

        {/* Форма по центру */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md px-4 sm:px-0">
            <form
              id="login-form"
              action={handleSubmit}
              className="flex flex-col gap-4 w-full"
              noValidate
            >
              <div className="flex flex-col gap-5 sm:gap-6">
                <div className="flex flex-col gap-2">
                  <Label.Root htmlFor="username">username</Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="lesya.svet"
                        required
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>

                <div className="flex flex-col gap-2">
                  <Label.Root htmlFor="password">password</Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1"
                      >
                        <Input.Icon
                          as={showPassword ? RiEyeOffLine : RiEyeLine}
                        />
                      </button>
                    </Input.Wrapper>
                  </Input.Root>
                </div>
              </div>

              {(errors.username ?? errors.password ?? errors.error) && (
                <Hint.Root hasError>
                  {errors.username ?? errors.password ?? errors.error}
                </Hint.Root>
              )}
            </form>
          </div>
        </div>

        {/* Пустое пространство для нижней части */}
        <div className="h-[15vh]"></div>
      </main>

      {/* Кнопка фиксирована к viewport */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="pointer-events-auto absolute bottom-12 sm:bottom-8 left-1/2 -translate-x-1/2">
          <Button.Root type="submit" form="login-form" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </Button.Root>
        </div>
      </div>
    </div>
  );
}
