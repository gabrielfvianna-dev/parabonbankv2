import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Permite configurar um endereço fixo quando necessário (por exemplo, produção).
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

// Durante o desenvolvimento, reutiliza o host que o Expo Go usa para carregar
// o aplicativo. Assim, a troca de rede Wi-Fi não exige editar este arquivo.
const getApiUrl = () => {
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/+$/, "");
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost;

  const host = hostUri?.split(":")[0];

  if (host) {
    return `http://${host}:3000`;
  }

  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  return null;
};

const API_URL = getApiUrl();

export async function apiRequest(endpoint, options = {}) {
  if (!API_URL) {
    throw new Error(
      "Não foi possível identificar o endereço do backend. " +
        "Inicie o Expo no modo LAN e abra o aplicativo na mesma rede Wi-Fi " +
        "do computador."
    );
  }

  const token = await SecureStore.getItemAsync("parabon_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Não foi possível concluir a solicitação.");
  }

  return data;
}

export async function saveToken(token) {
  await SecureStore.setItemAsync("parabon_token", token);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync("parabon_token");
}
