import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { I18nProvider } from "@/hooks/useI18n";
import { PaiUpdateNotice } from "@/components/PaiUpdateNotice";
import { PaiKeyboardInset } from "@/components/PaiKeyboardInset";
import { PaiDragDismissesKeyboard } from "@/components/PaiDragDismissesKeyboard";
import { PaiTerminalKeyboard } from "@/components/PaiTerminalKeyboard";

export default function Home() {
  return (
    <Suspense>
      <I18nProvider>
        <AppShell />
        <PaiUpdateNotice />
        <PaiKeyboardInset />
        <PaiDragDismissesKeyboard />
        <PaiTerminalKeyboard />
      </I18nProvider>
    </Suspense>
  );
}
