const messages = {
  es: {
    appTitle: "VERIK - Verificación Documental",
    ingestTitle: "Ingesta de documentos base",
    verifyTitle: "Verificación de documento",
    dashboardTitle: "Dashboard de verificación"
  }
} as const;

export type Locale = keyof typeof messages;

export function t<K extends keyof (typeof messages)["es"]>(key: K, locale: Locale = "es"): string {
  return messages[locale][key];
}
