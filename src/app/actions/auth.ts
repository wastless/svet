"use server";

import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "~/server/auth";
import { AuthError } from "next-auth";
import { signInSchema } from "~/schemas";

export async function signout() {
  await signOut({ redirectTo: '/' });
}

export async function authenticate(formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Валидация данных
    const validatedFields = signInSchema.safeParse({ username, password });
    if (!validatedFields.success) {
      return { error: "WTF? Incorrect form data!" };
    }

    // Проверка существования пользователя в базе данных
    const user = await db.user.findUnique({ where: { username } });
    if (!user?.password) {
      return { username: "You got it mixed up. Are you sure you're Lesya?" };
    }

    // Проверка правильности пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { password: "Mmm, a taste of error..." };
    }

    // Выполнение входа в систему
    const result: { error?: string } = await signIn("credentials", { 
      username, 
      password,
      redirect: false 
    });

    if (result?.error) {
      return { error: "Authentication failed" };
    }

    // Возвращаем успех, чтобы клиент мог обработать перенаправление
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      const errorMessage =
        error.type === "CredentialsSignin"
          ? "Who are you, warrior?"
          : "The error is 500 shades of LESYA. Try again.";
      return { error: errorMessage };
    }
    throw error; // Пробрасываем неизвестные ошибки дальше
  }
}
