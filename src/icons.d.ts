/// <reference types="unplugin-icons/types/react" />

declare module 'virtual:icons' {
  const icons: Record<string, { body: string; width: number; height: number }>;
  export default icons;
}
