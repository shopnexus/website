"use server";

import { cookies } from "next/headers";

export async function setAuthCookies(accessToken: string, refreshToken: string, expiresIn: number) {
  const cookieStore = await cookies();
  
  cookieStore.set("access_token", accessToken, {
    maxAge: expiresIn,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, 
  });
  
  cookieStore.set("refresh_token", refreshToken, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
