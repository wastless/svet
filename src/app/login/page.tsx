"use client";

import * as Button from "~/components/ui/button";
import { Navigation } from "~/components/navigation";
import * as Input from "~/components/ui/input";
import * as Label from "~/components/ui/label";
import {
    RiEyeLine,
    RiEyeOffLine,
  } from '@remixicon/react';
import { useState } from "react";
import * as Hint from "~/components/ui/hint";
import { authenticate } from "~/app/actions/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await authenticate(formData);
      if (result) {
        setErrors(result);
      }
    } catch (error) {
      setErrors({ error: "Что-то пошло не так" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Navigation />

      <main className="bg-bg-white-0 min-h-screen">
        {/* Заголовок в верхней части */}
        <div className="pt-[100px] flex justify-center">
          <h4 className="text-text-strong-950 text-title-h4 text-center font-founders">
            LESYA
            <br />
            LOG IN
          </h4>
        </div>

        {/* Форма по центру относительно всей высоты экрана */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <form id="login-form" action={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-6">
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
                      <Input.Icon as={showPassword ? RiEyeOffLine : RiEyeLine} />
                    </button>
                  </Input.Wrapper>
                </Input.Root>
              </div>
              </div>

              {(errors.username || errors.password || errors.error) && (
                <Hint.Root hasError>
                  {errors.username || errors.password || errors.error}
                </Hint.Root>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Кнопка фиксирована к viewport */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
          <Button.Root type="submit" form="login-form" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </Button.Root>
        </div>
      </div>
    </div>
  );
}
